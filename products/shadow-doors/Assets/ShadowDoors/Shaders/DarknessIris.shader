// Shadow Doors — fullscreen "consumed" iris: darkness closes from the screen edges to the
// center as _CloseAmount goes 0 -> 1. The edge is given a slight angular wobble so the
// black reads as something ALIVE creeping in, not a clean camera iris.
// Used on a fullscreen uGUI Image by ConsumedFX.cs. UI-transparent-queue unlit shader,
// explicitly classified SRPDefaultUnlit to match the retained Android GLES3 path used
// by the other two device-effect shaders.
Shader "ShadowDoors/DarknessIris"
{
    Properties
    {
        _MainTex ("Sprite (unused, uGUI requirement)", 2D) = "white" {}
        _CloseAmount ("Close Amount", Range(0, 1)) = 0
        _EdgeSoftness ("Edge Softness", Range(0.01, 0.5)) = 0.18
        _WobbleAmplitude ("Edge Wobble", Range(0, 0.1)) = 0.035
        _Color ("Darkness Color", Color) = (0, 0, 0, 1)
    }
    SubShader
    {
        Tags { "Queue"="Overlay" "RenderType"="Transparent" "IgnoreProjector"="True" }
        Cull Off
        ZWrite Off
        ZTest Always
        Blend SrcAlpha OneMinusSrcAlpha

        Pass
        {
            Tags { "LightMode" = "SRPDefaultUnlit" }

            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            sampler2D _MainTex;
            float _CloseAmount;
            float _EdgeSoftness;
            float _WobbleAmplitude;
            fixed4 _Color;

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct v2f
            {
                float4 vertex : SV_POSITION;
                float2 uv : TEXCOORD0;
            };

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                return o;
            }

            fixed4 frag (v2f i) : SV_Target
            {
                // Radial distance from screen center (uv 0.5,0.5), corner-normalized so the
                // iris reaches the corners before fully closing.
                float2 centered = (i.uv - 0.5) * 2.0;
                float radial = length(centered) / 1.41421356; // 0 center .. ~1 corners

                // The creeping edge: slight angular wobble so the boundary is organic.
                float angle = atan2(centered.y, centered.x);
                float wobble = sin(angle * 7.0) * _WobbleAmplitude
                             + sin(angle * 3.0 + 1.7) * _WobbleAmplitude * 0.6;

                // At _CloseAmount=0 the darkness sits entirely outside the screen;
                // at 1 the open radius has shrunk past the center: full black.
                float openRadius = 1.0 + _EdgeSoftness - _CloseAmount * (1.0 + _EdgeSoftness) + wobble;
                float darkness = 1.0 - smoothstep(openRadius - _EdgeSoftness, openRadius, radial);
                darkness = 1.0 - darkness; // invert: outside the open radius = dark

                fixed4 color = _Color;
                color.a = _Color.a * darkness;
                return color;
            }
            ENDCG
        }
    }
    FallBack "UI/Default"
}
