using NUnit.Framework;
using ShadowDoors.Runtime;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Envelope contract for the breach portal:
    /// DarknessPortal.OpenAmountAt(t) — 0 at/before 0, smoothstep to exactly 1 at
    /// OpenSeconds, pinned at 1 through the hold, eased back to 0 by the end of the
    /// drain, 0 afterwards; monotone rise then monotone fall, always in [0, 1].
    /// </summary>
    public class DarknessPortalTests
    {
        private const float HoldEnd = DarknessPortal.OpenSeconds + DarknessPortal.HoldSeconds;
        private const float TimelineEnd = HoldEnd + DarknessPortal.DrainSeconds;

        [Test]
        public void OpenAmount_ZeroAtAndBeforeStart()
        {
            Assert.AreEqual(0f, DarknessPortal.OpenAmountAt(0f));
            Assert.AreEqual(0f, DarknessPortal.OpenAmountAt(-1f));
        }

        [Test]
        public void OpenAmount_FullyOpenThroughTheHold()
        {
            Assert.AreEqual(1f, DarknessPortal.OpenAmountAt(DarknessPortal.OpenSeconds), 1e-4f);
            Assert.AreEqual(1f, DarknessPortal.OpenAmountAt(HoldEnd - 0.01f), 1e-4f);
        }

        [Test]
        public void OpenAmount_DrainsToZeroAndStaysClosed()
        {
            Assert.AreEqual(0f, DarknessPortal.OpenAmountAt(TimelineEnd), 1e-4f);
            Assert.AreEqual(0f, DarknessPortal.OpenAmountAt(TimelineEnd + 5f), 1e-4f);
        }

        [Test]
        public void OpenAmount_MonotoneRiseThenMonotoneFall()
        {
            float previous = -1f;
            for (float t = -0.1f; t <= HoldEnd; t += 0.01f)
            {
                float value = DarknessPortal.OpenAmountAt(t);
                Assert.GreaterOrEqual(value, previous, "the bleed must never retreat while opening");
                Assert.That(value, Is.InRange(0f, 1f));
                previous = value;
            }

            previous = 2f;
            for (float t = HoldEnd; t <= TimelineEnd + 0.5f; t += 0.01f)
            {
                float value = DarknessPortal.OpenAmountAt(t);
                Assert.LessOrEqual(value, previous, "the drain must never re-open");
                Assert.That(value, Is.InRange(0f, 1f));
                previous = value;
            }
        }
    }
}
