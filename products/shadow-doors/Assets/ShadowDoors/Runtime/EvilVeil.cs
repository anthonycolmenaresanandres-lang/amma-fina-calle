using UnityEngine;
using UnityEngine.UI;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// Drives the fullscreen evil-veil filter (EvilVeil.shader on a uGUI Image):
    /// the room turns *wrong* the moment a shadow is out, and slowly recovers once
    /// it's gone. GameLoop calls <see cref="SetPresence"/> each frame; this component
    /// owns the asymmetric ramp (fast in — the dread hits; slow out — the relief
    /// lags). Null-safe per the scaffold rule: with no Image assigned it's a no-op.
    /// </summary>
    public class EvilVeil : MonoBehaviour
    {
        /// <summary>Intensity ramp-in per second — presence hits in just over half a second.</summary>
        public const float RampUpPerSecond = 1.8f;

        /// <summary>Intensity drain per second — the room takes ~2 s to feel safe again.</summary>
        public const float RampDownPerSecond = 0.5f;

        private static readonly int IntensityId = Shader.PropertyToID("_Intensity");

        [Tooltip("Fullscreen uGUI Image using EvilVeil.shader. Kept disabled while intensity is 0.")]
        [SerializeField] private Image veilImage;

        private Material _material;
        private float _intensity;
        private bool _present;

        /// <summary>Called by GameLoop every running frame: is any shadow currently out?</summary>
        public void SetPresence(bool anyShadowOut)
        {
            _present = anyShadowOut;
        }

        /// <summary>
        /// Pure ramp step, unit-testable without a scene (house L1 rule): moves
        /// current toward 1 (present) or 0 (absent) at the asymmetric rates, clamped
        /// to [0, 1].
        /// </summary>
        public static float IntensityStep(float current, bool present, float deltaTime)
        {
            float delta = (present ? RampUpPerSecond : -RampDownPerSecond) * deltaTime;
            return Mathf.Clamp01(current + delta);
        }

        private void Update()
        {
            _intensity = IntensityStep(_intensity, _present, Time.deltaTime);

            if (veilImage == null)
            {
                return;
            }

            // Instance the material once so we never mutate a shared asset.
            if (_material == null)
            {
                _material = new Material(veilImage.material);
                veilImage.material = _material;
            }

            bool visible = _intensity > 0.001f;
            if (veilImage.gameObject.activeSelf != visible)
            {
                veilImage.gameObject.SetActive(visible);
            }
            if (visible)
            {
                _material.SetFloat(IntensityId, _intensity);
            }
        }
    }
}
