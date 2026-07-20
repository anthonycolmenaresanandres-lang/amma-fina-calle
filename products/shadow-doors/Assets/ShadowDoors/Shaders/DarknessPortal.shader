// The breach portal (Anthony's direction, 2026-07-20): "overlay the entrance in
// darkness as we break into it ... no matter what door is there the animation always
// makes sense." The trick is to never try to FIT the door: the portal is an amorphous
// black mass with procedural noise-eaten edges that bleeds outward from the tagged
// anchor point. Smoke has no wrong size — against a narrow door, a double door, an
// archway, or a window, an organic stain of darkness spilling over the opening reads
// correctly, where any fitted rectangle would visibly miss the real frame.
//
// ⚠ VERIFY (whole file): same caveat as ShadowSilhouette.shader — written as text
// against the URP Unlit pattern stable across URP 12-17, never compiled here. Confirm
// on the Unity 6000.3.19f1 + URP 17.0.4 machine; likely trouble spots called out inline.
Shader "ShadowDoors/DarknessPortal"
{
    Properties
    {
        // 0 = closed (invisible), 1 = fully bled open. Driven per-frame by
        // DarknessPortal.cs via MaterialPropertyBlock.
        _OpenAmount ("Open Amount", Range(0, 1)) = 0

        _PortalColor ("Portal Color", Color) = (0.01, 0.005, 0.02, 1)
        _EdgeColor ("Edge Ember Color", Color) = (0.25, 0.05, 0.35, 1)

        _EdgeNoiseAmount ("Edge Noise Amount", Range(0, 0.6)) = 0.30
        _EdgeSoftness ("Edge Softness", Range(0.01, 0.4)) = 0.12
        _NoiseScale ("Noise Scale", Range(1, 16)) = 5.0
        _SwirlSpeed ("Swirl Speed", Range(0, 3)) = 0.55
    }

    SubShader
    {
        Tags
        {
            "RenderType" = "Transparent"
            "Queue" = "Transparent"
            "RenderPipeline" = "UniversalRenderPipeline"
            "IgnoreProjector" = "True"
        }

        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        Cull Off // spawn orientation is yaw-only toward the camera; Off makes facing direction irrelevant.

        Pass
        {
            Name "ForwardUnlit"
            // ⚠ VERIFY: same LightMode note as ShadowSilhouette — if it doesn't render
            // under URP 17.0.4, try "UniversalForwardOnly".
            Tags { "LightMode" = "UniversalForward" }

            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct Attributes
            {
                float4 positionOS : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct Varyings
            {
                float4 positionHCS : SV_POSITION;
                float2 uv : TEXCOORD0;
            };

            CBUFFER_START(UnityPerMaterial)
                float _OpenAmount;
                float4 _PortalColor;
                float4 _EdgeColor;
                float _EdgeNoiseAmount;
                float _EdgeSoftness;
                float _NoiseScale;
                float _SwirlSpeed;
            CBUFFER_END

            Varyings Vert(Attributes input)
            {
                Varyings output;
                output.positionHCS = TransformObjectToHClip(input.positionOS.xyz);
                output.uv = input.uv;
                return output;
            }

            // Procedural value noise — no textures, mobile-cheap (2 octaves below).
            float Hash(float2 p)
            {
                return frac(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
            }

            float ValueNoise(float2 p)
            {
                float2 i = floor(p);
                float2 f = frac(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = Hash(i);
                float b = Hash(i + float2(1, 0));
                float c = Hash(i + float2(0, 1));
                float d = Hash(i + float2(1, 1));
                return lerp(lerp(a, b, f.x), lerp(c, d, f.x), f.y);
            }

            float Fbm(float2 p)
            {
                // Two octaves is enough for a smoky edge at phone cost.
                return ValueNoise(p) * 0.65 + ValueNoise(p * 2.13 + 17.7) * 0.35;
            }

            half4 Frag(Varyings input) : SV_Target
            {
                // Centered radial coordinate; the quad's transform scale (set by
                // DarknessPortal.cs) provides the door-ish aspect, so UV space stays
                // a clean unit circle: r==1 at the quad edge midpoints.
                float2 centered = (input.uv - float2(0.5, 0.5)) * 2.0;
                float r = length(centered);

                // Seam-free smoke wobble: noise sampled in centered-UV space (NOT
                // angle space, which would seam at +/-pi), drifting upward over time
                // like slow rising smoke.
                float2 drift = float2(0.0, _Time.y * _SwirlSpeed);
                float wobble = (Fbm(centered * _NoiseScale + drift) - 0.5) * _EdgeNoiseAmount;

                // The bleed: darkness is present where the wobbled radius is inside
                // the open front. Slight overshoot (1 + noise amount) guarantees full
                // quad coverage at _OpenAmount == 1 despite negative wobble.
                float openFront = _OpenAmount * (1.0 + _EdgeNoiseAmount + _EdgeSoftness);
                float alpha = 1.0 - smoothstep(openFront - _EdgeSoftness, openFront, r + wobble);

                // Interior density flicker — the void isn't flat, it breathes.
                float density = 0.88 + 0.12 * Fbm(centered * (_NoiseScale * 0.6) - drift);

                // A faint ember rim right at the smoke front (violet by default —
                // reads "wrong light", not "fire").
                float rim = smoothstep(openFront - _EdgeSoftness * 2.0, openFront - _EdgeSoftness, r + wobble)
                          * (1.0 - smoothstep(openFront - _EdgeSoftness, openFront, r + wobble));
                float3 color = lerp(_PortalColor.rgb * density, _EdgeColor.rgb, rim * 0.6);

                return half4(color, alpha * _PortalColor.a);
            }
            ENDHLSL
        }
    }

    Fallback Off
}
