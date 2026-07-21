// Watcher eyes (Anthony's device-playtest direction, 2026-07-20): "the dark shadow
// glowing eyes appears on the floor and at different places. we need to let them seem
// watched." Eyes-only apparition — no body, no approach, no threat. Just two glowing
// eyes low in the dark that are there, and then aren't.
//
// Pipeline-agnostic plain CG (untagged pass = SRPDefaultUnlit under URP) — the
// stripping-proof path verified on-device; see DarknessPortal.shader's header.
Shader "ShadowDoors/WatcherEyes"
{
    Properties
    {
        _EyeColor ("Eye Glow Color", Color) = (1.0, 0.15, 0.05, 1)
        // 0 = invisible, ~2+ = full menace. Driven per-frame by WatcherEyes.cs.
        _Glow ("Glow", Range(0, 4)) = 0
        _EyeOffsetX ("Eye Horizontal Offset (UV)", Range(0, 0.3)) = 0.13
        _EyeRadius ("Eye Radius (UV)", Range(0.005, 0.12)) = 0.05
        _FlickerSpeed ("Flicker Speed", Range(0, 12)) = 7.0
    }

    SubShader
    {
        Tags
        {
            "RenderType" = "Transparent"
            "Queue" = "Transparent"
            "IgnoreProjector" = "True"
        }

        Blend SrcAlpha One // additive-ish: eyes GLOW out of the dark rather than paint over it.
        ZWrite Off
        Cull Off

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            float4 _EyeColor;
            float _Glow;
            float _EyeOffsetX;
            float _EyeRadius;
            float _FlickerSpeed;

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

            float SoftCircle(float2 uv, float2 center, float radius)
            {
                float dist = distance(uv, center);
                return 1.0 - smoothstep(radius * 0.45, radius, dist);
            }

            fixed4 frag(v2f i) : SV_Target
            {
                float2 eyeL = float2(0.5 - _EyeOffsetX, 0.5);
                float2 eyeR = float2(0.5 + _EyeOffsetX, 0.5);
                float eyes = saturate(SoftCircle(i.uv, eyeL, _EyeRadius) + SoftCircle(i.uv, eyeR, _EyeRadius));

                // Uneasy shimmer — not a blink, a *presence* that isn't quite steady.
                float flicker = 0.85 + 0.15 * sin(_Time.y * _FlickerSpeed + sin(_Time.y * 1.7) * 3.0);

                float glow = _Glow * flicker;
                return fixed4(_EyeColor.rgb * glow, saturate(eyes * glow) * _EyeColor.a);
            }
            ENDCG
        }
    }

    Fallback Off
}
