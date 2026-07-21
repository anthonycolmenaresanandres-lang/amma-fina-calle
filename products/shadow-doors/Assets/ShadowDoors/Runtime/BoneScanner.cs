using System;
using System.Collections;
using UnityEngine;
using UnityEngine.UI;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// The Bone Scan (Anthony, 2026-07-21: "put my hand on the screen and it sees my
    /// bones"). Owns a fullscreen uGUI Image using BoneScan.shader and drives its
    /// scan: a line sweeps up the screen revealing a procedural X-ray skeletal hand
    /// over the live camera feed. The entity looks THROUGH you.
    ///
    /// Two uses, both via <see cref="Trigger"/>: (1) a player-initiated "scan your
    /// hand" — wire a uGUI button to Trigger() so anyone can raise a hand and watch
    /// their bones appear (the anatomy beat); (2) an entity scare — GameLoop can fire
    /// it unbidden ("it decides to look inside you"). Null-safe: no Image = no-op
    /// but the timeline + onComplete still run (scaffold rule).
    /// </summary>
    public class BoneScanner : MonoBehaviour
    {
        /// <summary>Fade-in of the X-ray field (s).</summary>
        public const float RevealInSeconds = 0.4f;
        /// <summary>The scan-line sweep up the screen (s).</summary>
        public const float SweepSeconds = 2.0f;
        /// <summary>Hold on the fully-revealed skeleton (s).</summary>
        public const float HoldSeconds = 1.2f;
        /// <summary>Fade-out (s).</summary>
        public const float FadeOutSeconds = 0.8f;

        private static readonly int ScanId = Shader.PropertyToID("_Scan");
        private static readonly int RevealId = Shader.PropertyToID("_Reveal");

        [Tooltip("Fullscreen uGUI Image using BoneScan.shader. Kept disabled between scans.")]
        [SerializeField] private Image scanImage;
        [Tooltip("Optional prompt shown while scanning (e.g. 'HOLD STILL').")]
        [SerializeField] private Text promptText;
        [SerializeField] private AudioKit audioKit;

        private Material _material;
        private bool _scanning;

        /// <summary>True while a scan is mid-timeline — GameLoop can gate on this.</summary>
        public bool IsScanning => _scanning;

        /// <summary>
        /// Scan-line position (0..1) at time t. Pure/testable: 0 before the sweep
        /// starts (during reveal-in), 0→1 across SweepSeconds, pinned 1 after.
        /// </summary>
        public static float ScanAt(float t)
        {
            if (t <= RevealInSeconds)
            {
                return 0f;
            }
            return Mathf.Clamp01((t - RevealInSeconds) / SweepSeconds);
        }

        /// <summary>
        /// Overall reveal opacity (0..1) at time t: smoothstep in over RevealInSeconds,
        /// 1 through sweep+hold, smoothstep out over FadeOutSeconds, 0 after. Pure.
        /// </summary>
        public static float RevealAt(float t)
        {
            float holdEnd = RevealInSeconds + SweepSeconds + HoldSeconds;
            if (t <= 0f)
            {
                return 0f;
            }
            if (t < RevealInSeconds)
            {
                float n = t / RevealInSeconds;
                return n * n * (3f - 2f * n);
            }
            if (t < holdEnd)
            {
                return 1f;
            }
            float d = Mathf.Clamp01((t - holdEnd) / FadeOutSeconds);
            float inv = 1f - d;
            return inv * inv * (3f - 2f * inv);
        }

        /// <summary>Total scan duration (s).</summary>
        public static float TotalSeconds => RevealInSeconds + SweepSeconds + HoldSeconds + FadeOutSeconds;

        /// <summary>Start a scan from a parameterless uGUI button callback.</summary>
        public void Trigger()
        {
            Trigger(null);
        }

        /// <summary>Start a scan. No-op if one is already running. onComplete fires at the end (nullable).</summary>
        public void Trigger(Action onComplete)
        {
            if (_scanning)
            {
                return;
            }
            StartCoroutine(RunScan(onComplete));
        }

        private IEnumerator RunScan(Action onComplete)
        {
            _scanning = true;
            Debug.Log("BONE_SCAN_START");

            if (scanImage != null)
            {
                if (_material == null)
                {
                    _material = new Material(scanImage.material);
                    scanImage.material = _material;
                }
                scanImage.gameObject.SetActive(true);
            }
            if (promptText != null)
            {
                promptText.text = "HOLD STILL.";
                promptText.gameObject.SetActive(true);
            }
            audioKit?.PlayFlat("emerge_hiss"); // a cold electric hiss as the scan begins.

            float t = 0f;
            float total = TotalSeconds;
            while (t < total)
            {
                t += Time.deltaTime;
                if (_material != null)
                {
                    _material.SetFloat(ScanId, ScanAt(t));
                    _material.SetFloat(RevealId, RevealAt(t));
                }
                yield return null;
            }

            if (scanImage != null) scanImage.gameObject.SetActive(false);
            if (promptText != null) promptText.gameObject.SetActive(false);
            _scanning = false;
            onComplete?.Invoke();
        }
    }
}
