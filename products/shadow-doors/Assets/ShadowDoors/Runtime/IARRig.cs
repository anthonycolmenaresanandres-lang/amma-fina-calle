using UnityEngine;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// The seam that makes the entire game loop editor-testable (spec L2 requirement).
    /// Every other system (SetupFlow, BanishSystem, GameLoop) talks to the camera and
    /// the physical room ONLY through this interface — never directly to AR Foundation
    /// types. <see cref="ARFoundationRig"/> is the real-device implementation;
    /// <see cref="MockARRig"/> substitutes a fixed room + WASD/mouse camera so the whole
    /// loop (setup ritual through win/lose) runs in editor Play mode without a device.
    /// </summary>
    public interface IARRig
    {
        /// <summary>World-space position + rotation of the AR camera this frame.</summary>
        Pose CameraPose { get; }

        /// <summary>
        /// True once the rig has enough tracked floor geometry for setup to proceed
        /// (real rig: at least one horizontal ARPlane; mock rig: fixed 1s scan timer).
        /// </summary>
        bool PlanesReady { get; }

        /// <summary>
        /// Raycasts from a screen-space point (pixel coordinates, e.g. a tap position
        /// during TagDoors, or the viewport center for BanishSystem's aim check) against
        /// trackable geometry. Returns false with a default Pose if nothing was hit.
        /// </summary>
        bool TryGetRaycastPose(Vector2 screenPoint, out Pose pose);

        /// <summary>
        /// Creates a persistent anchor at the given world pose and returns a Transform
        /// handle callers can parent visuals to and read back each frame. Real rig:
        /// backed by an ARAnchor. Mock rig: a plain scene Transform — anchors never
        /// drift in the fixed mock room, which is the whole point of the mock.
        /// </summary>
        Transform CreateAnchor(Pose pose);
    }
}
