// The wraith surface (Anthony's Blender-asset ruling, 2026-07-21): the real 3D
// SM_Wraith mesh reads as a shadow — a near-black body with a cold fresnel rim so its
// gaunt silhouette catches the dark, a violet edge that flares with _EyeGlowIntensity,
// and a world-noise dissolve on _Dissolve (banish burn-off). Same property contract
// as ShadowSilhouette (ShadowAgent drives _Dissolve + _EyeGlowIntensity via the
// property block), so ShadowAgent needs no per-shader special-casing.
//
// Plain CG, untagged pass (SRPDefaultUnlit under URP) — the stripping-proof path; see
// DarknessPortal.shader's header.
Shader "ShadowDoors/ShadowWraith"
{
    Properties
    {
        _BodyColor ("Body Color", Color) = (0.015, 0.01, 0.03, 1)
        _RimColor ("Rim Color", Color) = (0.35, 0.10, 0.5, 1)
        _RimPower ("Rim Power", Range(0.5, 6)) = 2.6
        _EyeGlowIntensity ("Eye/Rim Glow Intensity", Range(0, 5)) = 1.0
        _Dissolve ("Dissolve", Range(0, 1)) = 0
        _DissolveEdge ("Dissolve Edge Width", Range(0.01, 0.4)) = 0.12
        _NoiseScale ("Dissolve Noise Scale", Range(1, 20)) = 8.0
    }

    SubShader
    {
        Tags { "RenderType" = "Transparent" "Queue" = "Transparent" "IgnoreProjector" = "True" }
        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        Cull Back

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            float4 _BodyColor;
            float4 _RimColor;
            float _RimPower;
            float _EyeGlowIntensity;
            float _Dissolve;
            float _DissolveEdge;
            float _NoiseScale;

            struct appdata { float4 vertex : POSITION; float3 normal : NORMAL; };
            struct v2f {
                float4 pos : SV_POSITION;
                float3 worldNormal : TEXCOORD0;
                float3 worldPos : TEXCOORD1;
                float3 viewDir : TEXCOORD2;
            };

            v2f vert(appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.worldPos = mul(unity_ObjectToWorld, v.vertex).xyz;
                o.worldNormal = UnityObjectToWorldNormal(v.normal);
                o.viewDir = normalize(_WorldSpaceCameraPos - o.worldPos);
                return o;
            }

            float hash3(float3 p) { return frac(sin(dot(p, float3(27.1, 61.7, 12.4))) * 43758.5); }
            float vnoise(float3 p)
            {
                float3 i = floor(p), f = frac(p);
                f = f * f * (3.0 - 2.0 * f);
                float n = lerp(
                    lerp(lerp(hash3(i + float3(0,0,0)), hash3(i + float3(1,0,0)), f.x),
                         lerp(hash3(i + float3(0,1,0)), hash3(i + float3(1,1,0)), f.x), f.y),
                    lerp(lerp(hash3(i + float3(0,0,1)), hash3(i + float3(1,0,1)), f.x),
                         lerp(hash3(i + float3(0,1,1)), hash3(i + float3(1,1,1)), f.x), f.y), f.z);
                return n;
            }

            fixed4 frag(v2f i) : SV_Target
            {
                float3 n = normalize(i.worldNormal);
                float ndv = saturate(dot(n, normalize(i.viewDir)));
                float rim = pow(1.0 - ndv, _RimPower);

                // Body is near-black; the rim carries a cold violet edge that the eye
                // glow intensity flares (the wraith "lights up" as it lunges).
                float3 col = _BodyColor.rgb + _RimColor.rgb * rim * (0.6 + _EyeGlowIntensity);

                // Dissolve burn-off from world noise (banish). Body alpha is mostly
                // opaque; the rim keeps it visible against the dark room.
                float noise = vnoise(i.worldPos * _NoiseScale);
                float burn = smoothstep(_Dissolve - _DissolveEdge, _Dissolve, noise);
                float bodyAlpha = saturate(0.82 + rim * 0.6);
                float alpha = bodyAlpha * burn;

                // A hot ember line right at the dissolve front.
                float edge = smoothstep(_Dissolve - _DissolveEdge, _Dissolve, noise)
                           * (1.0 - smoothstep(_Dissolve, _Dissolve + _DissolveEdge, noise));
                col += _RimColor.rgb * edge * 2.0 * step(0.001, _Dissolve);

                return fixed4(col, alpha);
            }
            ENDCG
        }
    }

    Fallback Off
}
