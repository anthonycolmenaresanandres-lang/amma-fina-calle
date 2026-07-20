using UnityEngine;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// The breach: an amorphous darkness stain that spreads flat ON THE FLOOR at the
    /// tagged doorway threshold before a shadow rises through it (floor-anchor ruling,
    /// Anthony 2026-07-20). Self-driving — plays its whole open → hold → drain
    /// timeline from OnEnable and destroys itself at the end, so GameLoop only ever
    /// Instantiates it (scaffold rule: nothing to wire, nothing to wedge). Drives
    /// DarknessPortal.shader's _OpenAmount via property block.
    ///
    /// Placement-agnostic by design: a noise-eaten pool of darkness on the floor never
    /// has to match any real geometry — it reads correctly at any doorway, archway, or
    /// window.
    /// </summary>
    [RequireComponent(typeof(MeshRenderer))]
    public class DarknessPortal : MonoBehaviour
    {
        /// <summary>Bleed-open duration (s). GameLoop delays the shadow spawn by exactly this, so the shadow steps out of an already-open breach.</summary>
        public const float OpenSeconds = 0.8f;

        /// <summary>Fully-open hold (s) — covers the shadow's 1.2 s emerge scale-in with margin.</summary>
        public const float HoldSeconds = 2.2f;

        /// <summary>Drain-away duration (s) after the hold.</summary>
        public const float DrainSeconds = 1.4f;

        /// <summary>Tiny lift above the floor anchor (m) so the flat stain never z-fights the detected plane's visuals.</summary>
        public const float FloorLiftMeters = 0.01f;

        private static readonly int OpenAmountId = Shader.PropertyToID("_OpenAmount");

        [Tooltip("World size of the floor stain (m). Deliberately generous — darkness spilling past the threshold is the look, not a bug.")]
        [SerializeField] private float portalWidth = 1.3f;
        [SerializeField] private float portalHeight = 1.3f;

        private MeshRenderer _renderer;
        private MaterialPropertyBlock _props;
        private float _t;

        /// <summary>
        /// Pure envelope, unit-testable without a scene (house L1 rule):
        /// smoothstep 0→1 over OpenSeconds, pinned at 1 through the hold, eased back
        /// to 0 over DrainSeconds, 0 outside the timeline.
        /// </summary>
        public static float OpenAmountAt(float t)
        {
            if (t <= 0f)
            {
                return 0f;
            }
            if (t < OpenSeconds)
            {
                float n = t / OpenSeconds;
                return n * n * (3f - 2f * n); // smoothstep: soft start, decisive bleed
            }
            if (t < OpenSeconds + HoldSeconds)
            {
                return 1f;
            }
            float d = Mathf.Clamp01((t - OpenSeconds - HoldSeconds) / DrainSeconds);
            float inv = 1f - d;
            return inv * inv; // quadratic drain: lingers, then lets go
        }

        private void Awake()
        {
            _renderer = GetComponent<MeshRenderer>();
            _props = new MaterialPropertyBlock();
            transform.localScale = new Vector3(portalWidth, portalHeight, 1f);
        }

        private void OnEnable()
        {
            _t = 0f;
            Apply(0f);
        }

        private void Update()
        {
            _t += Time.deltaTime;
            Apply(OpenAmountAt(_t));

            if (_t >= OpenSeconds + HoldSeconds + DrainSeconds)
            {
                Destroy(gameObject);
            }
        }

        private void Apply(float openAmount)
        {
            if (_renderer == null)
            {
                return;
            }
            _renderer.GetPropertyBlock(_props);
            _props.SetFloat(OpenAmountId, openAmount);
            _renderer.SetPropertyBlock(_props);
        }
    }
}
