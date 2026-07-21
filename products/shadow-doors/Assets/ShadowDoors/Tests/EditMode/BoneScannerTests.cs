using NUnit.Framework;
using ShadowDoors.Runtime;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Envelope contracts for the bone scan:
    /// ScanAt(t) — 0 during reveal-in, 0→1 across the sweep, pinned 1 after.
    /// RevealAt(t) — 0 before start, smoothstep to 1, 1 through sweep+hold, back to 0
    /// by the end of the fade-out; monotone up then monotone down, always [0,1].
    /// </summary>
    public class BoneScannerTests
    {
        private const float SweepEnd = BoneScanner.RevealInSeconds + BoneScanner.SweepSeconds;
        private const float HoldEnd = SweepEnd + BoneScanner.HoldSeconds;

        [Test]
        public void Scan_ZeroUntilSweepThenReachesOne()
        {
            Assert.AreEqual(0f, BoneScanner.ScanAt(0f));
            Assert.AreEqual(0f, BoneScanner.ScanAt(BoneScanner.RevealInSeconds));
            Assert.AreEqual(1f, BoneScanner.ScanAt(SweepEnd), 1e-4f);
            Assert.AreEqual(1f, BoneScanner.ScanAt(SweepEnd + 5f), 1e-4f);
        }

        [Test]
        public void Scan_IsMonotone()
        {
            float previous = -1f;
            for (float t = 0f; t <= SweepEnd + 1f; t += 0.02f)
            {
                float v = BoneScanner.ScanAt(t);
                Assert.GreaterOrEqual(v, previous);
                Assert.That(v, Is.InRange(0f, 1f));
                previous = v;
            }
        }

        [Test]
        public void Reveal_ZeroAtEndsFullInMiddle()
        {
            Assert.AreEqual(0f, BoneScanner.RevealAt(0f));
            Assert.AreEqual(0f, BoneScanner.RevealAt(-1f));
            Assert.AreEqual(1f, BoneScanner.RevealAt(SweepEnd), 1e-4f);
            Assert.AreEqual(1f, BoneScanner.RevealAt(HoldEnd - 0.01f), 1e-4f);
            Assert.AreEqual(0f, BoneScanner.RevealAt(BoneScanner.TotalSeconds), 1e-4f);
            Assert.AreEqual(0f, BoneScanner.RevealAt(BoneScanner.TotalSeconds + 5f), 1e-4f);
        }

        [Test]
        public void Reveal_RisesThenFalls_AlwaysInRange()
        {
            float previous = -1f;
            for (float t = 0f; t <= HoldEnd; t += 0.02f)
            {
                float v = BoneScanner.RevealAt(t);
                Assert.GreaterOrEqual(v, previous, "reveal must not dim while appearing");
                Assert.That(v, Is.InRange(0f, 1f));
                previous = v;
            }
            previous = 2f;
            for (float t = HoldEnd; t <= BoneScanner.TotalSeconds + 0.5f; t += 0.02f)
            {
                float v = BoneScanner.RevealAt(t);
                Assert.LessOrEqual(v, previous, "reveal must not re-brighten while fading");
                Assert.That(v, Is.InRange(0f, 1f));
                previous = v;
            }
        }
    }
}
