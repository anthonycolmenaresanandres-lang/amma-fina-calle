using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems; // TrackableType — ⚠ VERIFY this is still where it lives in 6.0.4

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// Real-device <see cref="IARRig"/> backed by AR Foundation 6 (ARCore on Android).
    /// Wraps ARSession/ARRaycastManager/ARAnchorManager/ARPlaneManager; wire all four
    /// references on the XR Origin in the scene the Unity-side Codex sets up. This
    /// class intentionally does nothing clever — the ritual/game logic lives in
    /// SetupFlow/GameLoop/BanishSystem and never touches these AR types directly.
    /// </summary>
    public class ARFoundationRig : MonoBehaviour, IARRig
    {
        [SerializeField] private Camera arCamera;
        [SerializeField] private ARSession arSession;
        [SerializeField] private ARRaycastManager raycastManager;
        [SerializeField] private ARAnchorManager anchorManager;
        [SerializeField] private ARPlaneManager planeManager;

        // ⚠ VERIFY: AR Foundation 6's ARRaycastManager.Raycast reuses this hit-list
        // overload (List<ARRaycastHit>, TrackableType) in 6.0.x per the 5.x->6.x
        // migration notes, but the trackable-type enum member names below
        // (PlaneWithinPolygon) should be confirmed against the installed package's
        // XRHitTestResultTypes docs before this compiles on the Unity machine.
        private static readonly System.Collections.Generic.List<ARRaycastHit> HitBuffer =
            new System.Collections.Generic.List<ARRaycastHit>();

        /// <inheritdoc />
        public Pose CameraPose
        {
            get
            {
                if (arCamera == null)
                {
                    return Pose.identity;
                }

                Transform t = arCamera.transform;
                return new Pose(t.position, t.rotation);
            }
        }

        /// <inheritdoc />
        // ⚠ VERIFY: ARPlaneManager.trackables.count is the cheapest "do we have a floor
        // yet" signal in AR Foundation 5.x/6.x, but confirm ARPlaneManager.trackables
        // still exposes .count directly (vs needing GetEnumerator/ToList) in 6.0.x —
        // the TrackableCollection<T> API surface has shifted across major versions.
        public bool PlanesReady => planeManager != null && planeManager.trackables.count > 0;

        /// <inheritdoc />
        public bool TryGetRaycastPose(Vector2 screenPoint, out Pose pose)
        {
            pose = Pose.identity;

            if (raycastManager == null)
            {
                return false;
            }

            // ⚠ VERIFY: TrackableType.PlaneWithinPolygon is the correct member name in
            // AR Foundation 6.0.x (renamed/reorganized at least once across AR
            // Foundation major versions — confirm against the installed
            // UnityEngine.XR.ARSubsystems.TrackableType enum before relying on this).
            if (!raycastManager.Raycast(screenPoint, HitBuffer, TrackableType.PlaneWithinPolygon))
            {
                return false;
            }

            if (HitBuffer.Count == 0)
            {
                return false;
            }

            pose = HitBuffer[0].pose;
            return true;
        }

        /// <inheritdoc />
        public Transform CreateAnchor(Pose pose)
        {
            // AR Foundation 6.0.4 exposes ARAnchorManager.TryAddAnchorAsync rather than
            // the old public synchronous TryAddAnchor overload. IARRig intentionally
            // remains synchronous, so use AR Foundation 6's component-registration
            // path: ARAnchor.OnEnable asks the active manager to add itself at the
            // GameObject's world pose. If the provider rejects the add, ARAnchor
            // deactivates the GameObject and we fall through to the drift-prone visual
            // fallback below.
            if (anchorManager != null)
            {
                var anchorGo = new GameObject("ShadowDoors_ARAnchor");
                anchorGo.transform.SetPositionAndRotation(pose.position, pose.rotation);
                anchorGo.AddComponent<ARAnchor>();
                if (anchorGo.activeSelf)
                {
                    return anchorGo.transform;
                }

                Destroy(anchorGo);
            }

            // Fallback so a failed anchor add never nulls out the caller's handle —
            // callers (SetupFlow) always get SOME transform to parent visuals to,
            // even if it won't survive AR tracking drift/relocalization like a real
            // ARAnchor would.
            var fallback = new GameObject("ShadowDoors_UnanchoredFallback");
            fallback.transform.SetPositionAndRotation(pose.position, pose.rotation);
            return fallback.transform;
        }
    }
}
