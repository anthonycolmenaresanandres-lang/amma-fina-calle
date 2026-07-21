using NUnit.Framework;
using ShadowDoors.Runtime;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Grab-then-vanish contract (Anthony 2026-07-21: "as if it grabbed the player and
    /// then disappears"). ReachAmountAt(t) — 0 → 1 over the snatch, then PINNED at 1
    /// (the hand stays at the grab, never travels back). VanishAt(t) — 1 through
    /// snatch+hold, then a fast collapse to 0 over RetractSeconds; the hand disappears
    /// in place rather than withdrawing.
    /// </summary>
    public class SkeletonArmTests
    {
        private const float HoldEnd = SkeletonArm.ReachInSeconds + SkeletonArm.HoldSeconds;
        private const float TimelineEnd = HoldEnd + SkeletonArm.RetractSeconds;

        [Test]
        public void Reach_ZeroAtStart_SnatchesToOne_ThenStaysPinned()
        {
            Assert.AreEqual(0f, SkeletonArm.ReachAmountAt(0f));
            Assert.AreEqual(0f, SkeletonArm.ReachAmountAt(-1f));
            Assert.AreEqual(1f, SkeletonArm.ReachAmountAt(SkeletonArm.ReachInSeconds), 1e-4f);
            Assert.AreEqual(1f, SkeletonArm.ReachAmountAt(HoldEnd), 1e-4f);
            Assert.AreEqual(1f, SkeletonArm.ReachAmountAt(TimelineEnd), 1e-4f, "the hand does not travel back");
        }

        [Test]
        public void Reach_MonotoneRise()
        {
            float previous = -1f;
            for (float t = -0.1f; t <= SkeletonArm.ReachInSeconds; t += 0.005f)
            {
                float v = SkeletonArm.ReachAmountAt(t);
                Assert.GreaterOrEqual(v, previous);
                Assert.That(v, Is.InRange(0f, 1f));
                previous = v;
            }
        }

        [Test]
        public void Vanish_FullThroughGrab_ThenCollapsesToZero()
        {
            Assert.AreEqual(1f, SkeletonArm.VanishAt(0f), 1e-4f);
            Assert.AreEqual(1f, SkeletonArm.VanishAt(HoldEnd - 0.001f), 1e-4f);
            Assert.AreEqual(0f, SkeletonArm.VanishAt(TimelineEnd), 1e-4f);
            Assert.AreEqual(0f, SkeletonArm.VanishAt(TimelineEnd + 5f), 1e-4f);
        }

        [Test]
        public void Vanish_MonotoneCollapse_AlwaysInRange()
        {
            float previous = 2f;
            for (float t = HoldEnd; t <= TimelineEnd + 0.5f; t += 0.005f)
            {
                float v = SkeletonArm.VanishAt(t);
                Assert.LessOrEqual(v, previous, "the vanish must never grow back");
                Assert.That(v, Is.InRange(0f, 1f));
                previous = v;
            }
        }
    }
}
