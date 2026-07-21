using UnityEngine;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// A hand straining half-out of the floor (Anthony 2026-07-21: "more half coming
    /// out of the floors like it wants to but it can't"). Rises only PARTWAY out of a
    /// floor point, trembles/claws at the air it can't reach, and sinks back — it
    /// never escapes. Self-driving and self-destroying: FloorGraspers just Instantiates
    /// it. Prefab recipe (runbook): the SM_Hand mesh + this component + a dark material
    /// (ShadowDoors/BoneUnlit or ShadowWraith); yaw is randomized at spawn.
    /// </summary>
    [RequireComponent(typeof(MeshRenderer))]
    public class FloorGrasper : MonoBehaviour
    {
        /// <summary>Rise-out-of-floor duration (s).</summary>
        public const float RiseSeconds = 1.1f;
        /// <summary>Straining hold at the top of its reach (s).</summary>
        public const float StrainSeconds = 1.3f;
        /// <summary>Sink-back duration (s).</summary>
        public const float SinkSeconds = 1.0f;

        /// <summary>Max fraction of the hand that ever clears the floor — it "can't" fully emerge.</summary>
        public const float MaxEmergeFraction = 0.5f;

        /// <summary>How far below the anchor the hand starts (fully submerged), in meters of hand height.</summary>
        public const float HandHeightMeters = 0.24f;

        private Vector3 _floorPoint;
        private float _t;

        /// <summary>
        /// Emergence height (m above the anchor) at time t. Pure/testable: rises to
        /// MaxEmergeFraction*HandHeight, strains there (with a tiny quiver added in
        /// Update, not here), sinks back to fully submerged. Starts and ends below 0.
        /// </summary>
        public static float EmergeHeightAt(float t)
        {
            float peak = MaxEmergeFraction * HandHeightMeters;
            float submerged = -HandHeightMeters; // fully under the floor
            if (t <= 0f)
            {
                return submerged;
            }
            if (t < RiseSeconds)
            {
                float n = t / RiseSeconds;
                float eased = n * n * (3f - 2f * n);
                return Mathf.Lerp(submerged, peak, eased);
            }
            if (t < RiseSeconds + StrainSeconds)
            {
                return peak;
            }
            float d = Mathf.Clamp01((t - RiseSeconds - StrainSeconds) / SinkSeconds);
            float eased2 = d * d * (3f - 2f * d);
            return Mathf.Lerp(peak, submerged, eased2);
        }

        /// <summary>Total lifetime (s).</summary>
        public static float TotalSeconds => RiseSeconds + StrainSeconds + SinkSeconds;

        /// <summary>Place at a floor point (anchor Y is floor level) with a random facing.</summary>
        public void Initialize(Vector3 floorPoint, float yawDegrees)
        {
            _floorPoint = floorPoint;
            transform.rotation = Quaternion.Euler(0f, yawDegrees, 0f);
        }

        private void Update()
        {
            _t += Time.deltaTime;

            float h = EmergeHeightAt(_t);

            // Straining quiver — strongest at full (failed) reach, so it reads as
            // clawing at air it cannot grasp.
            float strain = Mathf.Clamp01((_t - RiseSeconds) / RiseSeconds);
            float quiver = (Mathf.PerlinNoise(_t * 9f, transform.position.x) - 0.5f) * 0.02f * strain;
            float tilt = (Mathf.PerlinNoise(transform.position.z, _t * 7f) - 0.5f) * 10f * strain;

            transform.position = _floorPoint + Vector3.up * (h + quiver);
            Vector3 e = transform.rotation.eulerAngles;
            transform.rotation = Quaternion.Euler(tilt, e.y, tilt * 0.5f);

            if (_t >= TotalSeconds)
            {
                Destroy(gameObject);
            }
        }
    }
}
