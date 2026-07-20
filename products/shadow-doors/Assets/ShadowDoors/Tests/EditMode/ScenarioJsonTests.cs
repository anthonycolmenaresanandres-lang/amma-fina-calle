using System;
using System.Collections.Generic;
using System.IO;
using NUnit.Framework;
using UnityEngine;

namespace ShadowDoors.Tests.EditMode
{
    /// <summary>
    /// Validates Assets/ShadowDoors/Scenarios/scenario_mvp.json against the schema in
    /// AR_SHADOW_DOORS_MVP.md:
    ///   { "duration": 180, "events": [ { "t": 12, "door": 0, "action": "whisper" },
    ///                                  { "t": 20, "door": 0, "action": "emerge", "speed": 0.35 }, ... ] }
    ///
    /// This file does NOT create ScenarioDirector/ScenarioEvent (Runtime/ is out of scope) —
    /// it deserializes with small test-local DTO classes (ScenarioJsonFile/ScenarioJsonEvent,
    /// declared below, private to this test assembly) purely so JsonUtility has concrete
    /// types to parse into. scenario_mvp.json itself is expected to be authored under
    /// Assets/ShadowDoors/Scenarios/ by the runtime/content side of this MVP (also out of
    /// this agent's scope: only tools/, Tests/, Audio/, RUNBOOK_NOTES.md) — these tests will
    /// legitimately fail with a clear "file not found" message until that file exists.
    ///
    /// Path resolution: Directory.GetCurrentDirectory() is the Unity project root during both
    /// Editor test runs and -batchmode -runTests (Unity's CWD is the project folder, i.e. the
    /// folder containing Assets/), so the scenario file is read relative to that.
    /// </summary>
    public class ScenarioJsonTests
    {
        private const float ExpectedDuration = 180f;
        private const float QuietTailSeconds = 5f;
        private const float MinEmergeSpeed = 0.2f;
        private const float MaxEmergeSpeed = 1.0f;
        private const int MinDoorIndex = 0;
        private const int MaxDoorIndex = 3;

        private ScenarioJsonFile _scenario;

        [OneTimeSetUp]
        public void LoadScenario()
        {
            string path = ResolveScenarioPath();
            if (!File.Exists(path))
            {
                Assert.Fail(
                    "scenario_mvp.json not found at '" + path + "'. This test expects the " +
                    "MVP scenario JSON to exist under Assets/ShadowDoors/Scenarios/ (authored " +
                    "outside this agent's Tests/Audio/tools scope) — see " +
                    "PRODUCT_MODULES/AR_SHADOW_DOORS_MVP.md for the schema.");
                return;
            }

            string text = File.ReadAllText(path);
            _scenario = JsonUtility.FromJson<ScenarioJsonFile>(text);
            Assert.IsNotNull(_scenario, "JsonUtility failed to parse scenario_mvp.json.");
            Assert.IsNotNull(_scenario.events, "scenario_mvp.json 'events' array is missing/null.");
        }

        private static string ResolveScenarioPath()
        {
            string projectRoot = Directory.GetCurrentDirectory();
            return Path.Combine(projectRoot, "Assets", "ShadowDoors", "Scenarios", "scenario_mvp.json");
        }

        [Test]
        public void Scenario_DurationIs180()
        {
            Assert.AreEqual(ExpectedDuration, _scenario.duration, 0.001f,
                "MVP ships ONE handcrafted 180s scenario (AR_SHADOW_DOORS_MVP.md).");
        }

        [Test]
        public void Scenario_EventsAreSortedByT()
        {
            for (int i = 1; i < _scenario.events.Length; i++)
            {
                Assert.LessOrEqual(_scenario.events[i - 1].t, _scenario.events[i].t,
                    $"events[{i - 1}].t ({_scenario.events[i - 1].t}) must be <= events[{i}].t " +
                    $"({_scenario.events[i].t}) — ScenarioDirector.NextEventIndex assumes an " +
                    "ascending-t queue.");
            }
        }

        [Test]
        public void Scenario_EveryDoorIndexInRange()
        {
            foreach (var ev in _scenario.events)
            {
                Assert.IsTrue(ev.door >= MinDoorIndex && ev.door <= MaxDoorIndex,
                    $"event at t={ev.t} references door index {ev.door}, expected " +
                    $"{MinDoorIndex}..{MaxDoorIndex} (min 1 / max 4 tagged doors).");
            }
        }

        [Test]
        public void Scenario_EmergeSpeedsInRange()
        {
            foreach (var ev in _scenario.events)
            {
                if (ev.action != "emerge") continue;
                Assert.IsTrue(ev.speed >= MinEmergeSpeed && ev.speed <= MaxEmergeSpeed,
                    $"emerge event at t={ev.t} door={ev.door} has speed={ev.speed} m/s, " +
                    $"expected {MinEmergeSpeed}..{MaxEmergeSpeed}.");
            }
        }

        [Test]
        public void Scenario_HasAtLeastTwoWhisperOnlyFeints()
        {
            // Heuristic (documented assumption — see class doc comment / final report):
            // a "whisper-only feint" is a whisper event whose door does NOT receive the very
            // next event at that same door as an "emerge" (i.e. the whisper never resolves
            // into a real shadow at that door — it's dread bait, matching
            // AR_SHADOW_DOORS_MVP.md's "feints are whisper-only events").
            var byDoor = new Dictionary<int, List<ScenarioJsonEvent>>();
            foreach (var ev in _scenario.events)
            {
                if (!byDoor.TryGetValue(ev.door, out var list))
                {
                    list = new List<ScenarioJsonEvent>();
                    byDoor[ev.door] = list;
                }
                list.Add(ev);
            }

            int feintCount = 0;
            foreach (var ev in _scenario.events)
            {
                if (ev.action != "whisper") continue;

                var doorEvents = byDoor[ev.door];
                int idx = doorEvents.IndexOf(ev);
                bool followedByEmerge = idx + 1 < doorEvents.Count &&
                                         doorEvents[idx + 1].action == "emerge";
                if (!followedByEmerge)
                {
                    feintCount++;
                }
            }

            Assert.GreaterOrEqual(feintCount, 2,
                "expected at least 2 whisper-only feints (whisper events at a door with no " +
                $"following emerge at that same door); found {feintCount}.");
        }

        [Test]
        public void Scenario_FinalFiveSecondsAreQuiet()
        {
            float quietFrom = _scenario.duration - QuietTailSeconds;
            foreach (var ev in _scenario.events)
            {
                Assert.Less(ev.t, quietFrom,
                    $"event at t={ev.t} falls inside the final {QuietTailSeconds}s " +
                    $"(t >= {quietFrom}), which AR_SHADOW_DOORS_MVP.md's escalation design " +
                    "implies should be left quiet before the win card.");
            }
        }

        [Serializable]
        private class ScenarioJsonEvent
        {
            public float t;
            public int door;
            public string action;
            public float speed;
        }

        [Serializable]
        private class ScenarioJsonFile
        {
            public float duration;
            public ScenarioJsonEvent[] events;
        }
    }
}
