using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// The Offering (Anthony's hook, take 2, 2026-07-21): "the first 30 seconds is
    /// playing a game — but because the player played, it had consequences." Glowing
    /// coins appear on the floor near the doorways. A frightened voice begs the
    /// player not to take them ("please... don't"). The player, being a player,
    /// takes them anyway — and THAT is what starts the night. The coins belong to it.
    ///
    /// Refusal path: after OfferingTimeoutSeconds untouched, the coins sink back into
    /// the floor ("your refusal is an answer") and the night begins regardless — the
    /// game can never wedge on an obedient player.
    ///
    /// GameLoop calls <see cref="Begin"/> after setup completes and starts the night
    /// on <see cref="OfferingCompleted"/>. Null-safe throughout (scaffold rule):
    /// no coin prefab = coins never spawn = timeout completes the phase.
    /// </summary>
    public class CoinOffering : MonoBehaviour
    {
        /// <summary>How many coins are laid out.</summary>
        public const int CoinCount = 5;

        /// <summary>Refusal timeout (s): untouched coins sink and the night starts anyway.</summary>
        public const float OfferingTimeoutSeconds = 45f;

        /// <summary>Beat (s) between the final warning ("IT KNOWS") and the night starting.</summary>
        public const float TransgressionBeatSeconds = 2.5f;

        /// <summary>Max tap-raycast distance (m).</summary>
        public const float TapRayMeters = 6f;

        [Tooltip("Quad + OfferingCoin + ShadowDoors/OfferingCoin material + SphereCollider (see runbook).")]
        [SerializeField] private GameObject coinPrefab;
        [Tooltip("One-line warning text (the begging voice's subtitles). Optional.")]
        [SerializeField] private Text warningText;
        [SerializeField] private AudioKit audioKit;

        private readonly List<OfferingCoin> _coins = new List<OfferingCoin>();
        private IARRig _rig;
        private float _timer;
        private int _collected;
        private bool _active;

        /// <summary>Fires once when the offering resolves (taken OR refused). GameLoop starts the night here.</summary>
        public event Action OfferingCompleted;

        /// <summary>
        /// True if the offering resolved by REFUSAL (coins left untouched to the
        /// timeout) rather than greed. GameLoop reads this to punish defiance —
        /// there was never a safe choice: taking is theft, refusing is insult.
        /// </summary>
        public bool WasRefused { get; private set; }

        /// <summary>
        /// Which voice line a collection triggers — pure and unit-testable (house L1
        /// rule). 1st coin: the plea. 2nd: the warning. Last: the turn. Null = text-only.
        /// </summary>
        public static string WarningLineFor(int collectedCount)
        {
            switch (collectedCount)
            {
                case 1: return "please_dont";
                case 2: return "leave_them";
                case CoinCount: return "it_knows";
                default: return null;
            }
        }

        /// <summary>Lay out the coins on the floor near the tagged thresholds and start listening for greed.</summary>
        public void Begin(IReadOnlyList<Transform> doorAnchors, IARRig rig)
        {
            _rig = rig;
            _timer = 0f;
            _collected = 0;
            _active = true;
            SetWarning("");

            if (coinPrefab == null || doorAnchors == null || doorAnchors.Count == 0)
            {
                return; // no coins = refusal path via timeout; the phase still resolves.
            }

            for (int i = 0; i < CoinCount; i++)
            {
                Transform anchor = doorAnchors[i % doorAnchors.Count];
                // Scatter on the floor around the threshold — inside the room, where
                // walking to them feels natural. Anchor Y IS floor height (floor-tag ruling).
                Vector3 offset = new Vector3(
                    UnityEngine.Random.Range(-0.9f, 0.9f),
                    0.02f,
                    UnityEngine.Random.Range(0.3f, 1.1f));
                Vector3 position = anchor.position + anchor.rotation * offset;
                position.y = anchor.position.y + 0.02f;

                GameObject coin = Instantiate(coinPrefab, position, Quaternion.Euler(90f, 0f, 0f));
                OfferingCoin offeringCoin = coin.GetComponent<OfferingCoin>();
                if (offeringCoin != null)
                {
                    _coins.Add(offeringCoin);
                }
            }
        }

        private void Update()
        {
            if (!_active)
            {
                return;
            }

            _timer += Time.deltaTime;
            if (_timer >= OfferingTimeoutSeconds)
            {
                Refuse();
                return;
            }

            if (_coins.Count > 0 && TryGetTapScreenPosition(out Vector2 screenPos))
            {
                TryCollectAt(screenPos);
            }
        }

        // Same tap convention as SetupFlow: Touchscreen on device, Mouse in editor/mock.
        private static bool TryGetTapScreenPosition(out Vector2 screenPosition)
        {
            Touchscreen touch = Touchscreen.current;
            if (touch != null && touch.primaryTouch.press.wasPressedThisFrame)
            {
                screenPosition = touch.primaryTouch.position.ReadValue();
                return true;
            }

            Mouse mouse = Mouse.current;
            if (mouse != null && mouse.leftButton.wasPressedThisFrame)
            {
                screenPosition = mouse.position.ReadValue();
                return true;
            }

            screenPosition = default;
            return false;
        }

        private void TryCollectAt(Vector2 screenPos)
        {
            // Physics raycast against the coins' SphereColliders. Camera.main is the
            // AR camera (runbook: tag it MainCamera) — without it, taps are ignored
            // and the refusal timeout still resolves the phase (scaffold rule).
            Camera cam = Camera.main;
            if (cam == null)
            {
                return;
            }

            Ray ray = cam.ScreenPointToRay(screenPos);
            if (!Physics.Raycast(ray, out RaycastHit hit, TapRayMeters))
            {
                return;
            }

            OfferingCoin coin = hit.collider.GetComponentInParent<OfferingCoin>();
            if (coin == null || !_coins.Remove(coin))
            {
                return;
            }

            coin.Collect();
            _collected++;

            string line = WarningLineFor(_collected);
            if (line != null)
            {
                audioKit?.PlayFlat(line);
            }
            SetWarning(WarningTextFor(_collected));

            if (_collected >= CoinCount)
            {
                _active = false;
                StartCoroutine(CompleteAfterBeat());
            }
        }

        /// <summary>Subtitle ladder — pure for the same testability reason as WarningLineFor.</summary>
        public static string WarningTextFor(int collectedCount)
        {
            switch (collectedCount)
            {
                case 1: return "please... don't.";
                case 2: return "put them back.";
                case 3: return "PUT THEM BACK.";
                case 4: return "...";
                case CoinCount: return "IT KNOWS WHAT YOU TOOK.";
                default: return "";
            }
        }

        private void Refuse()
        {
            _active = false;
            WasRefused = true;
            foreach (OfferingCoin coin in _coins)
            {
                if (coin != null)
                {
                    coin.Sink();
                }
            }
            _coins.Clear();
            // Defiance is its own sin — the entity answers in its own voice, angrier
            // than the greed line. GameLoop punishes the night for it (see _angered).
            audioKit?.PlayFlat("you_cannot_refuse");
            SetWarning("YOU CANNOT REFUSE ME.");
            StartCoroutine(CompleteAfterBeat());
        }

        private IEnumerator CompleteAfterBeat()
        {
            yield return new WaitForSeconds(TransgressionBeatSeconds);
            SetWarning("");
            OfferingCompleted?.Invoke();
        }

        private void SetWarning(string text)
        {
            if (warningText != null)
            {
                warningText.text = text;
            }
        }
    }
}
