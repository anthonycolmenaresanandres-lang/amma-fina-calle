using NUnit.Framework;
using ShadowDoors.Runtime;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Ramp contract for the evil-veil filter:
    /// EvilVeil.IntensityStep — asymmetric (fast in, slow out), always clamped to
    /// [0, 1], converges to 1 while present and back to 0 while absent.
    /// </summary>
    public class EvilVeilTests
    {
        [Test]
        public void Step_RampsUpWhilePresent_AndClampsAtOne()
        {
            float intensity = 0f;
            for (int i = 0; i < 120; i++)
            {
                float next = EvilVeil.IntensityStep(intensity, true, 1f / 60f);
                Assert.GreaterOrEqual(next, intensity);
                intensity = next;
            }
            Assert.AreEqual(1f, intensity, 1e-4f);
            Assert.AreEqual(1f, EvilVeil.IntensityStep(1f, true, 10f), "must clamp at 1");
        }

        [Test]
        public void Step_DrainsWhileAbsent_AndClampsAtZero()
        {
            float intensity = 1f;
            for (int i = 0; i < 300; i++)
            {
                float next = EvilVeil.IntensityStep(intensity, false, 1f / 60f);
                Assert.LessOrEqual(next, intensity);
                intensity = next;
            }
            Assert.AreEqual(0f, intensity, 1e-4f);
            Assert.AreEqual(0f, EvilVeil.IntensityStep(0f, false, 10f), "must clamp at 0");
        }

        [Test]
        public void Step_InIsFasterThanOut_TheAsymmetryIsTheDesign()
        {
            float up = EvilVeil.IntensityStep(0.5f, true, 0.1f) - 0.5f;
            float down = 0.5f - EvilVeil.IntensityStep(0.5f, false, 0.1f);
            Assert.Greater(up, down, "dread arrives faster than relief");
        }

        [Test]
        public void DisplayedIntensity_NightBaselineFloorsThePresenceRamp()
        {
            Assert.AreEqual(0.25f, EvilVeil.DisplayedIntensity(0f, 0.25f), 1e-5f);
            Assert.AreEqual(0.8f, EvilVeil.DisplayedIntensity(0.8f, 0.25f), 1e-5f);
            Assert.AreEqual(0f, EvilVeil.DisplayedIntensity(0f, 0f), 1e-5f);
        }
    }
}
