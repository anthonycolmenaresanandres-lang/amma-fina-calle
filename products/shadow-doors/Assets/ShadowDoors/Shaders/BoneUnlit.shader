// Bone-white unlit — for the skeleton arm's code-built primitive bones (Anthony's
// jump-scare direction, 2026-07-21). Deliberately flat and pale: it reads as bone in
// the corner of the eye, which is where it lives.
//
// Pipeline-agnostic plain CG (untagged pass = SRPDefaultUnlit under URP) — the
// stripping-proof path; see DarknessPortal.shader's header.
Shader "ShadowDoors/BoneUnlit"
{
    Properties
    {
        _Color ("Bone Color", Color) = (0.93, 0.90, 0.82, 1)
        // Subtle top-down shade so the bones don't read as a flat cutout.
        _ShadeAmount ("Shade Amount", Range(0, 1)) = 0.35
    }

    SubShader
    {
        Tags
        {
            "RenderType" = "Opaque"
            "Queue" = "Geometry"
        }

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            float4 _Color;
            float _ShadeAmount;

            struct appdata
            {
                float4 vertex : POSITION;
                float3 normal : NORMAL;
            };

            struct v2f
            {
                float4 pos : SV_POSITION;
                float3 worldNormal : TEXCOORD0;
            };

            v2f vert(appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.worldNormal = UnityObjectToWorldNormal(v.normal);
                return o;
            }

            fixed4 frag(v2f i) : SV_Target
            {
                // Fake single-direction shade (no real lights involved): faces
                // pointing down are darker, giving the bones cheap dimensionality.
                float shade = 1.0 - _ShadeAmount * saturate(-i.worldNormal.y * 0.5 + 0.5);
                return fixed4(_Color.rgb * shade, 1.0);
            }
            ENDCG
        }
    }

    Fallback Off
}
