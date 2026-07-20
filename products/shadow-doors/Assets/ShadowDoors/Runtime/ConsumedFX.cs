// Shadow Doors — the "consumed by darkness" lose sequence (Anthony's design, 2026-07-20):
// the killing shadow LUNGES into the player's face, its eyes flare and cut out, and the
// darkness closes in from the screen edges like an iris — it doesn't fade, it CONSUMES.
// The heartbeat ramps to maximum and cuts to dead silence at the exact frame the black
// completes; the black then sits alone (the silence IS the beat) before the end card
// surfaces out of it.
using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// Sequencer for the lose moment. Owns a fullscreen uGUI overlay (an <see cref="Image"/>
    /// using DarknessIris.shader) and drives the fixed timeline:
    ///   t=0.0  killer.BeginLunge() — scale-up + move to the camera's face; eyes flare.
    ///   t=0.2..0.9  iris closes (CloseAmountAt envelope); heartbeat intensity pinned to 1.
    ///   t=0.9  black completes: heartbeat STOPS + found_you slams — then silence.
    ///   t=2.0  onCardTime fires (GameLoop shows "IT FOUND YOU" out of the black).
    /// Everything is nullable/no-op-safe per the project scaffold rule: with no overlay
    /// assigned the sequence still runs its callbacks on time, so the game can never wedge
    /// on a missing art reference.
    /// </summary>
    public class ConsumedFX : MonoBehaviour
    {
        /// <summary>Iris starts closing this many seconds into the sequence.</summary>
        public const float CloseStartSeconds = 0.2f;

        /// <summary>The frame the black completes — heartbeat cut + found_you slam.</summary>
        public const float BlackCompleteSeconds = 0.9f;

        /// <summary>When the end card is allowed to surface out of the black.</summary>
        public const float CardTimeSeconds = 2.0f;

        private static readonly int CloseAmountId = Shader.PropertyToID("_CloseAmount");

        [Tooltip("Fullscreen uGUI Image whose material uses DarknessIris.shader. Disabled until the sequence plays.")]
        [SerializeField] private Image darknessOverlay;

        private Material _overlayMaterial;

        /// <summary>
        /// Pure envelope math, unit-testable without a scene (house L1 rule): 0 before
        /// CloseStartSeconds, cubic ease-in to 1 at BlackCompleteSeconds, clamped 1 after.
        /// </summary>
        public static float CloseAmountAt(float t)
        {
            if (t <= CloseStartSeconds)
            {
                return 0f;
            }
            float normalized = Mathf.Clamp01((t - CloseStartSeconds) / (BlackCompleteSeconds - CloseStartSeconds));
            return normalized * normalized * normalized; // cubic ease-in: slow creep, fast swallow
        }

        /// <summary>
        /// Run the consumed sequence. <paramref name="killer"/> may be null (no lunge, FX
        /// still plays); <paramref name="audioKit"/> may be null (silent).
        /// <paramref name="onCardTime"/> fires at CardTimeSeconds.
        /// </summary>
        public void Play(ShadowAgent killer, IARRig rig, AudioKit audioKit, Action onCardTime)
        {
            Debug.Log("CONSUMED_START");

            if (killer != null && rig != null)
            {
                killer.BeginLunge(rig);
            }

            if (darknessOverlay != null)
            {
                // Instance the material once so we never mutate a shared asset.
                if (_overlayMaterial == null)
                {
                    _overlayMaterial = new Material(darknessOverlay.material);
                    darknessOverlay.material = _overlayMaterial;
                }
                _overlayMaterial.SetFloat(CloseAmountId, 0f);
                darknessOverlay.gameObject.SetActive(true);
            }

            StartCoroutine(RunSequence(audioKit, onCardTime));
        }

        private IEnumerator RunSequence(AudioKit audioKit, Action onCardTime)
        {
            float t = 0f;
            bool blackDone = false;

            while (t < CardTimeSeconds)
            {
                t += Time.deltaTime;

                if (_overlayMaterial != null)
                {
                    _overlayMaterial.SetFloat(CloseAmountId, CloseAmountAt(t));
                }

                // Terror ramp: pin the heartbeat to maximum while the iris closes...
                if (!blackDone && audioKit != null)
                {
                    audioKit.SetHeartbeatIntensity(1f);
                }

                // ...then cut it to silence at the exact frame the black completes.
                if (!blackDone && t >= BlackCompleteSeconds)
                {
                    blackDone = true;
                    if (audioKit != null)
                    {
                        audioKit.StopHeartbeat();
                        audioKit.StopAmbient(); // the chant dies WITH the light — total silence
                        audioKit.PlayFlat("found_you");
                        // THE main voice, from inside the black after a short silence beat —
                        // it speaks before the card surfaces (and continues under it).
                        audioKit.PlayFlatDelayed("main_voice_lose", 0.4f);
                    }
                }

                yield return null;
            }

            onCardTime?.Invoke();
        }
    }
}
