using System.Collections;
using UnityEngine;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// The skeleton-arm jump scare (Anthony, 2026-07-21): a bone-white arm reaches
    /// into frame from BEHIND the player's right shoulder, trembles at the edge of
    /// vision for a beat, and withdraws. Camera-space — it tracks the phone pose every
    /// frame, so it works identically in any room.
    ///
    /// Zero art assets: the arm is BUILT IN CODE from primitive cubes (upper arm,
    /// forearm, palm, four fingers + thumb) in Awake — same no-asset doctrine as the
    /// procedural shaders. Assign a material using ShadowDoors/BoneUnlit via
    /// <c>boneMaterial</c>; with none assigned the primitives keep their default
    /// material (uglier, never broken — scaffold rule).
    ///
    /// GameLoop triggers <see cref="Play"/> at fixed night-progress moments and plays
    /// the accompanying sound itself. Idempotent: Play during a live scare is ignored.
    /// </summary>
    public class SkeletonArm : MonoBehaviour
    {
        /// <summary>Reach-in duration (s) — fast enough to startle, slow enough to read.</summary>
        public const float ReachInSeconds = 0.55f;

        /// <summary>How long the arm trembles at full reach (s).</summary>
        public const float HoldSeconds = 0.9f;

        /// <summary>Withdraw duration (s).</summary>
        /// <summary>Vanish (s): after the grab it DISAPPEARS in place — snaps out of existence, doesn't withdraw (Anthony 2026-07-21: "as if it grabbed the player and then disappears").</summary>
        public const float RetractSeconds = 0.35f;

        // Camera-local offsets (m): from fully hidden behind the right shoulder to a
        // clutch right in front of the player's face (the grab, not a polite reach).
        private static readonly Vector3 RetractedOffset = new Vector3(0.50f, -0.35f, -0.15f);
        private static readonly Vector3 ExtendedOffset = new Vector3(0.16f, -0.10f, 0.32f);

        [Tooltip("Material using ShadowDoors/BoneUnlit, applied to every bone. Optional — null keeps primitive defaults.")]
        [SerializeField] private Material boneMaterial;

        private Transform _armRoot;
        private Transform _elbow;
        private IARRig _rig;
        private float _t;
        private bool _playing;

        /// <summary>
        /// Reach POSITION (0..1), unit-testable (house L1 rule): 0 at t<=0, ease-out
        /// cubic to 1 at ReachInSeconds (the fast snatch), then PINNED at 1 for the
        /// grab-hold AND the vanish — the hand doesn't travel back; it clutches at the
        /// player and disappears in place (see VanishAt for the shrink-out).
        /// </summary>
        public static float ReachAmountAt(float t)
        {
            if (t <= 0f)
            {
                return 0f;
            }
            if (t < ReachInSeconds)
            {
                float inv = 1f - t / ReachInSeconds;
                return 1f - inv * inv * inv;
            }
            return 1f;
        }

        /// <summary>
        /// Vanish scale (1..0), unit-testable: 1 through the snatch + grab-hold, then a
        /// fast cubic collapse to 0 over RetractSeconds — the grab clenches, then the
        /// hand is simply GONE. 0 after the timeline ends.
        /// </summary>
        public static float VanishAt(float t)
        {
            float holdEnd = ReachInSeconds + HoldSeconds;
            if (t < holdEnd)
            {
                return 1f;
            }
            float d = Mathf.Clamp01((t - holdEnd) / RetractSeconds);
            float inv = 1f - d;
            return inv * inv * inv; // snappy disappear
        }

        /// <summary>Begin the scare. No-op while one is already running or with no rig (scaffold rule).</summary>
        public void Play(IARRig rig)
        {
            if (_playing || rig == null || _armRoot == null)
            {
                return;
            }
            _rig = rig;
            StartCoroutine(RunScare());
        }

        private void Awake()
        {
            BuildArm();
            _armRoot.gameObject.SetActive(false);
        }

        private IEnumerator RunScare()
        {
            _playing = true;
            _t = 0f;
            _armRoot.gameObject.SetActive(true);

            float total = ReachInSeconds + HoldSeconds + RetractSeconds;
            while (_t < total)
            {
                _t += Time.deltaTime;
                TrackCamera(ReachAmountAt(_t), VanishAt(_t));
                yield return null;
            }

            _armRoot.localScale = Vector3.one; // restore for next play.
            _armRoot.gameObject.SetActive(false);
            _playing = false;
        }

        private void TrackCamera(float reach, float vanish)
        {
            Pose cam = _rig.CameraPose;

            // Tremble grows with reach — steady while hidden, shaking at full extension.
            float trembleX = (Mathf.PerlinNoise(Time.time * 11f, 0.3f) - 0.5f) * 8f * reach;
            float trembleY = (Mathf.PerlinNoise(0.7f, Time.time * 13f) - 0.5f) * 8f * reach;

            // A grab clench: a quick forward jab at the moment the hand arrives, on top
            // of the reach — it snatches, it doesn't settle.
            float clench = reach >= 1f ? 0.03f * Mathf.Sin(Mathf.Min(_t * 24f, 3.14f)) : 0f;

            Vector3 localPos = Vector3.Lerp(RetractedOffset, ExtendedOffset, reach)
                             + Vector3.forward * clench;
            Quaternion localRot = Quaternion.Euler(
                -12f + trembleX,
                -38f + reach * -14f + trembleY, // sweeps inward toward screen center as it extends
                18f);

            _armRoot.SetPositionAndRotation(
                cam.position + cam.rotation * localPos,
                cam.rotation * localRot);

            // Vanish in place: the whole arm collapses to nothing after the grab.
            _armRoot.localScale = Vector3.one * vanish;

            // The elbow unbends as the arm reaches — one joint is enough to sell it.
            if (_elbow != null)
            {
                _elbow.localRotation = Quaternion.Euler(-18f * (1f - reach), 0f, 0f);
            }
        }

        // ---- code-built skeleton: cubes as bones, pivots as joints ----

        private void BuildArm()
        {
            _armRoot = new GameObject("SkeletonArmRoot").transform;
            _armRoot.SetParent(transform, false);

            Bone(_armRoot, "UpperArm", new Vector3(0f, 0f, 0.15f), new Vector3(0.06f, 0.06f, 0.30f));

            _elbow = new GameObject("Elbow").transform;
            _elbow.SetParent(_armRoot, false);
            _elbow.localPosition = new Vector3(0f, 0f, 0.30f);

            Bone(_elbow, "Forearm", new Vector3(0f, 0f, 0.13f), new Vector3(0.05f, 0.05f, 0.26f));

            Transform wrist = new GameObject("Wrist").transform;
            wrist.SetParent(_elbow, false);
            wrist.localPosition = new Vector3(0f, 0f, 0.26f);

            Bone(wrist, "Palm", new Vector3(0f, 0f, 0.045f), new Vector3(0.085f, 0.022f, 0.09f));

            // Four fingers, splayed; slight downward curl so the hand reads as grasping.
            for (int i = 0; i < 4; i++)
            {
                float x = Mathf.Lerp(-0.032f, 0.032f, i / 3f);
                Transform finger = Bone(wrist, "Finger" + i, new Vector3(x, 0f, 0.135f), new Vector3(0.013f, 0.013f, 0.085f));
                finger.localRotation = Quaternion.Euler(14f, (x / 0.032f) * 8f, 0f);
            }

            Transform thumb = Bone(wrist, "Thumb", new Vector3(-0.055f, 0f, 0.06f), new Vector3(0.013f, 0.013f, 0.06f));
            thumb.localRotation = Quaternion.Euler(10f, -35f, 0f);
        }

        private Transform Bone(Transform parent, string name, Vector3 localPos, Vector3 scale)
        {
            GameObject bone = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bone.name = name;
            Destroy(bone.GetComponent<Collider>()); // visual only — never physics.
            bone.transform.SetParent(parent, false);
            bone.transform.localPosition = localPos;
            bone.transform.localScale = scale;
            if (boneMaterial != null)
            {
                bone.GetComponent<MeshRenderer>().sharedMaterial = boneMaterial;
            }
            return bone.transform;
        }
    }
}
