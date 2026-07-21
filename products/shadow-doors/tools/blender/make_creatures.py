# make_creatures.py
# Shadow Doors — headless Blender creature factory (Anthony's ruling, 2026-07-21:
# "we can create the assets in Blender and bring them here"). Replaces the flat
# billboard silhouette with a REAL low-poly 3D wraith so the creature stops reading
# as goofy. Same doctrine as the ETB Blender lane: pure deterministic bpy/bmesh,
# no addons beyond the built-in FBX exporter, no external/AI-generated assets, hard
# mobile tri budget.
#
# Run headless (Codex, on the Blender machine):
#   blender --background --factory-startup --python tools/blender/make_creatures.py
#
# Exports SM_Wraith.fbx to Assets/ShadowDoors/Meshes/ (path relative to this script).
# Prints  [OK] SM_Wraith tris=<n> (budget <b>)  and, on success, the final line
#   SHADOWDOORS_CREATURES_GENERATED
# On a budget overrun (even after the decimate retry) or export failure it prints
#   SHADOWDOORS_CREATURES_FAILED  and sys.exit(1).

import math
import os
import sys

try:
    import bpy
    import bmesh
    from mathutils import Vector, Matrix
    HAVE_BPY = True
except ImportError:
    HAVE_BPY = False

if not HAVE_BPY:
    print("[!!] bpy not available — run INSIDE Blender:")
    print("     blender --background --factory-startup --python tools/blender/make_creatures.py")
    print("SHADOWDOORS_CREATURES_FAILED")
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "..", "Assets", "ShadowDoors", "Meshes"))
WRAITH_TRI_BUDGET = 2600  # mobile AR budget; the wraith is one of up to ~3 concurrent.


def log(ok, msg):
    print(("[OK] " if ok else "[!!] ") + msg)


# ---------------------------------------------------------------------------
# bmesh loft helpers — organic limbs as tapered tubes along a spine.
# Coordinate frame: X right, Y forward (toward the player), Z up. Meters.
# ---------------------------------------------------------------------------

def _frame(tangent):
    """Orthonormal (right, up) perpendicular to `tangent`, stable for a mostly
    vertical/forward creature (reference up = world Z unless near-parallel)."""
    t = tangent.normalized()
    ref = Vector((0.0, 0.0, 1.0))
    if abs(t.dot(ref)) > 0.95:
        ref = Vector((0.0, 1.0, 0.0))
    right = t.cross(ref).normalized()
    up = right.cross(t).normalized()
    return right, up


def _ring(bm, center, right, up, radius, sides):
    verts = []
    for i in range(sides):
        a = (i / sides) * math.tau
        offset = right * (math.cos(a) * radius) + up * (math.sin(a) * radius)
        verts.append(bm.verts.new(center + offset))
    return verts


def _bridge(bm, ring_a, ring_b):
    n = len(ring_a)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((ring_a[i], ring_a[j], ring_b[j], ring_b[i]))


def _cap(bm, ring, center):
    hub = bm.verts.new(center)
    n = len(ring)
    for i in range(n):
        j = (i + 1) % n
        bm.faces.new((ring[i], ring[j], hub))
    return hub


def tube(bm, spine, sides, cap_start=True, cap_end=True):
    """spine = list of (Vector pos, float radius). Lofts rings oriented by local
    tangent. Returns nothing (adds geometry to bm)."""
    rings = []
    n = len(spine)
    for k, (pos, radius) in enumerate(spine):
        if k == 0:
            tangent = (spine[1][0] - pos)
        elif k == n - 1:
            tangent = (pos - spine[k - 1][0])
        else:
            tangent = (spine[k + 1][0] - spine[k - 1][0])
        right, up = _frame(tangent)
        rings.append((_ring(bm, pos, right, up, max(radius, 0.004), sides), pos))
    for k in range(n - 1):
        _bridge(bm, rings[k][0], rings[k + 1][0])
    if cap_start:
        _cap(bm, rings[0][0], spine[0][0])
    if cap_end:
        _cap(bm, rings[-1][0], spine[-1][0])


