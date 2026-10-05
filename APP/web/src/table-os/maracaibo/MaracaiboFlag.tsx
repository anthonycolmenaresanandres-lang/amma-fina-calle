"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import styles from "./maracaibo.module.css";

function subscribeMotion(change: () => void): () => void {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", change);
  return () => media.removeEventListener("change", change);
}
const canMove = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const staticOnServer = () => false;

const VERTEX = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
`;
const FRAGMENT = `
precision mediump float;
varying vec2 uv;
uniform sampler2D fabric;
uniform float time;
float fold(vec2 p, float strength) {
  float tension = smoothstep(.04, .96, p.x);
  return strength * tension * (.085 * sin(8.4 * p.x + .8 * p.y - 3.1 * time)
    + .021 * p.x * sin(15. * p.x - 1.2 * p.y - 4.8 * time));
}
void main() {
  float strength = sin(3.14159265 * clamp(time / 4.8, 0., 1.));
  // Reserve matching still-image margins for the stronger free-edge folds.
  vec2 clothUV = (uv - vec2(.055)) / .89;
  float tension = smoothstep(.04, .96, clothUV.x);
  float primary = sin(8.4 * clothUV.x + .8 * clothUV.y - 3.1 * time);
  float flutter = sin(15. * clothUV.x - 1.2 * clothUV.y - 4.8 * time);
  vec2 sampleUV = clothUV - strength * tension * vec2(.007 * primary,
    .04 * primary + .009 * clothUV.x * clothUV.x * flutter);
  if (sampleUV.x < 0. || sampleUV.x > 1. || sampleUV.y < 0. || sampleUV.y > 1.) {
    gl_FragColor = vec4(0.); return;
  }
  vec4 color = texture2D(fabric, sampleUV);
  float dx = (fold(clothUV + vec2(.003, 0.), strength) - fold(clothUV - vec2(.003, 0.), strength)) / .006;
  float dy = (fold(clothUV + vec2(0., .003), strength) - fold(clothUV - vec2(0., .003), strength)) / .006;
  vec3 normal = normalize(vec3(-dx, -dy, 1.));
  vec3 light = normalize(vec3(-.55, .4, 1.5));
  float illumination = clamp(1. + .65 * (dot(normal, light) - light.z), .76, 1.13);
  gl_FragColor = vec4(color.rgb * illumination, color.a);
}
`;

/** Existing textured flag, smoothly deformed in one continuous shader surface. */
export function MaracaiboFlag({ prominent = false, decorative = false }: {
  prominent?: boolean;
  decorative?: boolean;
}): React.JSX.Element {
  const moving = useSyncExternalStore(subscribeMotion, canMove, staticOnServer);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const source = `/assets/maracaibo/venezuelan-flag-concept-${prominent ? 960 : 480}.webp`;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !moving) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    let frame = 0;
    let disposed = false;
    const shaders: WebGLShader[] = [];
    const compile = (type: number, code: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, code); gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const program = gl.createProgram();
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    const buffer = gl.createBuffer();
    const texture = gl.createTexture();
    const hide = () => { canvas.dataset.ready = "false"; cancelAnimationFrame(frame); };
    const image = new window.Image();
    if (program && vertex && fragment && buffer && texture) {
      gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
      if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        image.onload = () => {
          if (disposed) return;
          gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
          const position = gl.getAttribLocation(program, "position");
          gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
          gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.uniform1i(gl.getUniformLocation(program, "fabric"), 0);
          const clock = gl.getUniformLocation(program, "time");
          const started = performance.now();
          const draw = (now: number) => {
            if (disposed) return;
            const elapsed = Math.min((now - started) / 1000, 4.8);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform1f(clock, elapsed); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            canvas.dataset.ready = "true";
            if (elapsed < 4.8) frame = requestAnimationFrame(draw);
          };
          frame = requestAnimationFrame(draw);
        };
        image.src = source;
      }
    }
    canvas.addEventListener("webglcontextlost", hide);
    return () => {
      disposed = true; hide(); image.onload = null;
      canvas.removeEventListener("webglcontextlost", hide);
      gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program);
      shaders.forEach(shader => gl.deleteShader(shader));
    };
  }, [moving, source]);
  const width = prominent ? 960 : 480;
  return <span className={styles.flagFabric} data-ripple={moving}
    role={decorative ? undefined : "img"} aria-label={decorative ? undefined : "Venezuelan flag with eight white stars"}
    aria-hidden={decorative ? "true" : undefined}>
    {/* Native image is also the no-WebGL, loading and reduced-motion fallback. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className={styles.flagStill} src={source} width={width} height={width * 2 / 3} alt="" draggable={false} />
    <canvas ref={canvasRef} className={styles.flagCanvas} width={width} height={width * 2 / 3} aria-hidden="true" />
  </span>;
}
