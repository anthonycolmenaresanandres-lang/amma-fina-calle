// The evil veil (Anthony's device-playtest direction, 2026-07-20): "put a filter
// instead of changing the whole lighting, make it seem evil but only when the shadow
// appears." Same doctrine as Escape the Bomb's etb.sky.lightMode=1 ruling: a cheap
// fullscreen screen-space filter beats touching scene lighting — one quad, zero
// per-light cost, phone-friendly.
//
// A uGUI overlay shader (fullscreen Image): blood-red vignette that creeps in from
// the screen edges, center stays mostly clear so the room remains readable. Driven by
// _Intensity (0 = absent, 1 = full menace) from EvilVeil.cs, which ramps it in fast
// when a shadow is out and drains it slowly when the room is clear.
//
// Plain CG, untagged pass (SRPDefaultUnlit under URP) — the stripping-proof path; see
// DarknessPortal.shader's header for the on-device rationale.
Shader "ShadowDoors/EvilVeil"
{
    Properties
    {
        // 0 = no veil, 1 = full presence. Driven per-frame by EvilVeil.cs.
        _Intensity ("Intensity", Range(0, 1)) = 0

        _VeilColor ("Veil Color", Color) = (0.55, 0.03, 0.03, 1)
        _VignettePower ("Vignette Power", Range(0.5, 6)) = 2.2
        _CenterBleed ("Center Bleed", Range(0, 0.4)) = 0.16
        _PulseSpeed ("Pulse Speed", Range(0, 6)) = 2.4
    }

    SubShader
    {
        Tags
        {
            "RenderType" = "Transparent"
            "Queue" = "Overlay"
            "IgnoreProjector" = "True"
        }

        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        ZTest Always
        Cull Off

        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "UnityCG.cginc"

            float _Intensity;
            float4 _VeilColor;
            float _VignettePower;
            float _CenterBleed;
            float _PulseSpeed;

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
                // Corner-normalized radial so the vignette reaches full strength in
                // the corners, not just at edge midpoints.
                float2 centered = (i.uv - float2(0.5, 0.5)) * 2.0;
                float r = saturate(length(centered) / 1.41421356);

                float vignette = pow(r, _VignettePower);

                // A slow uneasy breath, not a strobe.
                float pulse = 0.92 + 0.08 * sin(_Time.y * _PulseSpeed);

                float alpha = _Intensity * pulse * saturate(vignette + _CenterBleed);
                return fixed4(_VeilColor.rgb, alpha * _VeilColor.a);
            }
            ENDCG
        }
    }

    Fallback "UI/Default"
}
