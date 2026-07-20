using NUnit.Framework;
using ShadowDoors.Runtime;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Tests for the pure-function contract:
    ///   ShadowDoors.Runtime.BanishSystem.DwellTick(float current, bool aimed, float dt) -> float
    ///
    /// ASSUMED CONTRACT (AR_SHADOW_DOORS_MVP.md: "center the aim reticle on it and hold
    /// ~1.2 s"; task brief: "dwell target 1.2s, off-target decay 2x"):
    ///   - When aimed == true: dwell fills at 1x real time, i.e. result = current + dt.
    ///     (1.2 s of continuous aim therefore reaches the 1.2 target exactly.)
    ///   - When aimed == false: dwell drains at 2x real time, i.e. result = current - dt*2.
    ///   - Result is clamped to a floor of 0 (never negative) — this is the one hard
    ///     clamp the task brief states explicitly ("clamps at 0").
    ///   - The caller (BanishSystem / GameLoop), not DwellTick itself, is what compares the
    ///     returned value against the 1.2 s target to decide "triggers" — these tests assert
    ///     current &gt;= 1.2f after enough aimed time, not an exact clamp to 1.2, since an
    ///     upper clamp at exactly 1.2 is NOT stated as a hard requirement and asserting it
    ///     would risk a false mismatch against the runtime implementation.
    /// </summary>
    public class BanishSystemTests
    {
        private const float Tolerance = 1e-4f;

        [Test]
        public void DwellTick_ContinuousAim_ReachesTargetAfter1Point2Seconds()
        {
            float dwell = 0f;
            const float dt = 0.1f;
            const int steps = 12; // 12 * 0.1 = 1.2s

            for (int i = 0; i < steps; i++)
            {
                dwell = BanishSystem.DwellTick(dwell, aimed: true, dt: dt);
            }

            Assert.GreaterOrEqual(dwell, 1.2f - Tolerance,
                "1.2s of continuous aim must reach the banish dwell target.");
        }

        [Test]
        public void DwellTick_AimedFillsAt1x()
        {
            float result = BanishSystem.DwellTick(0.3f, aimed: true, dt: 0.25f);
            Assert.AreEqual(0.55f, result, Tolerance);
        }

        [Test]
        public void DwellTick_OffTargetDecaysAt2x()
        {
            // Starting well clear of the zero floor so the 2x decay isn't clipped by clamping.
            float result = BanishSystem.DwellTick(0.5f, aimed: false, dt: 0.1f);
            Assert.AreEqual(0.5f - 0.1f * 2f, result, Tolerance); // 0.3
        }

        [Test]
        public void DwellTick_ClampsAtZero_NeverGoesNegative()
        {
            // 0.05 - (0.1 * 2) = -0.15 uncapped; must clamp to 0.
            float result = BanishSystem.DwellTick(0.05f, aimed: false, dt: 0.1f);
            Assert.AreEqual(0f, result, Tolerance);

            // Already at zero, still off-target: stays at zero.
            float stillZero = BanishSystem.DwellTick(0f, aimed: false, dt: 0.2f);
            Assert.AreEqual(0f, stillZero, Tolerance);
        }

        [Test]
        public void DwellTick_PartialAimSequence_TracksExpectedTrajectory()
        {
            const float dt = 0.2f;
            float dwell = 0f;

            // Aim, aim, lose it, aim again, lose it hard.
            dwell = BanishSystem.DwellTick(dwell, aimed: true, dt: dt);   // 0.0 -> 0.2
            dwell = BanishSystem.DwellTick(dwell, aimed: true, dt: dt);   // 0.2 -> 0.4
            Assert.AreEqual(0.4f, dwell, Tolerance);

            dwell = BanishSystem.DwellTick(dwell, aimed: false, dt: dt);  // 0.4 -> 0.4 - 0.4 = 0.0
            Assert.AreEqual(0.0f, dwell, Tolerance);

            dwell = BanishSystem.DwellTick(dwell, aimed: true, dt: dt);   // 0.0 -> 0.2
            Assert.AreEqual(0.2f, dwell, Tolerance);

            dwell = BanishSystem.DwellTick(dwell, aimed: false, dt: 1f);  // way past zero -> clamps
            Assert.AreEqual(0f, dwell, Tolerance);
        }

        // MISMATCH RISK: if the runtime agent's DwellTick also clamps an UPPER bound (e.g.
        // caps at exactly 1.2), these tests still pass (they only assert >= 1.2, never an
        // exact overshoot value). If instead the fill rate when aimed is NOT 1x real time
        // (e.g. it reaches 1.2 in some other duration), DwellTick_AimedFillsAt1x and
        // DwellTick_PartialAimSequence will fail — that fill-rate assumption is the one most
        // likely to need reconciling against the actual implementation.
    }
}
