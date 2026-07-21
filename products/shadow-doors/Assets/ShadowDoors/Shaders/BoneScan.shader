// The Bone Scan (Anthony's direction, 2026-07-21): "put my hand on the screen and it
// sees my bones" — the entity looks THROUGH you. A fullscreen uGUI X-ray overlay: the
// player raises a hand into frame, and a glowing skeletal hand is revealed by a scan
// line sweeping up the screen, over the live camera feed beneath.
//
// The hand skeleton is drawn procedurally (2D capsule SDFs — metacarpals + phalanges +
// thumb + wrist) so there are zero art assets. _Scan (0..1) sweeps the reveal band up;
// _Reveal (0..1) is the overall opacity envelope (fade in / hold / fade out). Driven
// by BoneScanner.cs.
//
// Plain CG, untagged pass (SRPDefaultUnlit under URP) — the stripping-proof path; see
// DarknessPortal.shader's header.
Shader "ShadowDoors/BoneScan"
{
    Properties
    {
        _Scan ("Scan Sweep", Range(0, 1)) = 0
        _Reveal ("Reveal", Range(0, 1)) = 0
        _BoneColor ("Bone Color", Color) = (0.75, 0.95, 1.0, 1)
        _ScanColor ("Scan Line Color", Color) = (0.55, 0.9, 1.0, 1)
        _Darken ("X-ray Darken", Range(0, 1)) = 0.72
    }

    SubShader
    {
        Tags { "RenderType" = "Transparent" "Queue" = "Overlay" "IgnoreProjector" = "True" }
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

            float _Scan;
            float _Reveal;
            float4 _BoneColor;
            float4 _ScanColor;
            float _Darken;

            struct appdata { float4 vertex : POSITION; float2 uv : TEXCOORD0; };
            struct v2f { float4 pos : SV_POSITION; float2 uv : TEXCOORD0; };

            v2f vert(appdata v)
            {
                v2f o;
                o.pos = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                return o;
            }

            // 2D capsule (segment) distance.
            float sdSeg(float2 p, float2 a, float2 b)
            {
                float2 pa = p - a, ba = b - a;
                float h = saturate(dot(pa, ba) / dot(ba, ba));
                return length(pa - ba * h);
            }

            // Signed field of the whole hand skeleton, in a centered aspect-corrected
            // space where the hand stands upright (fingers pointing +y). Returns the
            // nearest-bone distance (small = on a bone).
            float handBones(float2 p)
            {
                float d = 1e9;

                // Wrist anchor and the four knuckle roots (metacarpals fan out).
                float2 wrist = float2(0.0, -0.55);
                float2 knuck[4];
                knuck[0] = float2(-0.26, 0.02);
                knuck[1] = float2(-0.09, 0.08);
                knuck[2] = float2( 0.09, 0.08);
                knuck[3] = float2( 0.26, 0.02);

                // Finger lengths (index..pinky): middle longest, pinky shortest.
                float len[4];
                len[0] = 0.30; len[1] = 0.40; len[2] = 0.36; len[3] = 0.26;
                // Slight outward fan of the fingertips.
                float fan[4];
                fan[0] = -0.12; fan[1] = -0.03; fan[2] = 0.05; fan[3] = 0.15;

                for (int i = 0; i < 4; i++)
                {
                    float2 k = knuck[i];
                    d = min(d, sdSeg(p, wrist, k));                 // metacarpal
                    float2 mid = k + float2(fan[i] * 0.5, len[i] * 0.55);
                    float2 tip = k + float2(fan[i], len[i]);
                    d = min(d, sdSeg(p, k, mid));                   // proximal phalanx
                    d = min(d, sdSeg(p, mid, tip));                 // distal phalanx
                }

                // Thumb: off the lower-left, angled out.
                float2 tBase = float2(-0.30, -0.28);
                float2 tMid  = float2(-0.44, -0.06);
                float2 tTip  = float2(-0.52, 0.10);
                d = min(d, sdSeg(p, wrist, tBase));
                d = min(d, sdSeg(p, tBase, tMid));
                d = min(d, sdSeg(p, tMid, tTip));

                // A couple of carpal bones at the wrist for bulk.
                d = min(d, sdSeg(p, wrist, wrist + float2(-0.06, -0.10)));
                d = min(d, sdSeg(p, wrist, wrist + float2( 0.06, -0.10)));

                return d;
            }

            float hash(float2 p) { return frac(sin(dot(p, float2(41.3, 289.1))) * 43758.5); }

            fixed4 frag(v2f i) : SV_Target
            {
                // Aspect-correct so the hand isn't stretched; center it a touch high.
                float aspect = _ScreenParams.x / max(1.0, _ScreenParams.y);
                float2 p = (i.uv - float2(0.5, 0.46));
                p.x *= aspect;
                p /= 0.55; // overall hand scale

                float d = handBones(p);

                // Bone core + soft X-ray glow halo.
                float core = 1.0 - smoothstep(0.010, 0.028, d);
                float glow = 1.0 - smoothstep(0.028, 0.10, d);

                // The scan band: a bright line sweeping up; bones only reveal once the
                // sweep has passed over them (below the line).
                float scanY = lerp(-0.9, 1.1, _Scan);
                float revealed = smoothstep(scanY + 0.06, scanY - 0.02, p.y); // 1 below the line
                float scanLine = (1.0 - smoothstep(0.0, 0.05, abs(p.y - scanY)));

                // X-ray grain.
                float grain = (hash(i.uv * _ScreenParams.xy * 0.5 + _Scan) - 0.5) * 0.10;

                float boneAmt = (core + glow * 0.5) * revealed;
                float3 col = _BoneColor.rgb * (core + glow * 0.6) + _ScanColor.rgb * scanLine;
                col += grain;

                // Alpha: a faint full-screen X-ray darken (so the room reads as
                // "inside the scan"), the bones on top of it, plus the scan line.
                float filmAlpha = _Darken * 0.5 * _Reveal;
                float alpha = saturate(filmAlpha + boneAmt + scanLine * 0.7) * _Reveal;
                return fixed4(col, alpha);
            }
            ENDCG
        }
    }

    Fallback "UI/Default"
}
