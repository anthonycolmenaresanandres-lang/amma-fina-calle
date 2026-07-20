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
        [SerializeField] private GameObject shadowAgentPrefab;

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
                director.OnEmerge += HandleEmerge;
                director.OnWin += HandleWin;
            }
        }

        private void OnDisable()
        {
            if (setupFlow != null) setupFlow.SetupCompleted -= HandleSetupCompleted;
            if (director != null)
            {
                director.OnEmerge -= HandleEmerge;
                director.OnWin -= HandleWin;
            }
        }

        private void HandleSetupCompleted()
        {
            StartRun();
        }

        private void StartRun()
        {
            ClearLiveShadows();

            _phase = RunPhase.Running;
            if (endCardPanel != null)
            {
                endCardPanel.SetActive(false);
            }

            director.StartRun();
            audioKit?.StartHeartbeat();
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

            audioKit?.PlayFlat("emerge_hiss");
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
                    HandleLose(nearestDistance);
                    return;
                }
            }

            if (audioKit != null && nearestDistance < float.MaxValue)
            {
                float intensity = 1f - Mathf.Clamp01(nearestDistance / HeartbeatMaxIntensityDistance);
                audioKit.SetHeartbeatIntensity(intensity);
            }
        }

        private void HandleLose(float nearestDistance)
        {
            _phase = RunPhase.Lost;
            director.StopRun();
            audioKit?.StopHeartbeat();
            audioKit?.PlayFlat("found_you");

            float survivalSeconds = director.Clock;
            Debug.Log("RUN_END result=LOSE survivalSeconds=" + survivalSeconds.ToString("F1"));

            ShowEndCard($"IT FOUND YOU\n{survivalSeconds:F1}s");
        }

        private void HandleWin()
        {
            if (_phase != RunPhase.Running)
            {
                return;
            }

            _phase = RunPhase.Won;
            audioKit?.StopHeartbeat();
            audioKit?.PlayFlat("dawn_chord");

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
