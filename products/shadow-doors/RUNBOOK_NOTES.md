# Shadow Doors — runbook notes (commands only)

Not a full runbook — the orchestrator writes that. This is just the exact commands a Unity
machine (Codex, per AMMA's Constitution) needs to take this repo from clone to L4 smoke.
Unity 6000.3.19f1, Android-first (ARCore), per AR_SHADOW_DOORS_MVP.md.

## 1. Create/open the Unity project

This repo's `Assets/` and `Packages/manifest.json` already exist (checked in) — do NOT run
`-createProject` against this path, it expects an empty folder. Instead just open it once so
Unity generates `ProjectSettings/` and `Library/`:

```
"C:\Program Files\Unity\Hub\Editor\6000.3.19f1\Editor\Unity.exe" ^
  -batchmode -quit -nographics ^
  -projectPath "C:\dev\amma\amma-fina-calle\products\shadow-doors" ^
  -logFile "C:\dev\amma\amma-fina-calle\products\shadow-doors\Logs\open.log"
```

If starting a genuinely empty project elsewhere (not this case, but for reference):

```
Unity.exe -batchmode -createProject <path> -quit
```

## 2. Overlay copy order (client-data-at-build-time pattern, mirrors whitelabel)

Nothing to copy in this MVP — Shadow Doors ships ONE handcrafted scenario, no per-client
overlay system. `Assets/ShadowDoors/Audio/*.wav` and `Assets/ShadowDoors/Scenarios/scenario_mvp.json`
are checked in directly, no copy step. (If a future content-pack system is added per the
MVP doc's "Explicitly cut from MVP" backlog, mirror whitelabel's `clients/<id>/client.json` ->
`Assets/StreamingAssets/client/` copy-at-build-time pattern — do not hand-edit
`Assets/StreamingAssets/` in the meantime.)

## 3. L0 — batchmode compile check

```
Unity.exe -batchmode -quit -nographics ^
  -projectPath "C:\dev\amma\amma-fina-calle\products\shadow-doors" ^
  -logFile "C:\dev\amma\amma-fina-calle\products\shadow-doors\Logs\compile.log"
```

Exit code 0 + no `CompilerError`/`error CS` lines in the log = pass. Grep the log rather than
trusting exit code alone (Unity sometimes exits 0 on partial failures in batchmode).

## 4. L1 — EditMode tests

```
Unity.exe -batchmode -nographics ^
  -projectPath "C:\dev\amma\amma-fina-calle\products\shadow-doors" ^
  -runTests -testPlatform EditMode ^
  -testResults "C:\dev\amma\amma-fina-calle\products\shadow-doors\Logs\editmode_results.xml" ^
  -logFile "C:\dev\amma\amma-fina-calle\products\shadow-doors\Logs\editmode.log"
```

Parse `editmode_results.xml` (NUnit3 XML, `result="Passed"` on the root `<test-run>`), not raw
stdout. Covers `Assets/ShadowDoors/Tests/EditMode/`: `ScenarioDirectorTests`,
`BanishSystemTests`, `ScenarioJsonTests` (the last one requires
`Assets/ShadowDoors/Scenarios/scenario_mvp.json` to exist and match the schema in
`PRODUCT_MODULES/AR_SHADOW_DOORS_MVP.md` — it will fail with a clear "file not found" message
until that file lands).

Do not add `-quit` to a `-runTests` invocation on Unity 6000.3.19f1. It exits after the
initial refresh before the Test Runner starts and produces no results XML. The Test Runner
exits batchmode automatically after writing the requested results file.

## 5. L2 — PlayMode test (MockARRig, no device)

```
Unity.exe -batchmode -nographics ^
  -projectPath "C:\dev\amma\amma-fina-calle\products\shadow-doors" ^
  -runTests -testPlatform PlayMode ^
  -testResults "C:\dev\amma\amma-fina-calle\products\shadow-doors\Logs\playmode_results.xml" ^
  -logFile "C:\dev\amma\amma-fina-calle\products\shadow-doors\Logs\playmode.log"
```

(`-nographics` is fine here because `MockARRig` substitutes the camera/anchors — the whole
loop must run without a real device per the MVP doc's L2 requirement.)

## 6. L3 — Android build essentials

Before building:
1. **Switch platform**: Build Settings -> Android -> Switch Platform (or
   `EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.Android, BuildTarget.Android)`
   in an editor script — do not hand-edit `ProjectSettings/*.asset`, per the whitelabel
   forbidden-zones discipline this repo follows).
2. **Scripting backend**: IL2CPP (required for ARCore on recent Unity/Android target API
   levels) — Player Settings -> Other Settings -> Scripting Backend -> IL2CPP.
3. **Target architecture**: ARM64 only (Target Architectures -> ARM64 checked, ARMv7
   unchecked) — ARCore devices are ARM64.
4. **Minimum API level**: ARCore requires **minimum API 24** (Android 7.0) — Player Settings
   -> Other Settings -> Minimum API Level -> Android 7.0 'Nougat' (API level 24).
5. **AR plugin**: XR Plug-in Management -> Android tab -> ARCore enabled (should already be
   wired via `com.unity.xr.arcore` in `Packages/manifest.json`).

Build command:

```
Unity.exe -batchmode -quit ^
  -projectPath "C:\dev\amma\amma-fina-calle\products\shadow-doors" ^
  -buildTarget Android ^
  -executeMethod ShadowDoors.Editor.BuildScript.BuildAndroid ^
  -logFile "C:\dev\amma\amma-fina-calle\products\shadow-doors\Logs\build_android.log"
```

(`ShadowDoors.Editor.BuildScript.BuildAndroid` is a placeholder method name — an editor
build script under `Assets/ShadowDoors/Editor/` is Runtime/Editor scope, not authored by this
agent; Codex/the runtime agent should confirm the actual `-executeMethod` target before
running.)

## 7. L4 — on-device smoke (adb logcat markers)

Install + launch, then grep logcat for the four markers the MVP doc specifies
(`AR_SHADOW_DOORS_MVP.md` build/verify ladder):

```
adb install -r "path\to\ShadowDoors.apk"
adb logcat -c
adb shell am start -n <package.name>/<ActivityName>
adb logcat | findstr /C:"SETUP_COMPLETE" /C:"FIRST_EMERGE" /C:"BANISH_OK" /C:"RUN_END"
```

(PowerShell equivalent of grep: `adb logcat | Select-String -Pattern "SETUP_COMPLETE|FIRST_EMERGE|BANISH_OK|RUN_END"`.)

Pass condition: all four markers observed in order (`SETUP_COMPLETE` -> `FIRST_EMERGE` ->
`BANISH_OK` at least once -> `RUN_END`), no crash, matching the MVP doc's acceptance bar
(full 3:00 run, no crash, >=30 fps on Anthony's phone).
