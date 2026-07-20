# Shadow Doors - verified Unity machine commands

These are the commands verified on Unity 6000.3.19f1 for the ARCore MVP. The repository
overlay is the source of truth; `C:\Dev\ShadowDoors` is a disposable generated project.

## L-1 - create and overlay

Create the project only when `C:\Dev\ShadowDoors` does not already exist:

```powershell
& 'C:\Program Files\Unity\Hub\Editor\6000.3.19f1\Editor\Unity.exe' -batchmode -quit -nographics -createProject C:\Dev\ShadowDoors -logFile C:\Dev\ShadowDoors-create.log
```

Overlay after creation and after every repository fix:

```powershell
robocopy C:\dev\amma\amma-fina-calle\products\shadow-doors\Assets C:\Dev\ShadowDoors\Assets /E
robocopy C:\dev\amma\amma-fina-calle\products\shadow-doors\Packages C:\Dev\ShadowDoors\Packages /E
```

Let Package Manager finish. The pinned direct dependencies that were verified are AR
Foundation 6.4.3, ARCore 6.4.3, Input System 1.11.2, URP 17.0.4, and Test Framework 1.4.5.
Unity 6000.3 substitutes its compatible built-ins for URP (17.3.0) and Test Framework
(1.6.0).

## Scene wiring - breach portal prefab (optional but wanted)

`GameLoop.darknessPortalPrefab` expects a prefab built from a Unity **Quad** with the
`DarknessPortal` component and a material using the `ShadowDoors/DarknessPortal` shader
(same recipe as the ShadowAgent prefab: Quad + component + ShadowDoors shader/material).
It is null-safe — the game runs without it (shadows spawn directly) — but wire it: the
breach-before-emerge beat is a core design ruling (see AR_SHADOW_DOORS_MVP.md,
"The breach portal"). No collider needed; `DarknessPortal.Awake` sets its own scale.

## L0 - compile

```powershell
& 'C:\Program Files\Unity\Hub\Editor\6000.3.19f1\Editor\Unity.exe' -batchmode -quit -nographics -projectPath C:\Dev\ShadowDoors -logFile C:\Dev\ShadowDoors-L0-compile.log
```

Pass requires exit 0 and no `error CS`, compiler failure, or shader error in the log.

## L1 - EditMode tests

```powershell
& 'C:\Program Files\Unity\Hub\Editor\6000.3.19f1\Editor\Unity.exe' -batchmode -nographics -projectPath C:\Dev\ShadowDoors -runTests -testPlatform EditMode -testResults C:\Dev\ShadowDoors-L1-editmode.xml -logFile C:\Dev\ShadowDoors-L1-editmode.log
```

Parse the NUnit XML and require root `result="Passed"`. Do not add `-quit` to a
`-runTests` invocation on Unity 6000.3.19f1: it can exit before the Test Runner writes XML.
Suites: `ScenarioDirectorTests`, `BanishSystemTests`, `ScenarioJsonTests`,
`ConsumedFXTests`, `DarknessPortalTests`.

## L2 - PlayMode full loop with MockARRig

```powershell
& 'C:\Program Files\Unity\Hub\Editor\6000.3.19f1\Editor\Unity.exe' -batchmode -nographics -projectPath C:\Dev\ShadowDoors -runTests -testPlatform PlayMode -testResults C:\Dev\ShadowDoors-L2-playmode.xml -logFile C:\Dev\ShadowDoors-L2-playmode.log
```

Require a passed NUnit XML plus `SETUP_COMPLETE`, `FIRST_EMERGE`, `BANISH_OK`, and
`RUN_END` in order in one scripted play session.

## L3 - Android APK

`ShadowDoors.Editor.BuildScript.BuildAndroid` creates the scene and assets, assigns the
ARCore loader, marks ARCore required (depth optional), selects OpenGLES3, and builds an
IL2CPP ARM64 APK.

```powershell
& 'C:\Program Files\Unity\Hub\Editor\6000.3.19f1\Editor\Unity.exe' -batchmode -quit -nographics -projectPath C:\Dev\ShadowDoors -buildTarget Android -executeMethod ShadowDoors.Editor.BuildScript.BuildAndroid -logFile C:\Dev\ShadowDoors-L3-build.log
```

The output is `C:\Dev\ShadowDoors\Builds\Android\ShadowDoors.apk`.

ARCore itself allows API 24, but Unity 6000.3.19f1 rejects that setting and enforces its
own API 25 minimum. The build entry point requests API 24 and logs Unity's effective value;
verify the APK with `aapt2 dump badging` and report the enforced API 25 deviation honestly.

AR Foundation and ARCore must stay pinned together at 6.4.3 for this editor toolchain.
The earlier 6.0.x pins fail under the bundled Gradle 9 / AGP 9 because two AARs reuse the
`com.google.ar.core` namespace. ARCore 6.4.3 contains Unity's Gradle 9 namespace fix.

## L4 - device smoke

Use the `adb.exe` in Unity's Android SDK if `adb` is not on PATH:

```powershell
adb devices -l
adb install -r C:\Dev\ShadowDoors\Builds\Android\ShadowDoors.apk
adb logcat -c
adb shell am start -n com.amma.shadowdoors/com.unity3d.player.UnityPlayerGameActivity
adb logcat | Select-String -Pattern 'SETUP_COMPLETE|FIRST_EMERGE|BANISH_OK|RUN_END'
```

Require all four markers in order, no crash, a complete three-minute run, and at least
30 fps on Anthony's phone. If `adb devices -l` lists no device, record
`DEFERRED-TO-DEVICE` without treating it as a build failure.
