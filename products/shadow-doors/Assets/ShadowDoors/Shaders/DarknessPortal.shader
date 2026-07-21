// The floor breach, take 2 (Anthony's device-playtest notes, 2026-07-20):
// "it starts as a square and looks very raw... I need it to look like the floor is
// cracking." Two-phase timeline driven by one param (_OpenAmount, same contract as
// before — DarknessPortal.cs unchanged):
//   phase 1 (open 0.00-0.40): thin ember-glowing CRACKS split outward from the center,
//     as if something under the floor is forcing its way up;
//   phase 2 (open 0.35-1.00): darkness pools out of the cracks and swallows them; the
//     noise-eaten smoke edge takes over.
// Square-edge fix: a hard border falloff multiplies ALL alpha to zero well before the
// quad boundary, so no parameter combination can ever expose the quad shape again.
//
// Authored on the pipeline-agnostic path (plain CG, no URP includes, untagged pass =
// SRPDefaultUnlit under URP) — the same approach Codex verified survives URP 17.3's
// scriptable stripping on the Android build (the old URP-tagged pass was stripped to
// zero GLES3 programs, which is exactly what rendered magenta on-device).
Shader "ShadowDoors/DarknessPortal"
{
    Properties
    {
        // 0 = closed, 1 = fully open. Driven per-frame by DarknessPortal.cs.
        _OpenAmount ("Open Amount", Range(0, 1)) = 0

        _PortalColor ("Pool Color", Color) = (0.01, 0.005, 0.02, 1)
        _CrackColor ("Crack Ember Color", Color) = (0.9, 0.25, 0.06, 1)
        _EdgeColor ("Pool Edge Ember Color", Color) = (0.25, 0.05, 0.35, 1)

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
            "IgnoreProjector" = "True"
        }

        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        Cull Off // lies flat on the floor; visible from any player height.

        Pass
        {
            // Deliberately no LightMode tag: URP renders untagged passes via
            // SRPDefaultUnlit and the stripper leaves them alone.
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            float _OpenAmount;
            float4 _PortalColor;
            float4 _CrackColor;
            float4 _EdgeColor;
            float _EdgeNoiseAmount;
            float _EdgeSoftness;
            float _NoiseScale;
            float _SwirlSpeed;

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct v2f
            {
                float4 pos : SV_POSITION;
                float2 uv : TEXCOORD0;
            };

            v2f vert(appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                return o;
            }

            // Procedural value noise — no textures, phone-cheap (2 octaves).
            float Hash(float2 p)
            {
                return frac(sin(dot(p, float2(127.1, 311.7))) * 43758.5453);
            }

            float VNoise(float2 p)
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
                return VNoise(p) * 0.65 + VNoise(p * 2.13 + 17.7) * 0.35;
            }

            fixed4 frag(v2f i) : SV_Target
            {
                float2 c = (i.uv - float2(0.5, 0.5)) * 2.0;
                float r = length(c);

                // -------- phase split (one driver, two overlapping windows) --------
                float crackPhase = saturate(_OpenAmount / 0.4);
                float poolPhase = saturate((_OpenAmount - 0.35) / 0.65);

                // -------- phase 1: the floor cracks open --------
                // Thin radial fissures: an INTEGER angular harmonic (no seam at +/-pi)
                // bent by seam-free fbm sampled in centered UV, sharpened to hairlines.
                float ang = atan2(c.y, c.x);
                float wander = (Fbm(c * 4.0 + 7.3) - 0.5) * 2.6;
                float fissure = pow(abs(sin(ang * 4.0 + wander)), 24.0);
                float crackReach = crackPhase * 0.85;
                float crackGrow = 1.0 - smoothstep(crackReach - 0.12, crackReach, r);
                float crack = fissure * crackGrow;

                // -------- phase 2: darkness pools out of the cracks --------
                float2 drift = float2(0.0, _Time.y * _SwirlSpeed);
                float wobble = (Fbm(c * _NoiseScale + drift) - 0.5) * _EdgeNoiseAmount;
                float poolFront = poolPhase * (0.9 + _EdgeNoiseAmount);
                float pool = 1.0 - smoothstep(poolFront - _EdgeSoftness, poolFront, r + wobble);

                // The pool swallows the cracks as it spreads.
                float crackVisible = crack * (1.0 - pool);
                float alpha = saturate(pool + crackVisible);

                // -------- square-edge kill (the raw-quad fix) --------
                // Unconditional: alpha reaches zero before the quad boundary no matter
                // what the noise or params do.
                alpha *= 1.0 - smoothstep(0.82, 0.97, r);

                // -------- color --------
                float density = 0.88 + 0.12 * Fbm(c * (_NoiseScale * 0.6) - drift);
                float emberPulse = 0.75 + 0.25 * sin(_Time.y * 6.3 + r * 9.0);
                float3 col = _PortalColor.rgb * density;
                col = lerp(col, _CrackColor.rgb * emberPulse, crackVisible);

                // Faint violet ember rim riding the pool front.
                float rimIn = smoothstep(poolFront - _EdgeSoftness * 2.0, poolFront - _EdgeSoftness, r + wobble);
                float rimOut = 1.0 - smoothstep(poolFront - _EdgeSoftness, poolFront, r + wobble);
                col = lerp(col, _EdgeColor.rgb, rimIn * rimOut * 0.6 * poolPhase);

                return fixed4(col, alpha * _PortalColor.a);
            }
            ENDCG
        }
    }

    Fallback Off
}
