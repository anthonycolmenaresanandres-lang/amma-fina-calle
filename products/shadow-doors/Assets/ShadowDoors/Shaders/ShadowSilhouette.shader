// ⚠ VERIFY (whole file): written as text against the general URP Unlit-shader pattern
// (Core.hlsl include, "UniversalForward" LightMode, "UniversalRenderPipeline" tag) that
// has been broadly stable across URP 12–17, but this was never run through Unity's
// shader compiler. Confirm on the Unity 6000.3.19f1 + URP 17.0.4 machine before relying
// on it — likely trouble spots are called out inline below.
Shader "ShadowDoors/ShadowSilhouette"
{
    Properties
    {
        // Soft-edge silhouette falloff, as fraction of the quad's UV radius (0..~0.7).
        _InnerRadius ("Inner Radius (solid black core)", Range(0, 1)) = 0.25
        _OuterRadius ("Outer Radius (fully transparent)", Range(0, 1)) = 0.48

        _SilhouetteColor ("Silhouette Color", Color) = (0, 0, 0, 1)

        _EyeGlowColor ("Eye Glow Color", Color) = (1.0, 0.15, 0.05, 1)
        _EyeOffsetX ("Eye Horizontal Offset (UV)", Range(0, 0.3)) = 0.11
        _EyeOffsetY ("Eye Vertical Offset (UV)", Range(0, 0.3)) = 0.06
        _EyeRadius ("Eye Radius (UV)", Range(0.005, 0.1)) = 0.035
        _EyeGlowIntensity ("Eye Glow Intensity", Range(0, 5)) = 1.5

        // 0 = fully solid, 1 = fully dissolved. Driven at runtime by ShadowAgent's
        // Banishing state via MaterialPropertyBlock (see ShadowAgent.TickBanishing).
        _Dissolve ("Dissolve", Range(0, 1)) = 0
        _DissolveEdgeSoftness ("Dissolve Edge Softness", Range(0.01, 0.5)) = 0.15
    }

    SubShader
    {
        // ⚠ VERIFY: "RenderPipeline"="UniversalRenderPipeline" is the standard URP tag
        // that keeps this SubShader from being picked up under the Built-in pipeline;
        // confirm the project's URP asset is actually assigned as the active RP so
        // this SubShader is the one selected at all.
        Tags
        {
            "RenderType" = "Transparent"
            "Queue" = "Transparent"
            "RenderPipeline" = "UniversalRenderPipeline"
            "IgnoreProjector" = "True"
        }

        Blend SrcAlpha OneMinusSrcAlpha
        ZWrite Off
        Cull Off // billboard quad is always camera-facing, but Off avoids any backface surprises from ShadowAgent's LookRotation.

        Pass
        {
            Name "ForwardUnlit"
            // ⚠ VERIFY: "UniversalForward" is the conventional LightMode for a
            // URP unlit forward pass, but some URP versions/samples instead use
            // "UniversalForwardOnly" or omit LightMode and rely on
            // "SRPDefaultUnlit". If this pass doesn't render in URP 17.0.4, try
            // "UniversalForwardOnly" first.
            Tags { "LightMode" = "UniversalForward" }

            HLSLPROGRAM
            #pragma vertex Vert
            #pragma fragment Frag

            // ⚠ VERIFY: include path assumes the package is resolved as
            // com.unity.render-pipelines.universal at whatever version manifest.json
            // pins (17.0.4 here) — Core.hlsl's own location has been stable across
            // URP 12-17 but double-check against the installed package's ShaderLibrary
            // folder on the Unity machine.
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
                float _InnerRadius;
                float _OuterRadius;
                float4 _SilhouetteColor;
                float4 _EyeGlowColor;
                float _EyeOffsetX;
                float _EyeOffsetY;
                float _EyeRadius;
                float _EyeGlowIntensity;
                float _Dissolve;
                float _DissolveEdgeSoftness;
            CBUFFER_END

            Varyings Vert(Attributes input)
            {
                Varyings output;
                // ⚠ VERIFY: TransformObjectToHClip is the URP macro for object-space
                // -> clip-space in Core.hlsl; correct across URP 12-17 to my knowledge,
                // but confirm it resolves given the actual include chain above.
                output.positionHCS = TransformObjectToHClip(input.positionOS.xyz);
                output.uv = input.uv;
                return output;
            }

            // Returns alpha coverage for a soft-edged circular mask centered at `center`
            // (UV space) with the given inner (fully opaque) / outer (fully
            // transparent) radii.
            float SoftCircleMask(float2 uv, float2 center, float innerR, float outerR)
            {
                float dist = distance(uv, center);
                return 1.0 - smoothstep(innerR, outerR, dist);
            }

            half4 Frag(Varyings input) : SV_Target
            {
                float2 centeredUV = input.uv - float2(0.5, 0.5);
                float radial = length(centeredUV);

                // Soft-edged black silhouette: opaque inside _InnerRadius, fading to
                // zero alpha by _OuterRadius.
                float silhouetteAlpha = 1.0 - smoothstep(_InnerRadius, _OuterRadius, radial);

                // Two glowing eyes via procedural UV ellipses — no textures. Symmetric
                // about center, slightly above the quad's vertical midpoint.
                float2 eyeCenterL = float2(0.5 - _EyeOffsetX, 0.5 + _EyeOffsetY);
                float2 eyeCenterR = float2(0.5 + _EyeOffsetX, 0.5 + _EyeOffsetY);
                float eyeL = SoftCircleMask(input.uv, eyeCenterL, _EyeRadius * 0.5, _EyeRadius);
                float eyeR = SoftCircleMask(input.uv, eyeCenterR, _EyeRadius * 0.5, _EyeRadius);
                float eyeMask = saturate(eyeL + eyeR);

                // Dissolve: noise-free, smoothstep on the radial coordinate — as
                // _Dissolve rises 0->1, the disc "burns" from the outer edge inward,
                // matching a burn-off read rather than a wipe.
                float dissolveEdge = lerp(_OuterRadius, -_DissolveEdgeSoftness, _Dissolve);
                float dissolveMask = smoothstep(dissolveEdge, dissolveEdge + _DissolveEdgeSoftness, radial);
                float dissolveAlpha = 1.0 - dissolveMask;

                float3 color = lerp(_SilhouetteColor.rgb, _EyeGlowColor.rgb * _EyeGlowIntensity, eyeMask);
                float alpha = silhouetteAlpha * dissolveAlpha * _SilhouetteColor.a;

                return half4(color, alpha);
            }
            ENDHLSL
        }
    }

    // ⚠ VERIFY: no Fallback declared — URP shaders conventionally either omit Fallback
    // or point at "Hidden/Universal Render Pipeline/FallbackError"; confirm which is
    // expected by the project's shader-stripping/build settings.
    Fallback Off
}
