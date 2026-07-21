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
        [Tooltip("Camera-space skeleton-arm jump scare. Optional — null skips it (scaffold rule).")]
        [SerializeField] private SkeletonArm skeletonArm;
        [Tooltip("The Offering opener (coins that belong to IT). Optional — null starts the night directly (scaffold rule).")]
        [SerializeField] private CoinOffering coinOffering;
        [Tooltip("Ambient floor-grasper hands (half-out-of-floor dread). Optional (scaffold rule).")]
        [SerializeField] private FloorGraspers floorGraspers;

        // ---- suspense progression (Anthony, 2026-07-21): the night gets WORSE ----
        /// <summary>Ambient bell-bed volume at minute zero.</summary>
        public const float AmbientVolumeStart = 0.30f;
        /// <summary>Ambient bell-bed volume as dawn approaches.</summary>
        public const float AmbientVolumeEnd = 0.55f;
        /// <summary>Evil-veil floor at the START of the night — the filter is ALWAYS present, faintly (Anthony: "bring the filter screen back").</summary>
        public const float VeilBaselineAtStart = 0.14f;
        /// <summary>Evil-veil floor near the end of the night — the room never fully recovers late.</summary>
        public const float VeilBaselineAtDawn = 0.4f;
        /// <summary>Shadow glide-speed multiplier by the end of the night (applied at spawn).</summary>
        public const float LateSpeedMultiplier = 1.3f;

        // Skeleton-arm scare beats, as fractions of night progress. Once each per run.
        private static readonly float[] ArmScareAtProgress = { 0.45f, 0.85f };
        private readonly bool[] _armScareFired = new bool[2];


        // ---- the hook (Anthony, 2026-07-21): false safety, then we move in ----
        /// <summary>How far the bells/veil sink during a scripted lull (multiplier on their normal levels).</summary>
        public const float CalmFloor = 0.15f;
        /// <summary>Seconds for the calm to settle in — and for the world to surge back after it breaks.</summary>
        public const float CalmTransitionSeconds = 2.5f;

        private float _calmUntilClock;
        private float _calmMultiplier = 1f;

        /// <summary>Refusal punishment: every shadow is this much faster ALL night when the player denied the offering.</summary>
        public const float AngerSpeedMultiplier = 1.25f;
        // Set when the Offering was REFUSED. Persists across restarts (you don't get to
        // un-defy it) — reset only by a fresh setup, which re-runs the Offering.
        private bool _angered;

        [Header("End cards (uGUI panel: 'IT FOUND YOU' + time, or 'DAWN')")]
        [SerializeField] private GameObject endCardPanel;
        [SerializeField] private Text endCardText;

        private enum RunPhase
        {
            AwaitingSetup,
            /// <summary>The Offering: coins on the floor, a voice begging you not to. Taking them starts the night.</summary>
            Offering,
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
                director.OnLull += HandleLull;
                director.OnWin += HandleWin;
            }
            if (banishSystem != null) banishSystem.ShadowBanished += HandleBanish;
            if (coinOffering != null) coinOffering.OfferingCompleted += HandleOfferingCompleted;
        }

        private void OnDisable()
        {
            if (setupFlow != null) setupFlow.SetupCompleted -= HandleSetupCompleted;
            if (director != null)
            {
                director.OnWhisper -= HandleWhisper;
                director.OnEmerge -= HandleEmerge;
                director.OnLull -= HandleLull;
                director.OnWin -= HandleWin;
            }
            if (banishSystem != null) banishSystem.ShadowBanished -= HandleBanish;
            if (coinOffering != null) coinOffering.OfferingCompleted -= HandleOfferingCompleted;
        }

        // The false dawn: everything goes quiet ON PURPOSE — the player is meant to
        // think it's over. The next emerge (HandleEmerge) breaks it instantly, so the
        // world surges back WITH the shadow.
        private void HandleLull(float seconds)
        {
            if (_phase == RunPhase.Running && director != null)
            {
                _calmUntilClock = director.Clock + seconds;
            }
        }

        // First run goes through the Offering (the hook: playing the innocent coin
        // game is what CAUSES the night). Restarts skip it — StartRun directly —
        // because the transgression already happened; you don't get to un-take them.
        private void HandleSetupCompleted()
        {
            _angered = false; // fresh setup = fresh offering; anger is earned this run.
            if (coinOffering != null && setupFlow != null)
            {
                _phase = RunPhase.Offering;
                coinOffering.Begin(setupFlow.DoorAnchors, _rig);
            }
            else
            {
                StartRun();
            }
        }

        private void HandleOfferingCompleted()
        {
            if (_phase == RunPhase.Offering)
            {
                // There was never a safe choice: greed damns you, and so does defiance.
                // Refusal makes the whole night angrier (see StartRun + HandleEmerge).
                _angered = coinOffering != null && coinOffering.WasRefused;
                StartRun();
            }
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

            for (int i = 0; i < _armScareFired.Length; i++)
            {
                _armScareFired[i] = false;
            }
            _calmUntilClock = 0f;
            _calmMultiplier = 1f;

            director.StartRun();
            audioKit?.StartHeartbeat();
            // The bell bed (replaced the chant per Anthony's device-playtest ruling —
            // Undertaker-style funeral tolls): starts with the run, low in the mix,
            // and swells over the night (suspense progression — see TickRunning).
            // Its cut at black-complete (ConsumedFX) is a designed beat — never stop
            // it anywhere else on the lose path.
            audioKit?.StartAmbient("bells_loop", AmbientVolumeStart);

            // Straining hands surface around the player all night ("half coming out
            // like it wants to but it can't"), centered on the safe spot.
            floorGraspers?.Begin(setupFlow != null ? setupFlow.SafeCenterAnchor : null);

            // Refusal punishment: the entity lashes out the INSTANT the night starts —
            // no Quiet Minute grace for defiance. The skeleton hand snatches at you the
            // moment you denied it. (Greed gets the slow dread build; defiance gets a
            // slap.) Speed penalty is applied per-spawn in HandleEmerge.
            if (_angered)
            {
                audioKit?.PlayFlat("emerge_hiss");
                skeletonArm?.Play(_rig);
            }
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

            // Suspense progression: late-night shadows are faster than the scenario's
            // authored speed — the same doorway stops feeling survivable.
            speed *= Mathf.Lerp(1f, LateSpeedMultiplier, NightProgress);

            // Refusal punishment stacks on top: a defied night is faster start to end.
            if (_angered)
            {
                speed *= AngerSpeedMultiplier;
            }

            // The hook's payoff: an emerge BREAKS any lull instantly — bells and veil
            // surge back with the shadow. Safety was the setup.
            _calmUntilClock = 0f;

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

            if (audioKit != null)
            {
                // Empty room = calm pulse. (Previously the heartbeat froze at its last
                // intensity after a banish — it must come DOWN for the lull to read.)
                float intensity = nearestDistance < float.MaxValue
                    ? 1f - Mathf.Clamp01(nearestDistance / HeartbeatMaxIntensityDistance)
                    : 0f;
                audioKit.SetHeartbeatIntensity(intensity);
            }

            // The evil veil follows presence, not lighting: the screen turns wrong
            // while anything is out of a door, recovers when the room is clear.
            evilVeil?.SetPresence(_liveShadows.Count > 0);

            floorGraspers?.Tick(NightProgress);

            TickSuspenseProgression();
        }

        /// <summary>0 at the first second of the night, 1 at dawn.</summary>
        private float NightProgress =>
            director != null && director.Duration > 0f
                ? Mathf.Clamp01(director.Clock / director.Duration)
                : 0f;

        // Suspense progression (Anthony, 2026-07-21): the night itself escalates —
        // bells swell, the veil's floor creeps up so the room never fully feels safe
        // late, and the skeleton arm reaches in at fixed beats. Per-shadow speed
        // scaling happens at spawn (HandleEmerge).
        private void TickSuspenseProgression()
        {
            float progress = NightProgress;

            // The hook's calm multiplier: sinks toward CalmFloor during a scripted
            // lull, surges back to 1 once it breaks. Applied to the bells AND the
            // veil floor so "safe" reads on both channels at once.
            bool calm = director != null && director.Clock < _calmUntilClock;
            _calmMultiplier = Mathf.MoveTowards(
                _calmMultiplier, calm ? CalmFloor : 1f, Time.deltaTime / CalmTransitionSeconds);

            audioKit?.SetAmbientVolume(Mathf.Lerp(AmbientVolumeStart, AmbientVolumeEnd, progress) * _calmMultiplier);
            // The filter is on from the first second (faint) and deepens toward dawn;
            // shadow presence still spikes it above this floor.
            evilVeil?.SetBaseline(Mathf.Lerp(VeilBaselineAtStart, VeilBaselineAtDawn, progress) * _calmMultiplier);

            for (int i = 0; i < ArmScareAtProgress.Length; i++)
            {
                if (!_armScareFired[i] && progress >= ArmScareAtProgress[i])
                {
                    _armScareFired[i] = true;
                    if (skeletonArm != null)
                    {
                        audioKit?.PlayFlat("emerge_hiss");
                        skeletonArm.Play(_rig);
                    }
                }
            }
        }

        private void HandleLose(ShadowAgent killer)
        {
            _phase = RunPhase.Lost;
            director.StopRun();
            floorGraspers?.Stop();
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
            floorGraspers?.Stop();
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
