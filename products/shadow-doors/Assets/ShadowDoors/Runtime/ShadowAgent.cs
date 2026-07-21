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

        // Fluid-motion pass (Anthony, 2026-07-21): the approach breathes instead of
        // marching — speed swells and ebbs on Perlin noise, the weave includes a slow
        // vertical bob, and the billboard TURNS smoothly rather than snapping.
        private const float BobAmplitudeMeters = 0.06f;
        private const float SpeedWobbleMin = 0.75f;
        private const float SpeedWobbleMax = 1.25f;
        private const float BillboardTurnSharpness = 6f; // slerp rate: ~0.1 s to settle a turn.

        /// <summary>
        /// Floor-anchor ruling (Anthony, 2026-07-20): anchors live ON THE FLOOR at the
        /// doorway threshold (vertical door surfaces are unreliable to tag; floors lock
        /// instantly), so the shadow RISES out of the floor stain instead of sliding out
        /// of a door plane. This is the quad-center height above the anchor once fully
        /// risen — half the unit quad's 1 m height, keeping its base at floor level.
        /// </summary>
        private const float RiseCenterHeightMeters = 0.5f;

        [SerializeField] private float glideSpeed = 0.3f; // m/s, overwritten from the scenario event's speed at spawn.
        [Tooltip("True for the real 3D wraith mesh: rotate yaw-only (stay upright, turn to face the player) instead of the flat-sprite full look-at. Leave false for the billboard quad.")]
        [SerializeField] private bool billboardYawOnly;

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

            _spawnPosition = transform.position; // the floor anchor point — the rise starts here.
            _wobbleSeed = Random.Range(0f, 100f); // desync sibling shadows' speed breathing.
            transform.localScale = Vector3.zero; // Emerging starts at scale 0.
        }

        private Vector3 _spawnPosition;
        private float _wobbleSeed;
        private float _previousDrift;
        private float _previousBob;

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

        // Billboard: turn to keep facing the player. The flat quad uses a full look-at
        // (it's a sprite from any angle); the real 3D wraith mesh (billboardYawOnly)
        // stays UPRIGHT and turns only about Y, so it never tips like a cardboard
        // cutout. Slerped rather than snapped (fluid-motion pass): it *turns*, it
        // doesn't teleport its facing.
        private void BillboardTowardCamera(Pose cameraPose)
        {
            Vector3 toCamera = cameraPose.position - transform.position;
            if (billboardYawOnly)
            {
                toCamera.y = 0f;
            }
            if (toCamera.sqrMagnitude < 0.0001f)
            {
                return;
            }

            Quaternion target = Quaternion.LookRotation(-toCamera.normalized, Vector3.up);
            transform.rotation = Quaternion.Slerp(
                transform.rotation, target, Mathf.Clamp01(BillboardTurnSharpness * Time.deltaTime));
        }

        private void TickEmerging()
        {
            _stateTimer += Time.deltaTime;
            float t = Mathf.Clamp01(_stateTimer / EmergeScaleInSeconds);

            // Ease-out cubic (fluid-motion pass): fast breach, slow settle — the
            // surfacing decelerates like something heavy pushing through a membrane.
            float inv = 1f - t;
            float eased = 1f - inv * inv * inv;

            // Rise out of the floor: scale up while the quad's CENTER climbs so its
            // base stays pinned to the anchor — reads as surfacing through the stain,
            // not inflating in mid-air.
            transform.localScale = Vector3.one * eased;
            transform.position = _spawnPosition + Vector3.up * (RiseCenterHeightMeters * eased);

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

            // Fluid-motion pass: the approach breathes. Speed swells/ebbs on Perlin
            // noise; the weave is applied as POSITIONAL deltas (previous frame's sine
            // subtracted from this frame's) so the lateral sway and vertical bob are
            // true smooth offsets — the old velocity*dt formulation double-scaled by
            // dt and flattened the weave to near zero.
            float speedWobble = Mathf.Lerp(
                SpeedWobbleMin, SpeedWobbleMax, Mathf.PerlinNoise(_driftPhase * 0.21f, _wobbleSeed));
            float drift = Mathf.Sin(_driftPhase) * DriftAmplitudeMeters;
            float bob = Mathf.Sin(_driftPhase * 0.63f + 1.3f) * BobAmplitudeMeters;

            Vector3 weaveDelta = perpendicular * (drift - _previousDrift)
                               + Vector3.up * (bob - _previousBob);
            _previousDrift = drift;
            _previousBob = bob;

            transform.position += direction * (glideSpeed * speedWobble) * Time.deltaTime + weaveDelta;
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
