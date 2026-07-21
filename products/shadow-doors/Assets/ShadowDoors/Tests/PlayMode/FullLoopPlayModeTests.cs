using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using NUnit.Framework;
using ShadowDoors.Runtime;
using UnityEngine;
using UnityEngine.TestTools;

namespace ShadowDoors.Tests.PlayMode
{
    public class FullLoopPlayModeTests
    {
        private const float AcceleratedTimeScale = 30f;
        private const float RealTimeTimeoutSeconds = 90f;

        [UnityTest]
        [Timeout(120000)]
        public IEnumerator FullMockARRigLoop_EmitsRequiredMarkersInOrder()
        {
            var markerLines = new List<string>();
            Application.LogCallback capture = (condition, stackTrace, type) =>
            {
                if (condition.Contains("SETUP_COMPLETE") ||
                    condition.Contains("FIRST_EMERGE") ||
                    condition.Contains("BANISH_OK") ||
                    condition.Contains("RUN_END"))
                {
                    markerLines.Add(condition);
                }
            };

            Application.logMessageReceived += capture;
            float originalTimeScale = Time.timeScale;
            GameObject root = null;
            GameObject shadowTemplate = null;
            ScenarioDirector director = null;

            try
            {
                root = new GameObject("ShadowDoors_FullLoopHarness");
                root.SetActive(false);

                var cameraObject = new GameObject("MockCamera");
                cameraObject.transform.SetParent(root.transform, false);
                cameraObject.transform.localPosition = new Vector3(0f, 1.6f, 0f);
                cameraObject.AddComponent<Camera>();

                var rig = root.AddComponent<MockARRig>();
                SetPrivateField(rig, "scanDelaySeconds", 0f);

                var setup = root.AddComponent<SetupFlow>();
                SetPrivateField(setup, "arRigSource", rig);
                SetPrivateField(setup, "minDoors", 1);
                SetPrivateField(setup, "maxDoors", 4);

                director = root.AddComponent<ScenarioDirector>();
                string scenarioPath = Path.Combine(
                    Directory.GetCurrentDirectory(), "Assets", "ShadowDoors", "Scenarios", "scenario_mvp.json");
                Assert.That(File.Exists(scenarioPath), Is.True, "Full-loop scenario JSON is missing.");
                SetPrivateField(director, "scenarioJson", new TextAsset(File.ReadAllText(scenarioPath)));

                var banish = root.AddComponent<BanishSystem>();
                SetPrivateField(banish, "arRigSource", rig);

                shadowTemplate = new GameObject("ShadowAgent_PlayModeTemplate");
                shadowTemplate.transform.SetParent(root.transform, false);
                shadowTemplate.AddComponent<MeshRenderer>();
                shadowTemplate.AddComponent<ShadowAgent>();

                var gameLoop = root.AddComponent<GameLoop>();
                SetPrivateField(gameLoop, "arRigSource", rig);
                SetPrivateField(gameLoop, "setupFlow", setup);
                SetPrivateField(gameLoop, "director", director);
                SetPrivateField(gameLoop, "banishSystem", banish);
                SetPrivateField(gameLoop, "shadowAgentPrefab", shadowTemplate);

                var doorAnchors = GetPrivateField<List<Transform>>(setup, "_doorAnchors");
                for (int i = 0; i < 4; i++)
                {
                    var door = new GameObject("ScriptedDoor_" + i);
                    door.transform.SetParent(root.transform, false);
                    door.transform.localPosition = new Vector3(0f, 1.6f, 4f + i * 0.01f);
                    doorAnchors.Add(door.transform);
                }

                var safeCenter = new GameObject("ScriptedSafeCenter");
                safeCenter.transform.SetParent(root.transform, false);
                safeCenter.transform.localPosition = Vector3.zero;

                root.SetActive(true);
                yield return null;

                // Script the same three confirms a player performs after tagging doors,
                // selecting the safe center, and pressing the final "begin" OK on the
                // ArmedReady screen (player-instructions ruling). Invoking the private
                // button handler avoids faking any runtime marker or bypassing
                // SetupFlow's state contract.
                SetPrivateProperty(setup, "State", SetupFlow.SetupState.TagDoors);
                InvokePrivate(setup, "OnConfirmPressed");
                Assert.That(setup.State, Is.EqualTo(SetupFlow.SetupState.SetSafeCenter));
                SetPrivateProperty(setup, "SafeCenterAnchor", safeCenter.transform);
                InvokePrivate(setup, "OnConfirmPressed");
                Assert.That(setup.State, Is.EqualTo(SetupFlow.SetupState.ArmedReady));
                InvokePrivate(setup, "OnConfirmPressed");
                Assert.That(setup.State, Is.EqualTo(SetupFlow.SetupState.Ready));

                Time.timeScale = AcceleratedTimeScale;
                float realTimeStart = Time.realtimeSinceStartup;
                while (!markerLines.Any(line => line.Contains("RUN_END")) &&
                       Time.realtimeSinceStartup - realTimeStart < RealTimeTimeoutSeconds)
                {
                    yield return null;
                }
            }
            finally
            {
                Time.timeScale = originalTimeScale;
                Application.logMessageReceived -= capture;
                if (root != null)
                {
                    UnityEngine.Object.Destroy(root);
                }
            }

            string[] required = { "SETUP_COMPLETE", "FIRST_EMERGE", "BANISH_OK", "RUN_END" };
            int previousIndex = -1;
            foreach (string marker in required)
            {
                int index = markerLines.FindIndex(line => line.Contains(marker));
                Assert.That(index, Is.GreaterThan(previousIndex),
                    marker + " must appear after the preceding marker. Log: " + string.Join(" | ", markerLines));
                previousIndex = index;
            }

            Assert.That(markerLines.Last(line => line.Contains("RUN_END")), Does.Contain("result=WIN"));
            Assert.That(director, Is.Not.Null);
            Assert.That(director.Clock, Is.GreaterThanOrEqualTo(180f));
        }

        private static void SetPrivateField(object target, string name, object value)
        {
            FieldInfo field = target.GetType().GetField(name, BindingFlags.Instance | BindingFlags.NonPublic);
            Assert.That(field, Is.Not.Null, "Missing private field " + target.GetType().Name + "." + name);
            field.SetValue(target, value);
        }

        private static T GetPrivateField<T>(object target, string name)
        {
            FieldInfo field = target.GetType().GetField(name, BindingFlags.Instance | BindingFlags.NonPublic);
            Assert.That(field, Is.Not.Null, "Missing private field " + target.GetType().Name + "." + name);
            return (T)field.GetValue(target);
        }

        private static void SetPrivateProperty(object target, string name, object value)
        {
            PropertyInfo property = target.GetType().GetProperty(name, BindingFlags.Instance | BindingFlags.Public);
            Assert.That(property, Is.Not.Null, "Missing property " + target.GetType().Name + "." + name);
            MethodInfo setter = property.GetSetMethod(true);
            Assert.That(setter, Is.Not.Null, "Missing setter " + target.GetType().Name + "." + name);
            setter.Invoke(target, new[] { value });
        }

        private static void InvokePrivate(object target, string name)
        {
            MethodInfo method = target.GetType().GetMethod(name, BindingFlags.Instance | BindingFlags.NonPublic);
            Assert.That(method, Is.Not.Null, "Missing private method " + target.GetType().Name + "." + name);
            method.Invoke(target, null);
        }
    }
}
