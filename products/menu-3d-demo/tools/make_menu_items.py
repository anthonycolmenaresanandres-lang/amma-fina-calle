# make_menu_items.py
# Fina Calle — headless Blender factory for stylized 3D menu items, exported as GLB
# for the web <model-viewer> AR demo (products/menu-3d-demo/). Same doctrine as the
# Shadow Doors creature lane: pure deterministic bpy, no addons beyond the built-in
# glTF exporter, no external/AI-generated assets, vertex/material colors only (no
# texture files), low poly for mobile web.
#
# Run headless:
#   blender --background --factory-startup --python tools/make_menu_items.py
#
# Exports models/burger.glb and models/coffee.glb (paths relative to this script).
# Prints [OK] lines and, on success, MENU_ITEMS_GENERATED; on failure MENU_ITEMS_FAILED
# and sys.exit(1).

import os
import sys

try:
    import bpy
    HAVE_BPY = True
except ImportError:
    HAVE_BPY = False

if not HAVE_BPY:
    print("[!!] bpy not available — run INSIDE Blender:")
    print("     blender --background --factory-startup --python tools/make_menu_items.py")
    print("MENU_ITEMS_FAILED")
    sys.exit(1)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, "..", "models"))


def log(msg):
    print("[OK] " + msg)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, rgb, rough=0.6, metal=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (rgb[0], rgb[1], rgb[2], 1.0)
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = rough
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metal
    return m


def apply_mat(obj, m):
    obj.data.materials.clear()
    obj.data.materials.append(m)


def cyl(r, depth, loc, m, verts=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=depth, location=loc, vertices=verts)
    o = bpy.context.active_object
    apply_mat(o, m)
    return o


def sphere(scale, loc, m, seg=24, ring=12):
    bpy.ops.mesh.primitive_uv_sphere_add(location=loc, segments=seg, ring_count=ring)
    o = bpy.context.active_object
    o.scale = scale
    apply_mat(o, m)
    return o


def torus(major, minor, loc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(location=loc, major_radius=major, minor_radius=minor,
                                     major_segments=24, minor_segments=10, rotation=rot)
    o = bpy.context.active_object
    apply_mat(o, m)
    return o


def cube(scale, loc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=loc, rotation=rot)
    o = bpy.context.active_object
    o.scale = scale
    apply_mat(o, m)
    return o


def export_glb(name):
    path = os.path.join(OUT_DIR, name + ".glb")
    try:
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True)
    except (TypeError, RuntimeError) as e:
        # Older/newer exporter arg drift fallback.
        try:
            bpy.ops.export_scene.gltf(filepath=path, export_format='GLB')
        except Exception as e2:
            log("export failed for %s: %s / %s" % (name, e, e2))
            return False
    log("wrote %s" % path)
    return True


def build_burger():
    reset()
    tan = mat("bun", (0.82, 0.58, 0.33), rough=0.7)
    meat = mat("patty", (0.28, 0.16, 0.09), rough=0.8)
    cheese = mat("cheese", (0.92, 0.62, 0.15), rough=0.5)
    green = mat("lettuce", (0.42, 0.62, 0.22), rough=0.7)

    sphere((0.060, 0.060, 0.026), (0, 0, 0.022), tan)          # bottom bun
    cyl(0.058, 0.020, (0, 0, 0.048), meat)                     # patty
    cube((0.062, 0.062, 0.004), (0, 0, 0.060), cheese, rot=(0, 0, 0.785))  # cheese (corners peek)
    torus(0.050, 0.013, (0, 0, 0.066), green)                 # lettuce ruffle
    sphere((0.060, 0.060, 0.046), (0, 0, 0.096), tan)         # domed top bun
    return export_glb("burger")


def build_coffee():
    reset()
    ceramic = mat("ceramic", (0.93, 0.92, 0.88), rough=0.35)
    brew = mat("coffee", (0.14, 0.08, 0.04), rough=0.25)

    cyl(0.040, 0.070, (0, 0, 0.035), ceramic)                 # cup body
    cyl(0.036, 0.004, (0, 0, 0.066), brew)                    # coffee surface
    torus(0.020, 0.006, (0.046, 0, 0.036), ceramic, rot=(1.5708, 0, 0))  # handle
    return export_glb("coffee")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    ok = build_burger()
    ok = build_coffee() and ok
    if not ok:
        print("MENU_ITEMS_FAILED")
        sys.exit(1)
    print("MENU_ITEMS_GENERATED")


if __name__ == "__main__":
    main()
