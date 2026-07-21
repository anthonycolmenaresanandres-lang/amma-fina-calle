using NUnit.Framework;
using ShadowDoors.Runtime;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Envelope contract for the eyes-only apparition:
    /// WatcherEyes.GlowFractionAt(t) — 0 at/before 0, smoothstep to 1 at
    /// FadeInSeconds, 1 through the hold, back to 0 by the end of the fade-out,
    /// 0 after; monotone rise then monotone fall, always in [0, 1].
    /// </summary>
    public class WatcherEyesTests
    {
        private const float HoldEnd = WatcherEyes.FadeInSeconds + WatcherEyes.HoldSeconds;
        private const float TimelineEnd = HoldEnd + WatcherEyes.FadeOutSeconds;

        [Test]
        public void Glow_ZeroAtAndBeforeStart()
        {
            Assert.AreEqual(0f, WatcherEyes.GlowFractionAt(0f));
            Assert.AreEqual(0f, WatcherEyes.GlowFractionAt(-1f));
        }

        [Test]
        public void Glow_FullThroughTheStare()
        {
            Assert.AreEqual(1f, WatcherEyes.GlowFractionAt(WatcherEyes.FadeInSeconds), 1e-4f);
            Assert.AreEqual(1f, WatcherEyes.GlowFractionAt(HoldEnd - 0.01f), 1e-4f);
        }

        [Test]
        public void Glow_GoneAfterTheFadeOut()
        {
            Assert.AreEqual(0f, WatcherEyes.GlowFractionAt(TimelineEnd), 1e-4f);
            Assert.AreEqual(0f, WatcherEyes.GlowFractionAt(TimelineEnd + 5f), 1e-4f);
        }

        [Test]
        public void Glow_MonotoneRiseThenMonotoneFall()
        {
            float previous = -1f;
            for (float t = -0.1f; t <= HoldEnd; t += 0.005f)
            {
                float value = WatcherEyes.GlowFractionAt(t);
                Assert.GreaterOrEqual(value, previous, "the stare must never dim while appearing");
                Assert.That(value, Is.InRange(0f, 1f));
                previous = value;
            }

            previous = 2f;
            for (float t = HoldEnd; t <= TimelineEnd + 0.5f; t += 0.005f)
            {
                float value = WatcherEyes.GlowFractionAt(t);
                Assert.LessOrEqual(value, previous, "the fade-out must never re-brighten");
                Assert.That(value, Is.InRange(0f, 1f));
                previous = value;
            }
        }
    }
}
