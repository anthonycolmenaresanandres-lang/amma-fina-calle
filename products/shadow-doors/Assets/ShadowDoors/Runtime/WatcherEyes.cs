using UnityEngine;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// An eyes-only apparition (the "seem watched" beat, Anthony 2026-07-20): two
    /// glowing eyes that appear low in the dark near a threshold, stare at the player
    /// for a couple of seconds, and vanish. No approach, no gameplay threat — pure
    /// dread. Spawned by GameLoop on whisper events at a random offset around the
    /// whispered door so the watching happens "at different places".
    ///
    /// Self-driving and self-destroying like DarknessPortal: GameLoop just
    /// Instantiates + Initialize(rig). Drives WatcherEyes.shader's _Glow via property
    /// block; yaw-billboards toward the camera so the eyes always face the player.
    /// </summary>
    [RequireComponent(typeof(MeshRenderer))]
    public class WatcherEyes : MonoBehaviour
    {
        /// <summary>Fade-in duration (s) — slow enough to be noticed peripherally, not to pop.</summary>
        public const float FadeInSeconds = 0.4f;

        /// <summary>How long the eyes hold their stare (s).</summary>
        public const float HoldSeconds = 2.2f;

        /// <summary>Fade-out duration (s).</summary>
        public const float FadeOutSeconds = 0.7f;

        /// <summary>Peak _Glow value while staring.</summary>
        public const float PeakGlow = 2.2f;

        private static readonly int GlowId = Shader.PropertyToID("_Glow");

        private MeshRenderer _renderer;
        private MaterialPropertyBlock _props;
        private IARRig _rig;
        private float _t;

        /// <summary>
        /// Pure envelope, unit-testable without a scene (house L1 rule): 0 at t<=0,
        /// smoothstep up over FadeInSeconds, 1 through the hold, smoothstep down over
        /// FadeOutSeconds, 0 after. Returns the FRACTION of peak (multiply by PeakGlow
        /// for the shader value).
        /// </summary>
        public static float GlowFractionAt(float t)
        {
            if (t <= 0f)
            {
                return 0f;
            }
            if (t < FadeInSeconds)
            {
                float n = t / FadeInSeconds;
                return n * n * (3f - 2f * n);
            }
            if (t < FadeInSeconds + HoldSeconds)
            {
                return 1f;
            }
            float d = Mathf.Clamp01((t - FadeInSeconds - HoldSeconds) / FadeOutSeconds);
            float inv = 1f - d;
            return inv * inv * (3f - 2f * inv);
        }

        /// <summary>Call right after Instantiate — the rig is only used to face the player.</summary>
        public void Initialize(IARRig rig)
        {
            _rig = rig;
        }

        private void Awake()
        {
            _renderer = GetComponent<MeshRenderer>();
            _props = new MaterialPropertyBlock();
        }

        private void Update()
        {
            _t += Time.deltaTime;

            _renderer.GetPropertyBlock(_props);
            _props.SetFloat(GlowId, PeakGlow * GlowFractionAt(_t));
            _renderer.SetPropertyBlock(_props);

            if (_rig != null)
            {
                Vector3 toCamera = _rig.CameraPose.position - transform.position;
                toCamera.y = 0f; // yaw-only: the eyes stay level, watching from where they are.
                if (toCamera.sqrMagnitude > 0.0001f)
                {
                    transform.rotation = Quaternion.LookRotation(-toCamera.normalized, Vector3.up);
                }
            }

            if (_t >= FadeInSeconds + HoldSeconds + FadeOutSeconds)
            {
                Destroy(gameObject);
            }
        }
    }
}
