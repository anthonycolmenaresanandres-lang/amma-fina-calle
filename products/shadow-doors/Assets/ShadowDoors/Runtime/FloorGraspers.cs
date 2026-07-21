using System.Collections.Generic;
using UnityEngine;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// Ambient dread spawner (Anthony 2026-07-21: "more half coming out of the floors
    /// like it wants to but it can't"). While the night runs, periodically pushes up
    /// FloorGrasper hands at random floor points around the player's safe center —
    /// they strain half-out and sink, never escaping. The rate climbs with night
    /// progress (more of them, faster, as dawn nears). Null-safe: no prefab = nothing.
    ///
    /// GameLoop calls <see cref="Begin"/> at run start and <see cref="Stop"/> on
    /// end. Purely decorative — graspers never touch the fail check.
    /// </summary>
    public class FloorGraspers : MonoBehaviour
    {
        /// <summary>Seconds between spawns early in the night.</summary>
        public const float IntervalStart = 3.5f;
        /// <summary>Seconds between spawns near dawn (denser).</summary>
        public const float IntervalEnd = 1.1f;
        /// <summary>Radius (m) around the safe center within which hands surface.</summary>
        public const float SpreadRadius = 2.2f;
        /// <summary>Nearest a hand spawns to the player (m) — never right at their feet.</summary>
        public const float MinRadius = 0.7f;

        [Tooltip("Prefab: SM_Hand mesh + FloorGrasper + a dark material. Optional — null spawns nothing (scaffold rule).")]
        [SerializeField] private GameObject grasperPrefab;

        private Transform _center;
        private bool _running;
        private float _timer;
        private int _spawnCount;

        /// <summary>Spawn interval (s) at a given 0..1 night progress. Pure/testable.</summary>
        public static float IntervalAt(float progress01)
        {
            return Mathf.Lerp(IntervalStart, IntervalEnd, Mathf.Clamp01(progress01));
        }

        /// <summary>A deterministic-ish scattered floor offset (no Unity Random in the pure path) — angle/radius from an index.</summary>
        public static Vector3 OffsetForIndex(int index, float radius01)
        {
            // Golden-angle spiral so successive hands land spread apart, not clustered.
            float angle = index * 2.399963f; // ~137.5 degrees in radians
            float r = Mathf.Lerp(MinRadius, SpreadRadius, Mathf.Clamp01(radius01));
            return new Vector3(Mathf.Cos(angle) * r, 0f, Mathf.Sin(angle) * r);
        }

        /// <summary>Start surfacing hands around <paramref name="safeCenter"/> (nullable — falls back to this transform).</summary>
        public void Begin(Transform safeCenter)
        {
            _center = safeCenter != null ? safeCenter : transform;
            _running = true;
            _timer = 0f;
            _spawnCount = 0;
        }

        public void Stop()
        {
            _running = false;
        }

        /// <summary>Drives the spawn cadence. GameLoop passes night progress (0..1) each running frame.</summary>
        public void Tick(float progress01)
        {
            if (!_running || grasperPrefab == null || _center == null)
            {
                return;
            }

            _timer -= Time.deltaTime;
            if (_timer > 0f)
            {
                return;
            }
            _timer = IntervalAt(progress01);

            // Deterministic scatter by index + a progress-driven radius spread; vary
            // count up slightly as the night escalates ("more of them").
            int burst = 1 + Mathf.FloorToInt(progress01 * 2f); // 1 -> 3 near dawn
            for (int i = 0; i < burst; i++)
            {
                Vector3 offset = OffsetForIndex(_spawnCount, 0.3f + progress01 * 0.7f);
                _spawnCount++;
                Vector3 point = _center.position + offset;
                point.y = _center.position.y; // floor level

                GameObject go = Instantiate(grasperPrefab, point, Quaternion.identity);
                FloorGrasper g = go.GetComponent<FloorGrasper>();
                if (g != null)
                {
                    float yaw = (_spawnCount * 47f) % 360f;
                    g.Initialize(point, yaw);
                }
            }
        }
    }
}
