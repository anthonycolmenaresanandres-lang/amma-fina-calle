using UnityEngine;
using UnityEngine.InputSystem;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// Editor-only <see cref="IARRig"/> substitute: a fixed room with a floor plane at
    /// y=0 and scripted door slots the designer places in the scene ahead of time. This
    /// is what makes the L2 PlayMode requirement possible — the ENTIRE game loop (setup
    /// ritual, scenario, banish, win/lose) must run without a device. WASD + mouse-look
    /// drives the camera in place of head tracking.
    /// </summary>
    public class MockARRig : MonoBehaviour, IARRig
    {
        [Tooltip("Simulated scan time before PlanesReady flips true, mirroring real ARCore plane-lock latency.")]
        [SerializeField] private float scanDelaySeconds = 1f;

        [Tooltip("Fixed door slots in the mock room. TryGetRaycastPose hits whichever is closest to the aim ray; SetupFlow taps these in order during TagDoors.")]
        [SerializeField] private Transform[] scriptedDoorSlots;

        [Tooltip("Radius (m) within which a raycast is considered to have 'hit' a scripted door slot — stands in for a real plane-polygon hit test.")]
        [SerializeField] private float doorHitRadius = 0.6f;

        [SerializeField] private float floorY;
        [SerializeField] private float moveSpeed = 2f;
        [SerializeField] private float lookSensitivity = 2f;

        private Camera _camera;
        private float _scanTimer;
        private float _yaw;
        private float _pitch;

        private void Awake()
        {
            _camera = GetComponentInChildren<Camera>();
            if (_camera == null)
            {
                var camGo = new GameObject("MockARRig_Camera");
                camGo.transform.SetParent(transform, false);
                _camera = camGo.AddComponent<Camera>();
            }

            Vector3 euler = _camera.transform.eulerAngles;
            _yaw = euler.y;
            _pitch = euler.x;
        }

        private void Update()
        {
            _scanTimer += Time.deltaTime;
            DriveFreeCamera();
        }

        // Simple dev-mode fly camera so a human can play-test the full loop with
        // keyboard + mouse in the editor. Input System's Keyboard/Mouse are used
        // directly rather than the legacy Input class per house convention (project
        // already depends on com.unity.inputsystem).
        // ⚠ VERIFY: assumes the project's Active Input Handling is set to "Input
        // System Package (New)" or "Both" — under "Input Manager (Old)" only,
        // Keyboard.current/Mouse.current are both null and this silently no-ops.
        private void DriveFreeCamera()
        {
            Keyboard keyboard = Keyboard.current;
            Mouse mouse = Mouse.current;
            if (keyboard == null)
            {
                return;
            }

            Vector3 move = Vector3.zero;
            if (keyboard.wKey.isPressed) move += Vector3.forward;
            if (keyboard.sKey.isPressed) move += Vector3.back;
            if (keyboard.aKey.isPressed) move += Vector3.left;
            if (keyboard.dKey.isPressed) move += Vector3.right;

            if (mouse != null && mouse.rightButton.isPressed)
            {
                Vector2 delta = mouse.delta.ReadValue();
                _yaw += delta.x * lookSensitivity * 0.02f;
                _pitch = Mathf.Clamp(_pitch - delta.y * lookSensitivity * 0.02f, -80f, 80f);
            }

            _camera.transform.rotation = Quaternion.Euler(_pitch, _yaw, 0f);
            _camera.transform.position += _camera.transform.rotation * move.normalized * moveSpeed * Time.deltaTime;
        }

        /// <inheritdoc />
        public Pose CameraPose => new Pose(_camera.transform.position, _camera.transform.rotation);

        /// <inheritdoc />
        public bool PlanesReady => _scanTimer >= scanDelaySeconds;

        /// <inheritdoc />
        public bool TryGetRaycastPose(Vector2 screenPoint, out Pose pose)
        {
            pose = Pose.identity;

            Ray ray = _camera.ScreenPointToRay(screenPoint);

            // First: does the aim ray pass near a scripted door slot? Closest-slot wins,
            // matching "tap a real doorway" during TagDoors.
            Transform closestDoor = null;
            float closestDoorDist = float.MaxValue;
            if (scriptedDoorSlots != null)
            {
                foreach (Transform slot in scriptedDoorSlots)
                {
                    if (slot == null) continue;

                    Vector3 toSlot = slot.position - ray.origin;
                    float along = Vector3.Dot(toSlot, ray.direction);
                    if (along <= 0f) continue;

                    Vector3 closestPointOnRay = ray.origin + ray.direction * along;
                    float lateralDist = Vector3.Distance(closestPointOnRay, slot.position);
                    if (lateralDist <= doorHitRadius && along < closestDoorDist)
                    {
                        closestDoorDist = along;
                        closestDoor = slot;
                    }
                }
            }

            if (closestDoor != null)
            {
                pose = new Pose(closestDoor.position, closestDoor.rotation);
                return true;
            }

            // Otherwise: intersect the fixed floor plane at y = floorY (stands in for
            // ARCore's horizontal plane hit test during ScanFloor / SetSafeCenter).
            var floorPlane = new Plane(Vector3.up, new Vector3(0f, floorY, 0f));
            if (floorPlane.Raycast(ray, out float enter))
            {
                Vector3 hitPoint = ray.GetPoint(enter);
                pose = new Pose(hitPoint, Quaternion.identity);
                return true;
            }

            return false;
        }

        /// <inheritdoc />
        public Transform CreateAnchor(Pose pose)
        {
            // Mock anchors never drift — a plain Transform is the whole simulation.
            var anchorGo = new GameObject("MockARRig_Anchor");
            anchorGo.transform.SetPositionAndRotation(pose.position, pose.rotation);
            return anchorGo.transform;
        }
    }
}