def ovoid(bm, center, radii, rings=8, sides=12, tilt=0.0):
    """A squashed sphere (the head), optionally tilted forward about X."""
    rx, ry, rz = radii
    rot = Matrix.Rotation(tilt, 3, 'X')
    prev = None
    top = None
    bot = None
    for r in range(rings + 1):
        v = r / rings
        phi = v * math.pi
        z = math.cos(phi)
        ringr = math.sin(phi)
        if r == 0 or r == rings:
            p = center + rot @ Vector((0.0, 0.0, z * rz))
            hub = bm.verts.new(p)
            if r == 0:
                top = hub
            else:
                bot = hub
            if prev is not None and r == rings:
                for i in range(sides):
                    j = (i + 1) % sides
                    bm.faces.new((prev[i], prev[j], bot))
            continue
        verts = []
        for i in range(sides):
            a = (i / sides) * math.tau
            local = Vector((math.cos(a) * ringr * rx, math.sin(a) * ringr * ry, z * rz))
            verts.append(bm.verts.new(center + rot @ local))
        if prev is None:
            for i in range(sides):
                j = (i + 1) % sides
                bm.faces.new((top, verts[i], verts[j]))
        else:
            _bridge(bm, prev, verts)
        prev = verts


# ---------------------------------------------------------------------------
# The wraith
# ---------------------------------------------------------------------------

