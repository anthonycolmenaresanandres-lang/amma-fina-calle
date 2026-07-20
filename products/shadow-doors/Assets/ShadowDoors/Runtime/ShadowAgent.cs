using UnityEngine;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// A single shadow creature: flat billboard silhouette, zero rigging. Spawned at a
    /// door anchor pose by GameLoop in response to ScenarioDirector.OnEmerge; glides
    /// toward the camera with a sine drift; banished by BanishSystem via
    /// <see cref="BeginBanish"/>. Drives <c>ShadowSilhouette.shader</c>'s _Dissolve and
    /// eye-glow params directly through the material property block.
    /// </summary>
    [RequireComponent(typeof(MeshRenderer))]
    public class ShadowAgent : MonoBehaviour
    {
        public enum ShadowState
        {
            Emerging,
            Hunting,
            Banishing,
            /// <summary>Consumed sequence: scaling into the player's face; eyes flare then cut. Terminal — never leaves this state (ConsumedFX owns the timeline).</summary>
            Lunging
        }

        private const float EmergeScaleInSeconds = 1.2f;
        private const float BanishDissolveSeconds = 0.8f;
        private const float DriftAmplitudeMeters = 0.15f;
        private const float DriftFrequencyHz = 0.35f; // arbitrary, slow "unsteady approach" wobble — tune freely, not spec-mandated.

        [SerializeField] private float glideSpeed = 0.3f; // m/s, overwritten from the scenario event's speed at spawn.

        private static readonly int DissolveId = Shader.PropertyToID("_Dissolve");

        private MeshRenderer _renderer;
        private MaterialPropertyBlock _props;
        private IARRig _rig;
        private float _stateTimer;
        private float _driftPhase;

        /// <summary>Current lifecycle state.</summary>
        public ShadowState State { get; private set; } = ShadowState.Emerging;

        /// <summary>Distance from this shadow to the camera this frame — GameLoop polls this for the 0.5 m fail check.</summary>
        public float DistanceToCamera { get; private set; }

        /// <summary>Which door index this shadow spawned from (for logging/debug, and so BanishSystem can report which door in BANISH_OK).</summary>
        public int DoorIndex { get; private set; }

        /// <summary>
        /// Call immediately after Instantiate. Sets up the door of origin, glide speed
        /// (m/s, from the scenario event), and the IARRig used to billboard/glide
        /// toward the camera each frame.
        /// </summary>
        public void Initialize(int doorIndex, float speed, IARRig rig)
        {
            DoorIndex = doorIndex;
            glideSpeed = speed;
            _rig = rig;
            _driftPhase = Random.Range(0f, Mathf.PI * 2f); // desync sibling shadows' wobble.

            _renderer = GetComponent<MeshRenderer>();
            _props = new MaterialPropertyBlock();

            transform.localScale = Vector3.zero; // Emerging starts at scale 0.
        }

        private void Update()
        {
            if (_rig == null)
            {
                return;
            }

            Pose cameraPose = _rig.CameraPose;
            DistanceToCamera = Vector3.Distance(transform.position, cameraPose.position);

            BillboardTowardCamera(cameraPose);

            switch (State)
            {
                case ShadowState.Emerging:
                    TickEmerging();
                    break;
                case ShadowState.Hunting:
                    TickHunting(cameraPose);
                    break;
                case ShadowState.Banishing:
                    TickBanishing();
                    break;
                case ShadowState.Lunging:
                    TickLunging(cameraPose);
                    break;
            }
        }

        // Billboard: quad always faces the camera. Full look-at (not Y-axis-only) —
        // the shadow is a flat sprite from any angle, so there's no "correct" locked
        // up-axis to preserve; simplest possible billboard for an MVP.
        private void BillboardTowardCamera(Pose cameraPose)
        {
            Vector3 toCamera = cameraPose.position - transform.position;
            if (toCamera.sqrMagnitude < 0.0001f)
            {
                return;
            }

            transform.rotation = Quaternion.LookRotation(-toCamera.normalized, Vector3.up);
        }

        private void TickEmerging()
        {
            _stateTimer += Time.deltaTime;
            float t = Mathf.Clamp01(_stateTimer / EmergeScaleInSeconds);
            transform.localScale = Vector3.one * t;

            if (t >= 1f)
            {
                State = ShadowState.Hunting;
                _stateTimer = 0f;
            }
        }

        private void TickHunting(Pose cameraPose)
        {
            Vector3 toCamera = cameraPose.position - transform.position;
            Vector3 direction = toCamera.normalized;

            // Sine drift perpendicular to the approach direction — a slight unsteady
            // weave rather than a laser-straight beeline.
            Vector3 perpendicular = Vector3.Cross(direction, Vector3.up);
            if (perpendicular.sqrMagnitude < 0.0001f)
            {
                perpendicular = transform.right;
            }
            perpendicular.Normalize();

            _driftPhase += Time.deltaTime * DriftFrequencyHz * Mathf.PI * 2f;
            float drift = Mathf.Sin(_driftPhase) * DriftAmplitudeMeters;

            Vector3 velocity = direction * glideSpeed + perpendicular * drift * Time.deltaTime;
            transform.position += velocity * Time.deltaTime;
        }

        private void TickBanishing()
        {
            _stateTimer += Time.deltaTime;
            float t = Mathf.Clamp01(_stateTimer / BanishDissolveSeconds);

            _renderer.GetPropertyBlock(_props);
            _props.SetFloat(DissolveId, t);
            _renderer.SetPropertyBlock(_props);

            if (t >= 1f)
            {
                Destroy(gameObject);
            }
        }

        /// <summary>
        /// Called by BanishSystem once dwell reaches the banish threshold. Idempotent —
        /// safe to call more than once (e.g. dwell ticks arriving the same frame the
        /// threshold is crossed twice due to update ordering).
        /// </summary>
        /// <summary>
        /// Consumed-sequence lunge (ConsumedFX): the shadow abandons hunting, scales up to
        /// fill the view and closes to just in front of the camera; eyes flare 2x then cut
        /// to black at the ConsumedFX.BlackCompleteSeconds mark. Idempotent.
        /// </summary>
        public void BeginLunge(IARRig rig)
        {
            if (State == ShadowState.Lunging)
            {
                return;
            }
            _rig = rig != null ? rig : _rig;
            State = ShadowState.Lunging;
            _stateTimer = 0f;
            _lungeStartPosition = transform.position;
            _lungeStartScale = transform.localScale.x;
        }

        private const float LungeSeconds = 0.5f;
        private const float LungeEndDistanceMeters = 0.3f;
        private const float LungeEndScale = 4.0f;
        private static readonly int EyeGlowIntensityId = Shader.PropertyToID("_EyeGlowIntensity");
        private Vector3 _lungeStartPosition;
        private float _lungeStartScale = 1f;

        private void TickLunging(Pose cameraPose)
        {
            _stateTimer += Time.deltaTime;
            float t = Mathf.Clamp01(_stateTimer / LungeSeconds);
            float eased = t * t; // accelerate INTO the face

            Vector3 target = cameraPose.position + (transform.position - cameraPose.position).normalized * LungeEndDistanceMeters;
            transform.position = Vector3.Lerp(_lungeStartPosition, target, eased);
            transform.localScale = Vector3.one * Mathf.Lerp(_lungeStartScale, LungeEndScale, eased);

            // Eyes: flare to 2x over the lunge, then hard-cut to zero once the ConsumedFX
            // black completes (the last thing seen is the eyes going out inside the dark).
            float sequenceTime = _stateTimer; // lunge starts at ConsumedFX t=0
            float eyeIntensity = sequenceTime < ConsumedFX.BlackCompleteSeconds
                ? Mathf.Lerp(1.5f, 3.0f, t)
                : 0f;
            _renderer.GetPropertyBlock(_props);
            _props.SetFloat(EyeGlowIntensityId, eyeIntensity);
            _renderer.SetPropertyBlock(_props);
        }

        public void BeginBanish()
        {
            if (State == ShadowState.Banishing)
            {
                return;
            }

            State = ShadowState.Banishing;
            _stateTimer = 0f;
        }
    }
}
