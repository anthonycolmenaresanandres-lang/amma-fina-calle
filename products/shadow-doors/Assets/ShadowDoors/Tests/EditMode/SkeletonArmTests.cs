using NUnit.Framework;
using ShadowDoors.Runtime;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Envelope contract for the skeleton-arm scare:
    /// SkeletonArm.ReachAmountAt(t) — 0 at/before 0, ease-out to exactly 1 at
    /// ReachInSeconds, 1 through the hold, back to 0 by the end of the retract,
    /// 0 after; monotone reach then monotone withdraw, always in [0, 1].
    /// </summary>
    public class SkeletonArmTests
    {
        private const float HoldEnd = SkeletonArm.ReachInSeconds + SkeletonArm.HoldSeconds;
        private const float TimelineEnd = HoldEnd + SkeletonArm.RetractSeconds;

        [Test]
        public void Reach_ZeroAtAndBeforeStart()
        {
            Assert.AreEqual(0f, SkeletonArm.ReachAmountAt(0f));
            Assert.AreEqual(0f, SkeletonArm.ReachAmountAt(-1f));
        }

        [Test]
        public void Reach_FullyExtendedThroughTheHold()
        {
            Assert.AreEqual(1f, SkeletonArm.ReachAmountAt(SkeletonArm.ReachInSeconds), 1e-4f);
            Assert.AreEqual(1f, SkeletonArm.ReachAmountAt(HoldEnd - 0.01f), 1e-4f);
        }

        [Test]
        public void Reach_WithdrawnAfterTheRetract()
        {
            Assert.AreEqual(0f, SkeletonArm.ReachAmountAt(TimelineEnd), 1e-4f);
            Assert.AreEqual(0f, SkeletonArm.ReachAmountAt(TimelineEnd + 5f), 1e-4f);
        }

        [Test]
        public void Reach_MonotoneInThenMonotoneOut()
        {
            float previous = -1f;
            for (float t = -0.1f; t <= HoldEnd; t += 0.005f)
            {
                float value = SkeletonArm.ReachAmountAt(t);
                Assert.GreaterOrEqual(value, previous, "the reach must never pull back early");
                Assert.That(value, Is.InRange(0f, 1f));
                previous = value;
            }

            previous = 2f;
            for (float t = HoldEnd; t <= TimelineEnd + 0.5f; t += 0.005f)
            {
                float value = SkeletonArm.ReachAmountAt(t);
                Assert.LessOrEqual(value, previous, "the withdraw must never lunge again");
                Assert.That(value, Is.InRange(0f, 1f));
                previous = value;
            }
        }
    }
}