def build_wraith():
    bm = bmesh.new()

    # Core spindle: hips -> belly -> chest -> shoulders -> neck (gaunt, forward hunch).
    torso = [
        (Vector((0.0, 0.00, 0.55)), 0.12),
        (Vector((0.0, 0.02, 0.85)), 0.17),
        (Vector((0.0, 0.04, 1.15)), 0.155),
        (Vector((0.0, 0.03, 1.40)), 0.10),
        (Vector((0.0, 0.02, 1.52)), 0.068),
    ]
    tube(bm, torso, sides=12)

    # Head: forward-tilted hollow ovoid (eyes are the material's glow, not geo).
    ovoid(bm, Vector((0.0, 0.05, 1.66)), (0.10, 0.115, 0.14), rings=8, sides=12, tilt=0.28)

    # Long reaching arms (shoulder -> out -> elbow -> forearm -> wrist -> claw tip).
    for side in (-1.0, 1.0):
        arm = [
            (Vector((side * 0.11, 0.02, 1.42)), 0.052),
            (Vector((side * 0.22, 0.14, 1.34)), 0.045),
            (Vector((side * 0.24, 0.32, 1.20)), 0.038),
            (Vector((side * 0.17, 0.50, 1.06)), 0.030),
            (Vector((side * 0.09, 0.66, 0.98)), 0.020),
            (Vector((side * 0.05, 0.78, 0.94)), 0.006),
        ]
        tube(bm, arm, sides=6)

    # Lower body: no legs — five tapering tendrils dissolving toward the floor.
    for i in range(5):
        a = (i / 5) * math.tau
        bx = math.cos(a) * 0.10
        by = math.sin(a) * 0.08 + 0.02
        tendril = [
            (Vector((bx * 0.4, by * 0.4, 0.58)), 0.06),
            (Vector((bx, by, 0.42)), 0.045),
            (Vector((bx * 1.4, by * 1.4 - 0.02, 0.22)), 0.026),
            (Vector((bx * 1.7, by * 1.7 - 0.04, 0.06)), 0.006),
        ]
        tube(bm, tendril, sides=5)

    # Triangulate for the game engine + a light smooth.
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    mesh = bpy.data.meshes.new("SM_Wraith")
    bm.to_mesh(mesh)
    bm.free()
    mesh.shade_smooth() if hasattr(mesh, "shade_smooth") else None
    obj = bpy.data.objects.new("SM_Wraith", mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def build_hand():
    """A gaunt clawing hand that strains up out of the floor (the FloorGraspers —
    "half coming out like it wants to but it can't"). Wrist at origin, fingers reach
    +Z with a forward -Y claw curl. ~0.22 m tall."""
    bm = bmesh.new()

    # Palm: a flattened ovoid.
    ovoid(bm, Vector((0.0, 0.0, 0.035)), (0.052, 0.024, 0.055), rings=6, sides=10)
    # Wrist stub down into the floor.
    tube(bm, [(Vector((0.0, 0.0, 0.02)), 0.035), (Vector((0.0, 0.0, -0.05)), 0.028)], sides=8)

    # Four fingers, splayed, tips curling forward (claw).
    knux = [-0.036, -0.012, 0.012, 0.036]
    flen = [0.11, 0.135, 0.125, 0.10]
    for i in range(4):
        x = knux[i]
        base = Vector((x, 0.0, 0.075))
        mid = Vector((x * 1.05, -0.015, 0.075 + flen[i] * 0.55))
        tip = Vector((x * 1.1, -0.05, 0.075 + flen[i]))  # curl toward -Y = grasping
        tube(bm, [(base, 0.016), (mid, 0.012), (tip, 0.004)], sides=5)

    # Thumb: off the side, angled up-and-out.
    tube(bm, [
        (Vector((-0.052, 0.0, 0.025)), 0.017),
        (Vector((-0.075, -0.01, 0.06)), 0.013),
        (Vector((-0.088, -0.03, 0.085)), 0.004),
    ], sides=5)

    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    mesh = bpy.data.meshes.new("SM_Hand")
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new("SM_Hand", mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def tri_count(obj):
    return sum(len(p.vertices) - 2 for p in obj.data.polygons)


def decimate_to_budget(obj, budget):
    tris = tri_count(obj)
    if tris <= budget:
        return tris
    ratio = max(0.1, budget / float(tris))
    mod = obj.modifiers.new("dec", 'DECIMATE')
    mod.ratio = ratio
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return tri_count(obj)


def export_fbx(obj, path):
    """Export with a tiered fallback across FBX-exporter arg changes (matches the
    ETB 4-tier pattern — kwarg names have shifted across Blender majors)."""
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    attempts = [
        dict(use_selection=True, apply_unit_scale=True, bake_space_transform=True,
             object_types={'MESH'}, mesh_smooth_type='FACE', add_leaf_bones=False),
        dict(use_selection=True, object_types={'MESH'}, mesh_smooth_type='FACE'),
        dict(use_selection=True, object_types={'MESH'}),
        dict(use_selection=True),
    ]
    last = None
    for kw in attempts:
        try:
            bpy.ops.export_scene.fbx(filepath=path, **kw)
            return True
        except (TypeError, RuntimeError) as e:
            last = e
    log(False, "FBX export failed for %s: %s" % (path, last))
    return False


HAND_TRI_BUDGET = 1400


def build_and_export(name, builder, budget):
    bpy.ops.object.select_all(action='DESELECT')
    obj = builder()
    tris = decimate_to_budget(obj, budget)
    if tris > budget:
        log(False, "%s tris=%d exceeds budget %d after decimate" % (name, tris, budget))
        return False
    log(True, "%s tris=%d (budget %d)" % (name, tris, budget))
    path = os.path.join(OUT_DIR, name + ".fbx")
    if not export_fbx(obj, path):
        return False
    log(True, "wrote %s" % path)
    # Remove so the next asset exports in isolation.
    bpy.data.objects.remove(obj, do_unlink=True)
    return True


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)

    ok = build_and_export("SM_Wraith", build_wraith, WRAITH_TRI_BUDGET)
    ok = build_and_export("SM_Hand", build_hand, HAND_TRI_BUDGET) and ok

    if not ok:
        print("SHADOWDOORS_CREATURES_FAILED")
        sys.exit(1)
    print("SHADOWDOORS_CREATURES_GENERATED")


if __name__ == "__main__":
    main()
