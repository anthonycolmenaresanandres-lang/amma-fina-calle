using System;
using System.Collections.Generic;
using UnityEngine;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// Thin pooled-AudioSource wrapper around the WAV assets a parallel agent authors
    /// under Assets/ShadowDoors/Audio/ (procedural WAV pipeline, DC-game style —
    /// whisper_loop, heartbeat_loop, emerge_hiss, banish_stinger, dawn_chord,
    /// found_you). Clips are wired by name in the Inspector rather than hardcoded
    /// fields so the parallel audio agent's asset list can change without a code edit.
    /// </summary>
    public class AudioKit : MonoBehaviour
    {
        [Serializable]
        private class NamedClip
        {
            public string name; // e.g. "whisper_loop" — matches the spec's asset names exactly.
            public AudioClip clip;
        }

        [Tooltip("Wire whisper_loop, heartbeat_loop, emerge_hiss, banish_stinger, dawn_chord, found_you here once the audio agent delivers WAVs.")]
        [SerializeField] private List<NamedClip> clips = new List<NamedClip>();

        [SerializeField] private int pooledSourceCount = 6;
        [SerializeField] private AudioSource heartbeatSource;
        [SerializeField] private float heartbeatBaseVolume = 0.15f;
        [SerializeField] private float heartbeatMaxVolume = 0.9f;
        [SerializeField] private float heartbeatBasePitch = 0.9f;
        [SerializeField] private float heartbeatMaxPitch = 1.4f;

        private readonly Dictionary<string, AudioClip> _clipsByName = new Dictionary<string, AudioClip>();
        private readonly List<AudioSource> _pool = new List<AudioSource>();

        private void Awake()
        {
            foreach (NamedClip entry in clips)
            {
                if (entry != null && !string.IsNullOrEmpty(entry.name) && entry.clip != null)
                {
                    _clipsByName[entry.name] = entry.clip;
                }
            }

            for (int i = 0; i < pooledSourceCount; i++)
            {
                var go = new GameObject("AudioKit_PooledSource_" + i);
                go.transform.SetParent(transform, false);
                var source = go.AddComponent<AudioSource>();
                source.playOnAwake = false;
                _pool.Add(source);
            }

            if (heartbeatSource != null)
            {
                heartbeatSource.loop = true;
                heartbeatSource.spatialBlend = 0f; // heartbeat is a player-subjective cue, not positioned in the world.
                heartbeatSource.volume = 0f;
            }
        }

        /// <summary>Plays a named clip positioned at (and parented to) the given transform — spatialBlend=1, e.g. a whisper AT a door anchor.</summary>
        public void PlayAtAnchor(string clipName, Transform anchor, bool loop)
        {
            if (!TryGetClip(clipName, out AudioClip clip))
            {
                return;
            }

            AudioSource source = RentSource();
            if (source == null)
            {
                return;
            }

            source.transform.SetParent(anchor, false);
            source.transform.localPosition = Vector3.zero;
            source.spatialBlend = 1f;
            source.clip = clip;
            source.loop = loop;
            source.Play();
        }

        /// <summary>Plays a named clip with no spatialization — e.g. banish_stinger, dawn_chord, found_you as full-screen-card stingers.</summary>
        public void PlayFlat(string clipName)
        {
            if (!TryGetClip(clipName, out AudioClip clip))
            {
                return;
            }

            AudioSource source = RentSource();
            if (source == null)
            {
                return;
            }

            source.transform.SetParent(transform, false);
            source.spatialBlend = 0f;
            source.clip = clip;
            source.loop = false;
            source.Play();
        }

        /// <summary>Starts (if not already playing) the flat, looping heartbeat_loop bed. Call once at run start.</summary>
        public void StartHeartbeat()
        {
            if (heartbeatSource == null || !TryGetClip("heartbeat_loop", out AudioClip clip))
            {
                return;
            }

            if (heartbeatSource.clip != clip)
            {
                heartbeatSource.clip = clip;
            }

            if (!heartbeatSource.isPlaying)
            {
                heartbeatSource.volume = heartbeatBaseVolume;
                heartbeatSource.pitch = heartbeatBasePitch;
                heartbeatSource.Play();
            }
        }

        public void StopHeartbeat()
        {
            if (heartbeatSource != null)
            {
                heartbeatSource.Stop();
            }
        }

        /// <summary>
        /// Maps GameLoop's "inverse nearest-shadow distance" heartbeat intensity
        /// (0 = calm, 1 = maximum dread) onto heartbeat volume + pitch.
        /// </summary>
        public void SetHeartbeatIntensity(float intensity01)
        {
            if (heartbeatSource == null)
            {
                return;
            }

            float t = Mathf.Clamp01(intensity01);
            heartbeatSource.volume = Mathf.Lerp(heartbeatBaseVolume, heartbeatMaxVolume, t);
            heartbeatSource.pitch = Mathf.Lerp(heartbeatBasePitch, heartbeatMaxPitch, t);
        }

        private bool TryGetClip(string clipName, out AudioClip clip)
        {
            if (_clipsByName.TryGetValue(clipName, out clip))
            {
                return true;
            }

            Debug.LogWarning("AudioKit: no clip wired for name '" + clipName + "'.");
            return false;
        }

        // Round-robins the pool rather than tracking per-clip "is this playing" state —
        // simplest thing that works for an MVP with at most a handful of concurrent
        // one-shots + loops (max 3 concurrent shadows per the scenario ladder).
        private int _nextPoolIndex;

        private AudioSource RentSource()
        {
            if (_pool.Count == 0)
            {
                return null;
            }

            AudioSource source = _pool[_nextPoolIndex];
            _nextPoolIndex = (_nextPoolIndex + 1) % _pool.Count;
            return source;
        }
    }
}
