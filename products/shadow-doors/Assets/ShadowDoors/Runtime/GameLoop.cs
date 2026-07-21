using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// Wires setup -&gt; scenario -&gt; shadows -&gt; banish -&gt; win/lose together. Owns the
    /// RUN_END log marker (it's the only system aware of BOTH win and lose — see the
    /// note on ScenarioDirector.OnWin). R key or a 2s tap-and-hold restarts the run
    /// WITHOUT re-scanning (SetupFlow's anchors are reused as-is).
    /// </summary>
    public class GameLoop : MonoBehaviour
    {
        /// <summary>A shadow reaching within this distance (m) of the camera ends the run in a Lose, per spec.</summary>
        public const float FailDistanceMeters = 0.5f;

        /// <summary>Tap-and-hold duration (s) that restarts a run, matching the "R key OR tap-and-hold 2s" spec alternative.</summary>
        public const float RestartHoldSeconds = 2f;

        /// <summary>Distance (m) at which heartbeat intensity saturates to 1 — inverse-distance mapping's near bound.</summary>
        public const float HeartbeatMaxIntensityDistance = 5f;

        [SerializeField] private MonoBehaviour arRigSource; // must implement IARRig.
        [SerializeField] private SetupFlow setupFlow;
        [SerializeField] private ScenarioDirector director;
        [SerializeField] private BanishSystem banishSystem;
        [SerializeField] private AudioKit audioKit;
        [Tooltip("The consumed-by-darkness lose sequence. Optional — null falls back to an immediate end card.")]
        [SerializeField] private ConsumedFX consumedFx;
        [SerializeField] private GameObject shadowAgentPrefab;
        [Tooltip("Breach portal (DarknessPortal) spawned over the doorway before each emerge. Optional — null spawns shadows directly with no breach visual (scaffold rule).")]
        [SerializeField] private GameObject darknessPortalPrefab;
        [Tooltip("Eyes-only apparition (WatcherEyes) spawned near thresholds on whisper beats. Optional — null skips the watched feeling (scaffold rule).")]
        [SerializeField] private GameObject watcherEyesPrefab;
        [Tooltip("Screen-space evil filter driven by shadow presence. Optional — null skips it (scaffold rule).")]
        [SerializeField] private EvilVeil evilVeil;

        [Header("End cards (uGUI panel: 'IT FOUND YOU' + time, or 'DAWN')")]
        [SerializeField] private GameObject endCardPanel;
        [SerializeField] private Text endCardText;

        private enum RunPhase
        {
            AwaitingSetup,
            Running,
            Lost,
            Won
        }

        private IARRig _rig;
        private RunPhase _phase = RunPhase.AwaitingSetup;
        private int _nextDemonicVoiceIndex;
        private readonly List<ShadowAgent> _liveShadows = new List<ShadowAgent>();
        private float _holdTimer;

        private void Awake()
        {
            _rig = arRigSource as IARRig;
            if (_rig == null)
            {
                Debug.LogError("GameLoop: arRigSource does not implement IARRig.");
            }

            if (endCardPanel != null)
            {
                endCardPanel.SetActive(false);
            }
        }

        private void OnEnable()
        {
            if (setupFlow != null) setupFlow.SetupCompleted += HandleSetupCompleted;
            if (director != null)
            {
                director.OnWhisper += HandleWhisper;
                director.OnEmerge += HandleEmerge;
                director.OnWin += HandleWin;
            }
            if (banishSystem != null) banishSystem.ShadowBanished += HandleBanish;
        }

        private void OnDisable()
        {
            if (setupFlow != null) setupFlow.SetupCompleted -= HandleSetupCompleted;
            if (director != null)
            {
                director.OnWhisper -= HandleWhisper;
                director.OnEmerge -= HandleEmerge;
                director.OnWin -= HandleWin;
            }
            if (banishSystem != null) banishSystem.ShadowBanished -= HandleBanish;
        }

        private void HandleSetupCompleted()
        {
            StartRun();
        }

        // The whisper beat became the WATCHED beat (Anthony's device-playtest ruling):
        // a single distant muffled bell toll at the door — Undertaker-style — plus
        // eyes-only apparitions at a random offset near the threshold. Different spot
        // every time; no gameplay threat; pure "something is watching".
        private void HandleWhisper(int doorIndex)
        {
            if (_phase != RunPhase.Running || setupFlow == null)
            {
                return;
            }

            IReadOnlyList<Transform> doors = setupFlow.DoorAnchors;
            if (doors.Count == 0)
            {
                return;
            }

            Transform doorAnchor = doors[doorIndex % doors.Count];
            audioKit?.PlayAtAnchor("bell_far", doorAnchor, false);

            if (watcherEyesPrefab != null)
            {
                Vector3 offset = new Vector3(
                    Random.Range(-0.8f, 0.8f),
                    Random.Range(0.2f, 0.45f), // low to the floor — where nothing should be looking from.
                    Random.Range(-0.3f, 0.3f));
                GameObject instance = Instantiate(watcherEyesPrefab, doorAnchor.position + offset, Quaternion.identity);
                WatcherEyes eyes = instance.GetComponent<WatcherEyes>();
                if (eyes != null)
                {
                    eyes.Initialize(_rig);
                }
            }
        }

        private void HandleBanish(ShadowAgent shadow)
        {
            if (_phase == RunPhase.Running)
            {
                audioKit?.PlayFlat("banish_stinger");
            }
        }

        private void StartRun()
        {
            // Kill any in-flight SpawnShadowAfterBreach from the previous run — its
            // _phase guard sees the NEW run as Running, so without this a restart
            // inside the 0.8 s bleed window would leak a stray shadow into the fresh
            // run. (Only breach coroutines live on this component; ConsumedFX owns its
            // own.)
            StopAllCoroutines();
            ClearLiveShadows();

            _phase = RunPhase.Running;
            if (endCardPanel != null)
            {
                endCardPanel.SetActive(false);
            }

            director.StartRun();
            audioKit?.StartHeartbeat();
            // The bell bed (replaced the chant per Anthony's device-playtest ruling —
            // Undertaker-style funeral tolls): starts with the run, low in the mix.
            // Its cut at black-complete (ConsumedFX) is a designed beat — never stop
            // it anywhere else on the lose path.
            audioKit?.StartAmbient("bells_loop", 0.4f);
        }

        private void ClearLiveShadows()
        {
            foreach (ShadowAgent shadow in _liveShadows)
            {
                if (shadow != null)
                {
                    Destroy(shadow.gameObject);
                }
            }
            _liveShadows.Clear();
        }

        private void HandleEmerge(int doorIndex, float speed)
        {
            if (_phase != RunPhase.Running || setupFlow == null || shadowAgentPrefab == null)
            {
                return;
            }

            IReadOnlyList<Transform> doors = setupFlow.DoorAnchors;
            if (doors.Count == 0)
            {
                return;
            }

            // Scenario may reference a door index beyond how many were actually
            // tagged (min 1 allowed) — wrap rather than skip the beat entirely, so a
            // 1-door setup still plays the full escalation against that one door.
            Transform doorAnchor = doors[doorIndex % doors.Count];

            // Late-run escalation (Anthony's direction): shadows past the halfway mark SPEAK.
            // Alternating demonic lines, spatialized AT the emerge door so the voice comes
            // from the doorway itself.
            if (director != null && director.Clock > 90f && audioKit != null)
            {
                string line = (_nextDemonicVoiceIndex++ % 2 == 0) ? "demonic_voice_a" : "demonic_voice_b";
                audioKit.PlayAtAnchor(line, doorAnchor, false);
            }

            // The hiss belongs to the BREACH, not the body — it plays the moment the
            // darkness starts bleeding over the opening, on both paths below.
            audioKit?.PlayFlat("emerge_hiss");

            if (darknessPortalPrefab != null)
            {
                SpawnBreachPortal(doorAnchor);
                // The shadow steps out of an already-open breach: delayed by exactly
                // the portal's bleed-open time.
                StartCoroutine(SpawnShadowAfterBreach(doorAnchor, doorIndex, speed));
            }
            else
            {
                SpawnShadow(doorAnchor, doorIndex, speed);
            }
        }

        // Floor-anchor ruling (Anthony, 2026-07-20): the breach is a darkness STAIN
        // spreading flat ON the floor at the tagged threshold — anchors live on the
        // floor (instant, reliable ARCore plane) and the shadow rises up through the
        // stain. Fully placement-agnostic: a pool of darkness on the floor reads
        // correctly at any doorway, archway, or window with zero dependency on the
        // vertical surface. Parented to the anchor so AR tracking updates carry it.
        private void SpawnBreachPortal(Transform doorAnchor)
        {
            Vector3 position = doorAnchor.position + Vector3.up * DarknessPortal.FloorLiftMeters;
            Quaternion rotation = Quaternion.Euler(90f, 0f, 0f); // quad lies flat on the floor; shader is radial, yaw irrelevant.
            Instantiate(darknessPortalPrefab, position, rotation, doorAnchor);
        }

        private System.Collections.IEnumerator SpawnShadowAfterBreach(Transform doorAnchor, int doorIndex, float speed)
        {
            yield return new WaitForSeconds(DarknessPortal.OpenSeconds);

            // The run may have ended (or the anchor been torn down by a restart's
            // ClearLiveShadows/rescan) during the bleed — a breach with no run behind
            // it must not spawn a hunter.
            if (_phase != RunPhase.Running || doorAnchor == null)
            {
                yield break;
            }

            SpawnShadow(doorAnchor, doorIndex, speed);
        }

        private void SpawnShadow(Transform doorAnchor, int doorIndex, float speed)
        {
            GameObject instance = Instantiate(shadowAgentPrefab, doorAnchor.position, doorAnchor.rotation);
            ShadowAgent shadow = instance.GetComponent<ShadowAgent>();
            if (shadow == null)
            {
                Debug.LogError("GameLoop: shadowAgentPrefab has no ShadowAgent component.");
                Destroy(instance);
                return;
            }

            shadow.Initialize(doorIndex, speed, _rig);
            _liveShadows.Add(shadow);
            banishSystem?.Register(shadow);
        }

        private void Update()
        {
            if (_phase == RunPhase.Running)
            {
                TickRunning();
            }

            TickRestartInput();
        }

        private void TickRunning()
        {
            float nearestDistance = float.MaxValue;

            for (int i = _liveShadows.Count - 1; i >= 0; i--)
            {
                ShadowAgent shadow = _liveShadows[i];
                if (shadow == null)
                {
                    _liveShadows.RemoveAt(i);
                    continue;
                }

                if (shadow.DistanceToCamera < nearestDistance)
                {
                    nearestDistance = shadow.DistanceToCamera;
                }

                if (shadow.State == ShadowAgent.ShadowState.Hunting && shadow.DistanceToCamera <= FailDistanceMeters)
                {
                    HandleLose(shadow);
                    return;
                }
            }

            if (audioKit != null && nearestDistance < float.MaxValue)
            {
                float intensity = 1f - Mathf.Clamp01(nearestDistance / HeartbeatMaxIntensityDistance);
                audioKit.SetHeartbeatIntensity(intensity);
            }

            // The evil veil follows presence, not lighting: the screen turns wrong
            // while anything is out of a door, recovers when the room is clear.
            evilVeil?.SetPresence(_liveShadows.Count > 0);
        }

        private void HandleLose(ShadowAgent killer)
        {
            _phase = RunPhase.Lost;
            director.StopRun();
            evilVeil?.SetPresence(false); // the iris close owns the screen from here.

            float survivalSeconds = director.Clock;
            Debug.Log("RUN_END result=LOSE survivalSeconds=" + survivalSeconds.ToString("F1"));

            // Consumed sequence (Anthony's design): the killer lunges to fill the view and
            // the darkness closes in like an iris; ConsumedFX owns the heartbeat pin, the
            // cut-to-silence + found_you slam at black-complete, and the card delay so the
            // black gets to sit alone first. Fallback (no FX wired): the original immediate
            // card, so a missing art ref can never wedge the lose path (scaffold rule).
            string cardText = $"IT FOUND YOU\n{survivalSeconds:F1}s";
            if (consumedFx != null)
            {
                consumedFx.Play(killer, _rig, audioKit, () => ShowEndCard(cardText));
            }
            else
            {
                audioKit?.StopHeartbeat();
                audioKit?.PlayFlat("found_you");
                ShowEndCard(cardText);
            }
        }

        private void HandleWin()
        {
            if (_phase != RunPhase.Running)
            {
                return;
            }

            _phase = RunPhase.Won;
            evilVeil?.SetPresence(false);
            audioKit?.StopHeartbeat();
            audioKit?.PlayFlat("dawn_chord");
            // The parting whisper: dawn came — "For now." (main voice, delayed under the chord).
            audioKit?.PlayFlatDelayed("main_voice_dawn", 1.5f);

            Debug.Log("RUN_END result=WIN survivalSeconds=" + director.Duration.ToString("F1"));

            ShowEndCard("DAWN");
        }

        private void ShowEndCard(string text)
        {
            if (endCardPanel != null)
            {
                endCardPanel.SetActive(true);
            }
            if (endCardText != null)
            {
                endCardText.text = text;
            }
        }

        // R key OR tap-and-hold 2s. Only active once a run has actually ended —
        // restarting mid-run isn't part of the spec's core loop.
        private void TickRestartInput()
        {
            if (_phase != RunPhase.Lost && _phase != RunPhase.Won)
            {
                _holdTimer = 0f;
                return;
            }

            Keyboard keyboard = Keyboard.current;
            if (keyboard != null && keyboard.rKey.wasPressedThisFrame)
            {
                StartRun();
                return;
            }

            bool holding = IsPointerHeld();
            if (holding)
            {
                _holdTimer += Time.deltaTime;
                if (_holdTimer >= RestartHoldSeconds)
                {
                    _holdTimer = 0f;
                    StartRun();
                }
            }
            else
            {
                _holdTimer = 0f;
            }
        }

        private static bool IsPointerHeld()
        {
            Touchscreen touch = Touchscreen.current;
            if (touch != null && touch.primaryTouch.press.isPressed)
            {
                return true;
            }

            Mouse mouse = Mouse.current;
            return mouse != null && mouse.leftButton.isPressed;
        }
    }
}
