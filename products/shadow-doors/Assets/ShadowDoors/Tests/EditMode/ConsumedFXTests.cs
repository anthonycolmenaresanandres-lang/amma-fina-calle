using NUnit.Framework;
using ShadowDoors.Runtime;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Envelope contract for the consumed-by-darkness iris close:
    /// ConsumedFX.CloseAmountAt(t) — 0 until CloseStartSeconds, cubic ease-in to exactly 1
    /// at BlackCompleteSeconds, clamped at 1 afterwards, and monotone throughout.
    /// </summary>
    public class ConsumedFXTests
    {
        [Test]
        public void CloseAmount_ZeroBeforeCloseStart()
        {
            Assert.AreEqual(0f, ConsumedFX.CloseAmountAt(0f));
            Assert.AreEqual(0f, ConsumedFX.CloseAmountAt(ConsumedFX.CloseStartSeconds));
            Assert.AreEqual(0f, ConsumedFX.CloseAmountAt(-1f));
        }

        [Test]
        public void CloseAmount_ReachesFullBlackAtBlackComplete_AndStaysThere()
        {
            Assert.AreEqual(1f, ConsumedFX.CloseAmountAt(ConsumedFX.BlackCompleteSeconds), 1e-4f);
            Assert.AreEqual(1f, ConsumedFX.CloseAmountAt(ConsumedFX.BlackCompleteSeconds + 0.5f), 1e-4f);
            Assert.AreEqual(1f, ConsumedFX.CloseAmountAt(ConsumedFX.CardTimeSeconds), 1e-4f);
        }

        [Test]
        public void CloseAmount_CubicEaseIn_SlowCreepThenFastSwallow()
        {
            // Cubic: at the halfway point of the window the close amount is 0.125 —
            // most of the swallow happens in the back half (the design intent).
            float midpoint = (ConsumedFX.CloseStartSeconds + ConsumedFX.BlackCompleteSeconds) * 0.5f;
            Assert.AreEqual(0.125f, ConsumedFX.CloseAmountAt(midpoint), 1e-3f);
        }

        [Test]
        public void CloseAmount_IsMonotone()
        {
            float previous = -1f;
            for (float t = -0.2f; t <= ConsumedFX.CardTimeSeconds + 0.5f; t += 0.01f)
            {
                float value = ConsumedFX.CloseAmountAt(t);
                Assert.GreaterOrEqual(value, previous, "close amount must never re-open");
                Assert.That(value, Is.InRange(0f, 1f));
                previous = value;
            }
        }
    }
}
