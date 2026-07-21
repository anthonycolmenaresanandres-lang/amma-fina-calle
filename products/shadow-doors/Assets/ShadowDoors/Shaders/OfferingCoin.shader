// The offering coins (Anthony's hook ruling, take 2, 2026-07-21): the first thing the
// player does is play a GAME — glowing coins on the floor, begging to be collected.
// They belong to the entity. Taking them is what starts the night.
//
// Flat gold glow-disc for a floor-lying quad: soft radial core, brighter ring rim,
// slow shimmer. Driven by _Glow (OfferingCoin.cs pulses it; Collect/Sink fade it).
//
// Pipeline-agnostic plain CG (untagged pass = SRPDefaultUnlit under URP) — the
// stripping-proof path; see DarknessPortal.shader's header.
Shader "ShadowDoors/OfferingCoin"
{
    Properties
    {
        _CoinColor ("Coin Color", Color) = (1.0, 0.78, 0.25, 1)
        _Glow ("Glow", Range(0, 3)) = 1
        _RingRadius ("Ring Radius (UV)", Range(0.1, 0.5)) = 0.34
        _ShimmerSpeed ("Shimmer Speed", Range(0, 8)) = 3.0
    }

    SubShader
    {
        Tags
        {
            "RenderType" = "Transparent"
            "Queue" = "Transparent"
            "IgnoreProjector" = "True"
        }

        Blend SrcAlpha One // additive: it GLOWS against the dark floor.
        ZWrite Off
        Cull Off

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            float4 _CoinColor;
            float _Glow;
            float _RingRadius;
            float _ShimmerSpeed;

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

            fixed4 frag(v2f i) : SV_Target
            {
                float2 c = i.uv - float2(0.5, 0.5);
                float r = length(c) * 2.0;

                // Soft gold core + a brighter ring at the coin's edge.
                float core = 1.0 - smoothstep(0.0, 0.75, r);
                float ring = smoothstep(_RingRadius - 0.08, _RingRadius, r)
                           * (1.0 - smoothstep(_RingRadius, _RingRadius + 0.10, r));

                // Slow inviting shimmer — treasure, not warning light.
                float shimmer = 0.85 + 0.15 * sin(_Time.y * _ShimmerSpeed + (c.x + c.y) * 6.0);

                float alpha = saturate(core * 0.55 + ring * 0.9) * _Glow * shimmer;
                return fixed4(_CoinColor.rgb * _Glow * shimmer, alpha * _CoinColor.a);
            }
            ENDCG
        }
    }

    Fallback Off
}
