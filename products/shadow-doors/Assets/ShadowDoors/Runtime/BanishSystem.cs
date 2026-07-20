using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// The flashlight-banish mechanic: while any shadow is alive, casts a ray from the
    /// camera pose through screen center against each shadow's bounding sphere. Aiming
    /// at a shadow accumulates dwell toward the banish threshold; looking away decays it
    /// at twice the accumulation rate. Drives a uGUI radial progress ring and calls
    /// <see cref="ShadowAgent.BeginBanish"/> at threshold. Emits <c>BANISH_OK</c>.
    /// </summary>
    public class BanishSystem : MonoBehaviour
    {
        /// <summary>Seconds of continuous aim required to banish, per spec.</summary>
        public const float BanishDwellSeconds = 1.2f;

        /// <summary>Off-target decay is 2x the on-target accumulation rate, per spec.</summary>
        public const float DecayMultiplier = 2f;

        /// <summary>Shadow bounding-sphere radius (m) used for the aim hit test, per spec.</summary>
        public const float ShadowAimRadius = 0.4f;

        [SerializeField] private MonoBehaviour arRigSource; // must implement IARRig.
        [SerializeField] private Image progressRing; // uGUI Image, Type=Filled/Radial360, fillAmount driven each frame.

        private IARRig _rig;
        private readonly List<ShadowAgent> _activeShadows = new List<ShadowAgent>();
        private readonly Dictionary<ShadowAgent, float> _dwell = new Dictionary<ShadowAgent, float>();

        private void Awake()
        {
            _rig = arRigSource as IARRig;
            if (_rig == null)
            {
                Debug.LogError("BanishSystem: arRigSource does not implement IARRig.");
            }

            if (progressRing != null)
            {
                progressRing.fillAmount = 0f;
                progressRing.gameObject.SetActive(false);
            }
        }

        /// <summary>Register a newly spawned shadow so it participates in aim/dwell each frame.</summary>
        public void Register(ShadowAgent shadow)
        {
            if (!_activeShadows.Contains(shadow))
            {
                _activeShadows.Add(shadow);
                _dwell[shadow] = 0f;
            }
        }

        /// <summary>Unregister a shadow (destroyed, banished-and-gone) so it stops being aim-tracked.</summary>
        public void Unregister(ShadowAgent shadow)
        {
            _activeShadows.Remove(shadow);
            _dwell.Remove(shadow);
        }

        private void Update()
        {
            if (_rig == null || _activeShadows.Count == 0)
            {
                if (progressRing != null)
                {
                    progressRing.gameObject.SetActive(false);
                }
                return;
            }

            Pose cameraPose = _rig.CameraPose;
            var ray = new Ray(cameraPose.position, cameraPose.rotation * Vector3.forward);

            ShadowAgent aimedShadow = FindAimedShadow(ray);
            float dt = Time.deltaTime;

            // Iterate backward so banishing a shadow can remove it from the tracked
            // list in the same frame without invalidating an enumerator. Also prune
            // shadows destroyed by their own dissolve clock.
            for (int i = _activeShadows.Count - 1; i >= 0; i--)
            {
                ShadowAgent shadow = _activeShadows[i];
                if (shadow == null)
                {
                    if ((object)shadow != null)
                    {
                        _dwell.Remove(shadow);
                    }
                    _activeShadows.RemoveAt(i);
                    continue;
                }

                bool aimed = shadow == aimedShadow;
                float current = _dwell.TryGetValue(shadow, out float existing) ? existing : 0f;
                float updated = DwellTick(current, aimed, dt);
                _dwell[shadow] = updated;

                if (updated >= BanishDwellSeconds)
                {
                    shadow.BeginBanish();
                    Debug.Log("BANISH_OK door=" + shadow.DoorIndex);
                    _dwell.Remove(shadow);
                    _activeShadows.RemoveAt(i);
                }
            }

            UpdateProgressRing(aimedShadow);
        }

        // Ray-sphere intersection against the aimed shadow's bounds; the "screen-center
        // ray" from the spec IS the camera forward vector here, since BanishSystem
        // always aims at viewport center (no separate reticle raycast target needed).
        private ShadowAgent FindAimedShadow(Ray ray)
        {
            ShadowAgent closest = null;
            float closestDistance = float.MaxValue;

            foreach (ShadowAgent shadow in _activeShadows)
            {
                if (shadow == null)
                {
                    continue;
                }

                Vector3 toShadow = shadow.transform.position - ray.origin;
                float along = Vector3.Dot(toShadow, ray.direction);
                if (along <= 0f)
                {
                    continue; // behind the camera.
                }

                Vector3 closestPointOnRay = ray.origin + ray.direction * along;
                float lateralDist = Vector3.Distance(closestPointOnRay, shadow.transform.position);
                if (lateralDist <= ShadowAimRadius && along < closestDistance)
                {
                    closestDistance = along;
                    closest = shadow;
                }
            }

            return closest;
        }

        private void UpdateProgressRing(ShadowAgent aimedShadow)
        {
            if (progressRing == null)
            {
                return;
            }

            if (aimedShadow == null || !_dwell.TryGetValue(aimedShadow, out float dwell) || dwell <= 0f)
            {
                progressRing.gameObject.SetActive(false);
                return;
            }

            progressRing.gameObject.SetActive(true);
            progressRing.fillAmount = Mathf.Clamp01(dwell / BanishDwellSeconds);
        }

        /// <summary>
        /// Pure dwell-accumulation math (spec L1 requirement — no MonoBehaviour needed
        /// to test it). Aimed accumulates toward BanishDwellSeconds at 1x rate;
        /// off-target decays at DecayMultiplier (2x) the rate. Clamped to
        /// [0, BanishDwellSeconds].
        /// </summary>
        public static float DwellTick(float current, bool aimed, float dt)
        {
            float delta = aimed ? dt : -dt * DecayMultiplier;
            return Mathf.Clamp(current + delta, 0f, BanishDwellSeconds);
        }
    }
}
