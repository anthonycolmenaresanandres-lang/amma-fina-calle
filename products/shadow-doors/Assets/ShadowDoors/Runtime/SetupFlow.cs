using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// The guided setup ritual (spec core loop step 1, player-instructions ruling
    /// 2026-07-21): Intro -&gt; ScanFloor -&gt; TagDoors -&gt; SetSafeCenter -&gt; ArmedReady -&gt;
    /// Ready. One plain instruction on screen at a time — a first-time player is led
    /// by the hand ("point at the floor", "tap the floor at each doorway", "tap OK
    /// when you are ready") and the night only starts on their final OK. Doubles as
    /// dread-building — deliberately unhurried, entirely player-paced via tap + a
    /// single confirm button. Emits the <c>SETUP_COMPLETE</c> log marker the L4
    /// on-device smoke test greps for.
    /// </summary>
    public class SetupFlow : MonoBehaviour
    {
        public enum SetupState
        {
            /// <summary>What this is + how to survive. OK begins scanning.</summary>
            Intro,
            ScanFloor,
            TagDoors,
            SetSafeCenter,
            /// <summary>Everything tagged; "lights low, sound up" — the night starts on the player's final OK.</summary>
            ArmedReady,
            Ready
        }

        /// <summary>Door-height gizmo visual height (m) per spec — a vertical bar snapped upright at each tagged door.</summary>
        public const float DoorGizmoHeight = 2.1f;

        [SerializeField] private MonoBehaviour arRigSource; // must implement IARRig; MonoBehaviour field so it's assignable in the Inspector.
        [SerializeField] private int minDoors = 1;
        [SerializeField] private int maxDoors = 4;

        [Header("UI (uGUI — one canvas, status text + confirm button, no art)")]
        [SerializeField] private Text statusText;
        [SerializeField] private Button confirmButton;

        [Header("Visuals")]
        [SerializeField] private GameObject doorGizmoPrefab; // a thin vertical quad/cylinder; scaled to DoorGizmoHeight on spawn.

        private IARRig _rig;
        private readonly List<Transform> _doorAnchors = new List<Transform>();

        /// <summary>Current ritual state.</summary>
        public SetupState State { get; private set; } = SetupState.Intro;

        /// <summary>Tagged door anchors in tap order — this order IS the scenario JSON's door index.</summary>
        public IReadOnlyList<Transform> DoorAnchors => _doorAnchors;

        /// <summary>The player's safe-center anchor, set in the SetSafeCenter step. Null until reached.</summary>
        public Transform SafeCenterAnchor { get; private set; }

        /// <summary>Fires once, when State transitions to Ready. GameLoop starts the run from this.</summary>
        public event Action SetupCompleted;

        private void Awake()
        {
            _rig = arRigSource as IARRig;
            if (_rig == null)
            {
                Debug.LogError("SetupFlow: arRigSource does not implement IARRig.");
            }

            if (confirmButton != null)
            {
                confirmButton.onClick.AddListener(OnConfirmPressed);
                // Visible from the start: Intro waits on the player's first OK.
                confirmButton.gameObject.SetActive(true);
            }
        }

        private void Update()
        {
            if (_rig == null)
            {
                return;
            }

            switch (State)
            {
                case SetupState.Intro:
                case SetupState.ArmedReady:
                    break; // both wait on the confirm button only.
                case SetupState.ScanFloor:
                    UpdateScanFloor();
                    break;
                case SetupState.TagDoors:
                case SetupState.SetSafeCenter:
                    PollTap();
                    break;
                case SetupState.Ready:
                    break;
            }

            UpdateStatusText();
        }

        private void UpdateScanFloor()
        {
            if (_rig.PlanesReady)
            {
                State = SetupState.TagDoors;
            }
        }

        // Tap = pointer-down this frame, via Input System (Touchscreen on device,
        // Mouse in editor/mock). ⚠ VERIFY: Touchscreen.current is null on desktop
        // players without a touch digitizer — the Mouse fallback below covers editor
        // testing with MockARRig, but confirm on the actual Android test phone that
        // Touchscreen.current.primaryTouch.press.wasPressedThisFrame fires reliably
        // (some AR sessions swallow touch input for gesture recognition).
        private bool TryGetTapScreenPosition(out Vector2 screenPosition)
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

        private void PollTap()
        {
            if (!TryGetTapScreenPosition(out Vector2 screenPos))
            {
                return;
            }

            if (!_rig.TryGetRaycastPose(screenPos, out Pose hitPose))
            {
                return;
            }

            if (State == SetupState.TagDoors)
            {
                TryTagDoor(hitPose);
            }
            else if (State == SetupState.SetSafeCenter)
            {
                SafeCenterAnchor = _rig.CreateAnchor(hitPose);
                if (confirmButton != null)
                {
                    confirmButton.gameObject.SetActive(true);
                }
            }
        }

        private void TryTagDoor(Pose hitPose)
        {
            if (_doorAnchors.Count >= maxDoors)
            {
                return; // Max reached — further taps ignored until confirm.
            }

            Pose snapped = SnapDoorPoseVertical(hitPose);
            Transform anchor = _rig.CreateAnchor(snapped);

            if (doorGizmoPrefab != null)
            {
                GameObject gizmo = Instantiate(doorGizmoPrefab, anchor);
                gizmo.transform.localPosition = new Vector3(0f, DoorGizmoHeight * 0.5f, 0f);
                gizmo.transform.localScale = new Vector3(gizmo.transform.localScale.x, DoorGizmoHeight, gizmo.transform.localScale.z);
            }

            _doorAnchors.Add(anchor);

            if (_doorAnchors.Count >= minDoors && confirmButton != null)
            {
                confirmButton.gameObject.SetActive(true);
            }
        }

        /// <summary>
        /// Zeroes pitch/roll so the door gizmo stands straight up regardless of the
        /// raycast hit normal (a doorway plane hit rarely comes back perfectly
        /// vertical) — pure function, easy to unit test in isolation.
        /// </summary>
        public static Pose SnapDoorPoseVertical(Pose hitPose)
        {
            Vector3 forward = hitPose.rotation * Vector3.forward;
            forward.y = 0f;
            if (forward.sqrMagnitude < 0.0001f)
            {
                forward = Vector3.forward;
            }

            Quaternion upright = Quaternion.LookRotation(forward.normalized, Vector3.up);
            return new Pose(hitPose.position, upright);
        }

        private void OnConfirmPressed()
        {
            if (confirmButton != null)
            {
                confirmButton.gameObject.SetActive(false);
            }

            switch (State)
            {
                case SetupState.Intro:
                    State = SetupState.ScanFloor;
                    break;

                case SetupState.TagDoors:
                    if (_doorAnchors.Count >= minDoors)
                    {
                        State = SetupState.SetSafeCenter;
                    }
                    break;

                case SetupState.SetSafeCenter:
                    if (SafeCenterAnchor != null)
                    {
                        // Armed, not started: the night begins on the player's FINAL
                        // OK — give them the beat to kill the lights first.
                        State = SetupState.ArmedReady;
                        if (confirmButton != null)
                        {
                            confirmButton.gameObject.SetActive(true);
                        }
                    }
                    break;

                case SetupState.ArmedReady:
                    State = SetupState.Ready;
                    Debug.Log("SETUP_COMPLETE " + JsonUtility.ToJson(new SetupCompleteMarker
                    {
                        doorCount = _doorAnchors.Count
                    }));
                    SetupCompleted?.Invoke();
                    break;
            }
        }

        private void UpdateStatusText()
        {
            if (statusText == null)
            {
                return;
            }

            // One plain instruction per screen (player-instructions ruling): short
            // imperative lines a first-time player can follow without help.
            switch (State)
            {
                case SetupState.Intro:
                    statusText.text = "SHADOW DOORS\n\n" +
                        "Shadows will come through your doorways.\n" +
                        "STARE at one to banish it.\n" +
                        "Never let one reach you.\n\n" +
                        "Tap OK to set up your room.";
                    break;
                case SetupState.ScanFloor:
                    statusText.text = "STEP 1 OF 3\n\n" +
                        "Point your phone at the FLOOR.\n" +
                        "Move it slowly from side to side\n" +
                        "until the next step appears.";
                    break;
                case SetupState.TagDoors:
                    // Floor-anchor ruling: the player taps the FLOOR at the threshold —
                    // floors lock instantly in ARCore; vertical door surfaces don't.
                    statusText.text = "STEP 2 OF 3\n\n" +
                        "Walk to each doorway.\n" +
                        "TAP THE FLOOR where the doorway meets it.\n" +
                        $"({_doorAnchors.Count} of {maxDoors} tagged — you need at least {minDoors}.)\n\n" +
                        (_doorAnchors.Count >= minDoors ? "Tap OK when every doorway is tagged." : "");
                    break;
                case SetupState.SetSafeCenter:
                    statusText.text = "STEP 3 OF 3\n\n" +
                        "Stand where you will hold your ground.\n" +
                        "TAP THE FLOOR at your feet.\n\n" +
                        (SafeCenterAnchor != null ? "Tap OK to continue." : "");
                    break;
                case SetupState.ArmedReady:
                    statusText.text = "Your room is ready.\n\n" +
                        "Turn the lights LOW.\n" +
                        "Turn the sound UP.\n\n" +
                        "Survive until dawn — 3 minutes.\n\n" +
                        "Tap OK to begin.";
                    break;
                case SetupState.Ready:
                    statusText.text = "It begins.";
                    break;
            }
        }

        [Serializable]
        private class SetupCompleteMarker
        {
            public int doorCount;
        }
    }
}
