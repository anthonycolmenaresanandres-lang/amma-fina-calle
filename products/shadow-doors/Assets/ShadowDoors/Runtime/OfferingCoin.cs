using UnityEngine;

namespace ShadowDoors.Runtime
{
    /// <summary>
    /// One coin of the offering: a flat glowing disc on the floor that bobs and
    /// shimmers, begging to be tapped. Prefab recipe (runbook): Quad + this component
    /// + a material using ShadowDoors/OfferingCoin + a SphereCollider (~0.09 radius)
    /// so CoinOffering's tap raycast can hit it. CoinOffering owns spawning,
    /// collection logic, and warnings — this component only animates and dies.
    /// </summary>
    [RequireComponent(typeof(MeshRenderer))]
    public class OfferingCoin : MonoBehaviour
    {
        private const float BobAmplitudeMeters = 0.015f;
        private const float BobFrequencyHz = 0.8f;
        private const float SpinDegreesPerSecond = 25f;
        private const float CollectSeconds = 0.25f;
        private const float SinkSeconds = 1.1f;

        private static readonly int GlowId = Shader.PropertyToID("_Glow");

        private MeshRenderer _renderer;
        private MaterialPropertyBlock _props;
        private Vector3 _basePosition;
        private Vector3 _baseScale;
        private float _phase;
        private float _stateTimer;
        private Mode _mode = Mode.Idle;

        private enum Mode
        {
            Idle,
            Collecting,
            Sinking
        }

        private void Awake()
        {
            _renderer = GetComponent<MeshRenderer>();
            _props = new MaterialPropertyBlock();
            _basePosition = transform.position;
            _baseScale = transform.localScale;
            _phase = Random.Range(0f, Mathf.PI * 2f); // desync sibling coins' bob.
        }

        /// <summary>Taken by the player — quick greedy flash-and-gone.</summary>
        public void Collect()
        {
            if (_mode == Mode.Idle)
            {
                _mode = Mode.Collecting;
                _stateTimer = 0f;
            }
        }

        /// <summary>Withdrawn by the entity (refusal path) — sinks back into the floor.</summary>
        public void Sink()
        {
            if (_mode == Mode.Idle)
            {
                _mode = Mode.Sinking;
                _stateTimer = 0f;
            }
        }

        private void Update()
        {
            switch (_mode)
            {
                case Mode.Idle:
                    _phase += Time.deltaTime * BobFrequencyHz * Mathf.PI * 2f;
                    transform.position = _basePosition + Vector3.up * (Mathf.Sin(_phase) * BobAmplitudeMeters);
                    transform.Rotate(0f, 0f, SpinDegreesPerSecond * Time.deltaTime, Space.Self);
                    ApplyGlow(1f + 0.25f * Mathf.Sin(_phase * 0.7f));
                    break;

                case Mode.Collecting:
                {
                    _stateTimer += Time.deltaTime;
                    float t = Mathf.Clamp01(_stateTimer / CollectSeconds);
                    // Greedy pop: a brief swell + brighten, then gone.
                    transform.localScale = _baseScale * (1f + 0.6f * t);
                    ApplyGlow(Mathf.Lerp(2.5f, 0f, t * t));
                    if (t >= 1f)
                    {
                        Destroy(gameObject);
                    }
                    break;
                }

                case Mode.Sinking:
                {
                    _stateTimer += Time.deltaTime;
                    float t = Mathf.Clamp01(_stateTimer / SinkSeconds);
                    transform.position = _basePosition + Vector3.down * (0.05f * t);
                    transform.localScale = _baseScale * (1f - t);
                    ApplyGlow(1f - t);
                    if (t >= 1f)
                    {
                        Destroy(gameObject);
                    }
                    break;
                }
            }
        }

        private void ApplyGlow(float glow)
        {
            _renderer.GetPropertyBlock(_props);
            _props.SetFloat(GlowId, glow);
            _renderer.SetPropertyBlock(_props);
        }
    }
}
