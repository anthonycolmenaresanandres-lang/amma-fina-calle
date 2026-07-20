using System;
using System.IO;
using System.Linq;
using ShadowDoors.Runtime;
using Unity.XR.CoreUtils;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.Build.Reporting;
using UnityEditor.SceneManagement;
using UnityEditor.XR.ARCore;
using UnityEditor.XR.Management;
using UnityEditor.XR.Management.Metadata;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.UI;
using UnityEngine.InputSystem.XR;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARCore;
using UnityEngine.XR.Management;

namespace ShadowDoors.Editor
{
    /// <summary>Deterministic Unity CLI entry point for the L3 Android artifact.</summary>
    public static class BuildScript
    {
        private const string ScenePath = "Assets/ShadowDoors/Scenes/ShadowDoorsMain.unity";
        private const string ShadowPrefabPath = "Assets/ShadowDoors/Prefabs/ShadowAgent.prefab";
        private const string DoorPrefabPath = "Assets/ShadowDoors/Prefabs/DoorGizmo.prefab";
        private const string ShadowMaterialPath = "Assets/ShadowDoors/Materials/ShadowSilhouette.mat";
        private const string DarknessMaterialPath = "Assets/ShadowDoors/Materials/DarknessIris.mat";
        private const string PipelinePath = "Assets/ShadowDoors/Settings/ShadowDoorsURP.asset";
        private const string RendererPath = "Assets/ShadowDoors/Settings/ShadowDoorsRenderer.asset";
        private const string XrSettingsPath = "Assets/XR/XRGeneralSettingsPerBuildTarget.asset";
        private const string ArCoreSettingsPath = "Assets/XR/Settings/ARCore Settings.asset";
        private const string LoaderType = "UnityEngine.XR.ARCore.ARCoreLoader";

        public static void BuildAndroid()
        {
            ProjectConfiguration.ConfigureInputSystem();
            ConfigureAndroidPlayer();
            ConfigureArCore();
            ConfigureUrp();
            CreateRuntimeAssetsAndScene();

            string apkPath = Path.GetFullPath(Path.Combine(Application.dataPath,
                "../Builds/Android/ShadowDoors.apk"));
            Directory.CreateDirectory(Path.GetDirectoryName(apkPath));

            var options = new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = apkPath,
                target = BuildTarget.Android,
                targetGroup = BuildTargetGroup.Android,
                options = BuildOptions.None
            };

            BuildReport report = BuildPipeline.BuildPlayer(options);
            BuildSummary summary = report.summary;
            if (summary.result != BuildResult.Succeeded || !File.Exists(apkPath))
            {
                throw new BuildFailedException(
                    $"Shadow Doors Android build failed: {summary.result}, errors={summary.totalErrors}");
            }

            var apk = new FileInfo(apkPath);
            Debug.Log($"L3_BUILD_OK apk={apk.FullName} bytes={apk.Length} " +
                      $"backend={PlayerSettings.GetScriptingBackend(NamedBuildTarget.Android)} " +
                      $"architectures={PlayerSettings.Android.targetArchitectures} " +
                      $"minApi={PlayerSettings.Android.minSdkVersion} arcore=Required");
        }

