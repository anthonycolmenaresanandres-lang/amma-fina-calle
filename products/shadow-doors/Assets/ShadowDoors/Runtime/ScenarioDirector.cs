using System;
using System.Collections.Generic;
using UnityEngine;

namespace ShadowDoors.Runtime
{
    /// <summary>One scheduled beat in a scenario. Mirrors the spec's JSON schema exactly.</summary>
    [Serializable]
    public class ScenarioEvent
    {
        /// <summary>Seconds since run start.</summary>
        public float t;

        /// <summary>Door index, resolved against tag order from SetupFlow (0-based). If the scenario references a higher index than doors were tagged, GameLoop wraps it modulo the tagged door count.</summary>
        public int door;

        /// <summary>"whisper" or "emerge" (string, not a JsonUtility enum — JsonUtility can't map named-string JSON onto a C# enum, only ints, so this is parsed by ScenarioDirector at fire time instead).</summary>
        public string action;

        /// <summary>Glide speed in m/s. Only meaningful when action == "emerge"; 0 for whisper events.</summary>
        public float speed;
    }

    /// <summary>Root shape of scenario_mvp.json.</summary>
    [Serializable]
    public class ScenarioData
    {
        public float duration;
        public ScenarioEvent[] events;
    }

    /// <summary>
    /// Loads scenario_mvp.json and fires its events against a run clock — the DC
    /// SkyWarDirector pattern (timers, no per-frame logic beyond the clock tick).
    /// Deliberately dumb: all "what happens at what time" data lives in JSON, not code,
    /// so the ladder + escalation can be retuned without touching this class.
    /// </summary>
    public class ScenarioDirector : MonoBehaviour
    {
        [SerializeField] private TextAsset scenarioJson;

        private ScenarioData _data;
        private int _firedIndex;
        private bool _firstEmergeLogged;
        private bool _running;

        /// <summary>Seconds elapsed since StartRun.</summary>
        public float Clock { get; private set; }

        /// <summary>Total run duration (m), read from the loaded scenario.</summary>
        public float Duration => _data != null ? _data.duration : 0f;

        /// <summary>Fired for a "whisper" event: spatial audio at a door, nothing visible.</summary>
        public event Action<int> OnWhisper;

        /// <summary>Fired for an "emerge" event: a shadow should spawn at this door and glide at this speed.</summary>
        public event Action<int, float> OnEmerge;

        /// <summary>Fired once when Clock reaches Duration with no prior Lose. GameLoop owns the RUN_END log (it's the only system that also knows about Lose) — see GameLoop.cs.</summary>
        public event Action OnWin;

        private void Awake()
        {
            if (scenarioJson == null)
            {
                Debug.LogError("ScenarioDirector: no scenarioJson TextAsset assigned.");
                return;
            }

            _data = JsonUtility.FromJson<ScenarioData>(scenarioJson.text);
            if (_data == null || _data.events == null)
            {
                Debug.LogError("ScenarioDirector: scenario JSON failed to parse or has no events[].");
            }
        }

        /// <summary>Starts (or restarts, per the R-restart "same anchors" flow) the run clock from zero.</summary>
        public void StartRun()
        {
            Clock = 0f;
            _firedIndex = 0;
            _firstEmergeLogged = false;
            _running = _data != null && _data.events != null;
        }

        /// <summary>Stops the clock without firing OnWin — GameLoop calls this on Lose so the director doesn't also declare a win mid-frame.</summary>
        public void StopRun()
        {
            _running = false;
        }

        private void Update()
        {
            if (!_running)
            {
                return;
            }

            Clock += Time.deltaTime;

            int due = NextEventIndex(_data.events, Clock);
            while (_firedIndex < due)
            {
                FireEvent(_data.events[_firedIndex]);
                _firedIndex++;
            }

            if (Clock >= _data.duration)
            {
                _running = false;
                OnWin?.Invoke();
            }
        }

        private void FireEvent(ScenarioEvent evt)
        {
            switch (evt.action)
            {
                case "whisper":
                    OnWhisper?.Invoke(evt.door);
                    break;

                case "emerge":
                    if (!_firstEmergeLogged)
                    {
                        _firstEmergeLogged = true;
                        Debug.Log("FIRST_EMERGE door=" + evt.door + " t=" + evt.t.ToString("F1"));
                    }
                    OnEmerge?.Invoke(evt.door, evt.speed);
                    break;

                default:
                    Debug.LogWarning("ScenarioDirector: unknown action '" + evt.action + "' at t=" + evt.t);
                    break;
            }
        }

        /// <summary>
        /// Pure schedule math, extracted specifically so it's unit-testable without a
        /// MonoBehaviour/Update loop (spec L1 requirement). Given events sorted
        /// ascending by t and the current run clock, returns the index of the first
        /// event that has NOT yet fired — i.e. events[0..index) are due.
        /// </summary>
        public static int NextEventIndex(IReadOnlyList<ScenarioEvent> events, float clock)
        {
            if (events == null)
            {
                return 0;
            }

            int index = 0;
            while (index < events.Count && events[index].t <= clock)
            {
                index++;
            }

            return index;
        }
    }
}
