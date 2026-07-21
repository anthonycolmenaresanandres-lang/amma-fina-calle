using NUnit.Framework;
using ShadowDoors.Runtime;
using UnityEngine;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// "Half out but it can't" contract for the floor graspers:
    /// FloorGrasper.EmergeHeightAt(t) starts fully submerged, rises to at most
    /// MaxEmergeFraction of the hand (never fully out), strains there, and sinks back
    /// below the floor. FloorGraspers spacing/spread helpers are pure too.
    /// </summary>
    public class FloorGrasperTests
    {
        private const float RiseEnd = FloorGrasper.RiseSeconds;
        private const float StrainEnd = RiseEnd + FloorGrasper.StrainSeconds;

        [Test]
        public void Emerge_StartsAndEndsSubmerged()
        {
            Assert.Less(FloorGrasper.EmergeHeightAt(0f), 0f, "starts under the floor");
            Assert.Less(FloorGrasper.EmergeHeightAt(FloorGrasper.TotalSeconds), 0f, "sinks back under");
        }

        [Test]
        public void Emerge_NeverFullyClearsTheFloor()
        {
            float peak = FloorGrasper.MaxEmergeFraction * FloorGrasper.HandHeightMeters;
            float max = float.MinValue;
            for (float t = 0f; t <= FloorGrasper.TotalSeconds; t += 0.02f)
            {
                max = Mathf.Max(max, FloorGrasper.EmergeHeightAt(t));
            }
            Assert.AreEqual(peak, max, 1e-3f, "it wants to but it can't — capped at the peak");
            Assert.Less(peak, FloorGrasper.HandHeightMeters, "peak is below the full hand height");
        }

        [Test]
        public void Emerge_StrainsAtThePeak()
        {
            float peak = FloorGrasper.MaxEmergeFraction * FloorGrasper.HandHeightMeters;
            Assert.AreEqual(peak, FloorGrasper.EmergeHeightAt(RiseEnd), 1e-4f);
            Assert.AreEqual(peak, FloorGrasper.EmergeHeightAt(StrainEnd - 0.01f), 1e-4f);
        }

        [Test]
        public void Interval_TightensTowardDawn()
        {
            Assert.AreEqual(FloorGraspers.IntervalStart, FloorGraspers.IntervalAt(0f), 1e-4f);
            Assert.AreEqual(FloorGraspers.IntervalEnd, FloorGraspers.IntervalAt(1f), 1e-4f);
            Assert.Less(FloorGraspers.IntervalAt(1f), FloorGraspers.IntervalAt(0f));
        }

        [Test]
        public void Offset_StaysWithinTheRing()
        {
            for (int i = 0; i < 40; i++)
            {
                float r = new Vector2(
                    FloorGraspers.OffsetForIndex(i, 1f).x,
                    FloorGraspers.OffsetForIndex(i, 1f).z).magnitude;
                Assert.That(r, Is.InRange(FloorGraspers.MinRadius - 1e-3f, FloorGraspers.SpreadRadius + 1e-3f));
            }
        }
    }
}