        private static void ConfigureAndroidPlayer()
        {
            if (!EditorUserBuildSettings.SwitchActiveBuildTarget(
                    BuildTargetGroup.Android, BuildTarget.Android))
            {
                throw new BuildFailedException("Could not switch the active build target to Android.");
            }

            PlayerSettings.companyName = "AMMA";
            PlayerSettings.productName = "Shadow Doors";
            PlayerSettings.bundleVersion = "0.1.0";
            PlayerSettings.SetApplicationIdentifier(NamedBuildTarget.Android, "com.amma.shadowdoors");
            PlayerSettings.SetScriptingBackend(NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel24;
            PlayerSettings.Android.targetSdkVersion = AndroidSdkVersions.AndroidApiLevelAuto;
            PlayerSettings.SetUseDefaultGraphicsAPIs(BuildTarget.Android, false);
            PlayerSettings.SetGraphicsAPIs(
                BuildTarget.Android, new[] { GraphicsDeviceType.OpenGLES3 });
            EditorUserBuildSettings.buildAppBundle = false;
        }

        private static void ConfigureArCore()
        {
            EnsureFolder("Assets/XR/Settings");

            if (!EditorBuildSettings.TryGetConfigObject(
                    XRGeneralSettings.k_SettingsKey,
                    out XRGeneralSettingsPerBuildTarget perTarget))
            {
                perTarget = ScriptableObject.CreateInstance<XRGeneralSettingsPerBuildTarget>();
                perTarget.name = "XR Plug-in Management Settings";
                AssetDatabase.CreateAsset(perTarget, XrSettingsPath);
                EditorBuildSettings.AddConfigObject(XRGeneralSettings.k_SettingsKey, perTarget, true);
            }

            if (!perTarget.HasSettingsForBuildTarget(BuildTargetGroup.Android))
            {
                perTarget.CreateDefaultSettingsForBuildTarget(BuildTargetGroup.Android);
            }
            if (!perTarget.HasManagerSettingsForBuildTarget(BuildTargetGroup.Android))
            {
                perTarget.CreateDefaultManagerSettingsForBuildTarget(BuildTargetGroup.Android);
            }

            XRManagerSettings manager = perTarget.ManagerSettingsForBuildTarget(BuildTargetGroup.Android);
            if (!XRPackageMetadataStore.AssignLoader(manager, LoaderType, BuildTargetGroup.Android))
            {
                throw new BuildFailedException("Could not assign the ARCore loader for Android.");
            }
            if (!manager.activeLoaders.Any(loader => loader != null && loader.GetType().FullName == LoaderType))
            {
                throw new BuildFailedException("ARCore loader assignment did not persist.");
            }

            ARCoreSettings arCore = ARCoreSettings.currentSettings;
            if (arCore == null)
            {
                arCore = ARCoreSettings.GetOrCreateSettings();
                if (!AssetDatabase.Contains(arCore))
                {
                    arCore.name = "ARCore Settings";
                    AssetDatabase.CreateAsset(arCore, ArCoreSettingsPath);
                }
                ARCoreSettings.currentSettings = arCore;
            }
            arCore.requirement = ARCoreSettings.Requirement.Required;
            arCore.depth = ARCoreSettings.Requirement.Optional;
            EditorUtility.SetDirty(arCore);
            AssetDatabase.SaveAssets();
        }

        private static void ConfigureUrp()
        {
            EnsureFolder("Assets/ShadowDoors/Settings");
            var pipeline = AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(PipelinePath);
            if (pipeline == null)
            {
                var renderer = ScriptableObject.CreateInstance<UniversalRendererData>();
                renderer.name = "Shadow Doors Forward Renderer";
                AssetDatabase.CreateAsset(renderer, RendererPath);
                pipeline = UniversalRenderPipelineAsset.Create(renderer);
                pipeline.name = "Shadow Doors URP";
                AssetDatabase.CreateAsset(pipeline, PipelinePath);
            }

            var rendererData = AssetDatabase.LoadAssetAtPath<UniversalRendererData>(RendererPath);
            if (rendererData == null)
            {
                throw new BuildFailedException("Shadow Doors URP renderer data is missing.");
            }
            EnsureArBackgroundRendererFeature(rendererData);

            GraphicsSettings.defaultRenderPipeline = pipeline;
            QualitySettings.renderPipeline = pipeline;
            EditorUtility.SetDirty(pipeline);
            AssetDatabase.SaveAssets();
        }

        private static void EnsureArBackgroundRendererFeature(UniversalRendererData rendererData)
        {
            if (rendererData.rendererFeatures.Any(feature => feature is ARBackgroundRendererFeature))
            {
                return;
            }

            var feature = ScriptableObject.CreateInstance<ARBackgroundRendererFeature>();
            feature.name = "AR Background Renderer Feature";
            AssetDatabase.AddObjectToAsset(feature, rendererData);
            if (!AssetDatabase.TryGetGUIDAndLocalFileIdentifier(feature, out _, out long localId))
            {
                UnityEngine.Object.DestroyImmediate(feature, true);
                throw new BuildFailedException("Could not persist the AR background renderer feature.");
            }

            var serializedRenderer = new SerializedObject(rendererData);
            SerializedProperty features = serializedRenderer.FindProperty("m_RendererFeatures");
            SerializedProperty featureMap = serializedRenderer.FindProperty("m_RendererFeatureMap");
            if (features == null || featureMap == null)
            {
                UnityEngine.Object.DestroyImmediate(feature, true);
                throw new BuildFailedException("Unity did not expose the URP renderer feature lists.");
            }

            features.arraySize++;
            features.GetArrayElementAtIndex(features.arraySize - 1).objectReferenceValue = feature;
            featureMap.arraySize++;
            featureMap.GetArrayElementAtIndex(featureMap.arraySize - 1).longValue = localId;
            if (!serializedRenderer.ApplyModifiedPropertiesWithoutUndo())
            {
                UnityEngine.Object.DestroyImmediate(feature, true);
                throw new BuildFailedException("Could not attach the AR background renderer feature.");
            }

            EditorUtility.SetDirty(feature);
            EditorUtility.SetDirty(rendererData);
            Debug.Log("SHADOW_DOORS_URP arBackgroundRendererFeature=enabled");
        }

        private static void CreateRuntimeAssetsAndScene()
        {
            EnsureFolder("Assets/ShadowDoors/Scenes");
            EnsureFolder("Assets/ShadowDoors/Prefabs");
            EnsureFolder("Assets/ShadowDoors/Materials");

            Material shadowMaterial = GetOrCreateMaterial(
                ShadowMaterialPath, "ShadowDoors/ShadowSilhouette");
            Material darknessMaterial = GetOrCreateMaterial(
                DarknessMaterialPath, "ShadowDoors/DarknessIris");
            GameObject shadowPrefab = CreateShadowPrefab(shadowMaterial);
            GameObject doorPrefab = CreateDoorPrefab();

            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            var sessionObject = new GameObject("AR Session");
            ARSession session = sessionObject.AddComponent<ARSession>();
            sessionObject.AddComponent<ARInputManager>();

            var originObject = new GameObject("XR Origin (Mobile AR)");
            XROrigin origin = originObject.AddComponent<XROrigin>();
            ARRaycastManager raycasts = originObject.AddComponent<ARRaycastManager>();
            ARAnchorManager anchors = originObject.AddComponent<ARAnchorManager>();
            ARPlaneManager planes = originObject.AddComponent<ARPlaneManager>();
            ARFoundationRig rig = originObject.AddComponent<ARFoundationRig>();

            var offsetObject = new GameObject("Camera Offset");
            offsetObject.transform.SetParent(originObject.transform, false);
            var cameraObject = new GameObject("Main Camera");
            cameraObject.transform.SetParent(offsetObject.transform, false);
            cameraObject.tag = "MainCamera";
            Camera camera = cameraObject.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.Color;
            camera.backgroundColor = Color.black;
            camera.nearClipPlane = 0.1f;
            camera.farClipPlane = 20f;
            cameraObject.AddComponent<AudioListener>();
            cameraObject.AddComponent<ARCameraManager>();
            cameraObject.AddComponent<ARCameraBackground>();
            var poseDriver = cameraObject.AddComponent<TrackedPoseDriver>();
            var position = new InputAction("Position", binding: "<XRHMD>/centerEyePosition", expectedControlType: "Vector3");
            position.AddBinding("<HandheldARInputDevice>/devicePosition");
            var rotation = new InputAction("Rotation", binding: "<XRHMD>/centerEyeRotation", expectedControlType: "Quaternion");
            rotation.AddBinding("<HandheldARInputDevice>/deviceRotation");
            poseDriver.positionInput = new InputActionProperty(position);
            poseDriver.rotationInput = new InputActionProperty(rotation);
            origin.CameraFloorOffsetObject = offsetObject;
            origin.Camera = camera;

            SetObjectReferences(rig,
                ("arCamera", camera), ("arSession", session),
                ("raycastManager", raycasts), ("anchorManager", anchors),
                ("planeManager", planes));

            var systemsObject = new GameObject("Shadow Doors Systems");
            SetupFlow setup = systemsObject.AddComponent<SetupFlow>();
            ScenarioDirector director = systemsObject.AddComponent<ScenarioDirector>();
            BanishSystem banish = systemsObject.AddComponent<BanishSystem>();
            AudioKit audio = systemsObject.AddComponent<AudioKit>();
            ConsumedFX consumed = systemsObject.AddComponent<ConsumedFX>();
            GameLoop loop = systemsObject.AddComponent<GameLoop>();

            var canvasObject = new GameObject("Shadow Doors UI", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            Canvas canvas = canvasObject.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            CanvasScaler scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080f, 1920f);

            Text status = CreateText(canvasObject.transform, "Setup Status", "Scanning room... hold steady.",
                34, TextAnchor.UpperCenter, new Vector2(40f, -60f), new Vector2(-40f, -260f));
            Button confirm = CreateButton(canvasObject.transform, "Confirm", "CONFIRM");
            Image progress = CreateImage(canvasObject.transform, "Banish Progress", new Color(1f, 0.85f, 0.2f, 0.9f));
            SetRect(progress.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f),
                new Vector2(0f, 0f), new Vector2(120f, 120f));
            progress.type = Image.Type.Filled;
            progress.fillMethod = Image.FillMethod.Radial360;
            progress.fillOrigin = 2;
            progress.fillClockwise = true;

            Image darkness = CreateImage(canvasObject.transform, "Consumed Darkness", Color.white);
            Stretch(darkness.rectTransform);
            darkness.material = darknessMaterial;
            darkness.gameObject.SetActive(false);

            Image endPanel = CreateImage(canvasObject.transform, "End Card", new Color(0f, 0f, 0f, 0.9f));
            Stretch(endPanel.rectTransform);
            Text endText = CreateText(endPanel.transform, "End Card Text", "DAWN", 72,
                TextAnchor.MiddleCenter, Vector2.zero, Vector2.zero);
            Stretch(endText.rectTransform);
            endPanel.gameObject.SetActive(false);

            var eventSystem = new GameObject("EventSystem", typeof(EventSystem), typeof(InputSystemUIInputModule));
            eventSystem.transform.SetParent(canvasObject.transform, false);

            TextAsset scenario = AssetDatabase.LoadAssetAtPath<TextAsset>(
                "Assets/ShadowDoors/Scenarios/scenario_mvp.json");
            if (scenario == null)
            {
                throw new BuildFailedException("scenario_mvp.json was not imported.");
            }

            SetObjectReferences(setup,
                ("arRigSource", rig), ("statusText", status),
                ("confirmButton", confirm), ("doorGizmoPrefab", doorPrefab));
            SetObjectReferences(director, ("scenarioJson", scenario));
            SetObjectReferences(banish, ("arRigSource", rig), ("progressRing", progress));
            ConfigureAudio(audio, systemsObject);
            SetObjectReferences(consumed, ("darknessOverlay", darkness));
            SetObjectReferences(loop,
                ("arRigSource", rig), ("setupFlow", setup), ("director", director),
                ("banishSystem", banish), ("audioKit", audio), ("consumedFx", consumed),
                ("shadowAgentPrefab", shadowPrefab), ("endCardPanel", endPanel.gameObject),
                ("endCardText", endText));

            EditorSceneManager.SaveScene(scene, ScenePath);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(ScenePath, true) };
            AssetDatabase.SaveAssets();
        }

        private static Material GetOrCreateMaterial(string path, string shaderName)
        {
            Material material = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (material != null) return material;
            Shader shader = Shader.Find(shaderName);
            if (shader == null) throw new BuildFailedException("Missing shader: " + shaderName);
            material = new Material(shader) { name = Path.GetFileNameWithoutExtension(path) };
            AssetDatabase.CreateAsset(material, path);
            return material;
        }

        private static GameObject CreateShadowPrefab(Material material)
        {
            GameObject existing = AssetDatabase.LoadAssetAtPath<GameObject>(ShadowPrefabPath);
            if (existing != null) return existing;
            GameObject instance = GameObject.CreatePrimitive(PrimitiveType.Quad);
            instance.name = "ShadowAgent";
            UnityEngine.Object.DestroyImmediate(instance.GetComponent<Collider>());
            instance.GetComponent<MeshRenderer>().sharedMaterial = material;
            instance.AddComponent<ShadowAgent>();
            GameObject prefab = PrefabUtility.SaveAsPrefabAsset(instance, ShadowPrefabPath);
            UnityEngine.Object.DestroyImmediate(instance);
            return prefab;
        }

        private static GameObject CreateDoorPrefab()
        {
            GameObject existing = AssetDatabase.LoadAssetAtPath<GameObject>(DoorPrefabPath);
            if (existing != null) return existing;
            GameObject instance = GameObject.CreatePrimitive(PrimitiveType.Cube);
            instance.name = "DoorGizmo";
            instance.transform.localScale = new Vector3(0.04f, 1f, 0.04f);
            UnityEngine.Object.DestroyImmediate(instance.GetComponent<Collider>());
            instance.GetComponent<MeshRenderer>().sharedMaterial =
                AssetDatabase.GetBuiltinExtraResource<Material>("Default-Material.mat");
            GameObject prefab = PrefabUtility.SaveAsPrefabAsset(instance, DoorPrefabPath);
            UnityEngine.Object.DestroyImmediate(instance);
            return prefab;
        }

        private static void ConfigureAudio(AudioKit audio, GameObject parent)
        {
            AudioSource heartbeat = parent.AddComponent<AudioSource>();
            heartbeat.playOnAwake = false;
            AudioSource ambient = parent.AddComponent<AudioSource>();
            ambient.playOnAwake = false;
            SetObjectReferences(audio, ("heartbeatSource", heartbeat), ("ambientSource", ambient));

            string[] names =
            {
                "whisper_loop", "heartbeat_loop", "emerge_hiss", "banish_stinger",
                "dawn_chord", "found_you", "chant_loop", "demonic_voice_a",
                "demonic_voice_b", "main_voice_dawn", "main_voice_lose"
            };
            var serialized = new SerializedObject(audio);
            SerializedProperty clips = serialized.FindProperty("clips");
            clips.arraySize = names.Length;
            for (int i = 0; i < names.Length; i++)
            {
                SerializedProperty entry = clips.GetArrayElementAtIndex(i);
                entry.FindPropertyRelative("name").stringValue = names[i];
                entry.FindPropertyRelative("clip").objectReferenceValue =
                    AssetDatabase.LoadAssetAtPath<AudioClip>($"Assets/ShadowDoors/Audio/{names[i]}.wav");
            }
            if (!serialized.ApplyModifiedPropertiesWithoutUndo())
            {
                throw new BuildFailedException("Could not wire AudioKit clips.");
            }
        }

        private static Text CreateText(Transform parent, string name, string value, int size,
            TextAnchor alignment, Vector2 offsetMin, Vector2 offsetMax)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(Text));
            go.transform.SetParent(parent, false);
            Text text = go.GetComponent<Text>();
            text.font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            text.text = value;
            text.fontSize = size;
            text.alignment = alignment;
            text.color = Color.white;
            RectTransform rect = text.rectTransform;
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(1f, 1f);
            rect.offsetMin = offsetMin;
            rect.offsetMax = offsetMax;
            return text;
        }

        private static Button CreateButton(Transform parent, string name, string label)
        {
            Image image = CreateImage(parent, name, new Color(0.12f, 0.12f, 0.12f, 0.9f));
            SetRect(image.rectTransform, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f),
                new Vector2(0f, 150f), new Vector2(520f, 140f));
            Button button = image.gameObject.AddComponent<Button>();
            Text text = CreateText(image.transform, "Label", label, 40, TextAnchor.MiddleCenter,
                Vector2.zero, Vector2.zero);
            Stretch(text.rectTransform);
            return button;
        }

        private static Image CreateImage(Transform parent, string name, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            go.transform.SetParent(parent, false);
            Image image = go.GetComponent<Image>();
            image.color = color;
            return image;
        }

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void SetRect(RectTransform rect, Vector2 anchorMin, Vector2 anchorMax,
            Vector2 anchoredPosition, Vector2 size)
        {
            rect.anchorMin = anchorMin;
            rect.anchorMax = anchorMax;
            rect.anchoredPosition = anchoredPosition;
            rect.sizeDelta = size;
        }

        private static void SetObjectReferences(UnityEngine.Object target,
            params (string property, UnityEngine.Object value)[] references)
        {
            var serialized = new SerializedObject(target);
            foreach ((string property, UnityEngine.Object value) reference in references)
            {
                SerializedProperty field = serialized.FindProperty(reference.property);
                if (field == null)
                {
                    throw new BuildFailedException(
                        $"{target.GetType().Name} has no serialized field '{reference.property}'.");
                }
                field.objectReferenceValue = reference.value;
            }
            if (!serialized.ApplyModifiedPropertiesWithoutUndo())
            {
                throw new BuildFailedException("Could not serialize references for " + target.GetType().Name);
            }
        }

        private static void EnsureFolder(string path)
        {
            string[] parts = path.Split('/');
            string current = parts[0];
            for (int i = 1; i < parts.Length; i++)
            {
                string next = current + "/" + parts[i];
                if (!AssetDatabase.IsValidFolder(next))
                {
                    AssetDatabase.CreateFolder(current, parts[i]);
                }
                current = next;
            }
        }
    }
}
