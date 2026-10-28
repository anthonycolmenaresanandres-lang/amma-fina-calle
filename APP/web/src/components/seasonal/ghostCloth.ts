// A continuous textured mesh: no sliced images or seams. Head/eyes stay fixed.
export const CLOTH_VERTEX_SHADER = `
attribute vec2 a_uv;
varying vec2 v_uv;
uniform float u_time;
void main() {
  v_uv = a_uv;
  float body = smoothstep(0.28, 0.78, a_uv.y);
  float hem = smoothstep(0.64, 1.0, a_uv.y);
  float ripple = sin(u_time * 4.2 + a_uv.y * 13.0);
  float dx = body * 0.027 * ripple * (0.55 + 0.45 * sin(a_uv.x * 3.14159));
  float side = (1.0 - smoothstep(0.15, 0.6, a_uv.x)) * body;
  float dy = -side * 0.024 * sin(u_time * 2.5)
    + hem * 0.014 * sin(u_time * 5.4 + a_uv.x * 8.0);
  gl_Position = vec4((a_uv.x + dx - 0.5) * 1.78, (0.5 - a_uv.y - dy) * 1.8, 0.0, 1.0);
}`;
const FRAGMENT = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_image;
void main() { gl_FragColor = texture2D(u_image, v_uv); }
`;
export function clothMesh(columns = 16, rows = 32) {
  const points: number[] = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
    const l=x/columns, r=(x+1)/columns, t=y/rows, b=(y+1)/rows;
    points.push(l,t,r,t,l,b,l,b,r,t,r,b);
  }
  return new Float32Array(points);
}
export function clothOffset(u: number, v: number, time: number) {
  const smooth = (a: number,b: number,x: number) => { const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
  const body=smooth(.28,.78,v), hem=smooth(.64,1,v);
  return [
    body*.027*Math.sin(time*4.2+v*13)*(.55+.45*Math.sin(u*Math.PI)),
    -(1-smooth(.15,.6,u))*body*.024*Math.sin(time*2.5)+hem*.014*Math.sin(time*5.4+u*8)
  ];
}
export function createGhostCloth(canvas: HTMLCanvasElement, source: string) {
  let gl: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null, texture: WebGLTexture | null = null;
  let frame=0, frames=0, last=0, until=0, playing=false, disposed=false, ready=false;
  const parent=canvas.parentElement;
  const fallback=() => { if(parent) parent.dataset.cloth="static"; };
  const stop=() => { playing=false; cancelAnimationFrame(frame); canvas.dataset.clothFrames=String(frames); };
  const fail=() => { stop(); fallback(); };
  const render=(now: number) => {
    if(!playing || disposed || !ready || !gl || !program || now>=until) { if(now>=until) stop(); return; }
    if(now-last>=1000/24) {
      last=now;
      gl.uniform1f(gl.getUniformLocation(program,"u_time"),now/1000);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES,0,16*32*6);
      frames++;
    }
    frame=requestAnimationFrame(render);
  };
  const image=new window.Image();
  image.onload=() => {
    if(disposed) return;
    try {
      canvas.width=192; canvas.height=288;
      gl=canvas.getContext("webgl",{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,powerPreference:"low-power"});
      if(!gl) { fail(); return; }
      const compile=(type:number,source:string) => {
        const shader=gl!.createShader(type);
        if(!shader) throw new Error("Cloth shader unavailable");
        gl!.shaderSource(shader,source); gl!.compileShader(shader);
        if(!gl!.getShaderParameter(shader,gl!.COMPILE_STATUS)) { gl!.deleteShader(shader); throw new Error("Cloth shader compile failed"); }
        return shader;
      };
      const vertex=compile(gl.VERTEX_SHADER,CLOTH_VERTEX_SHADER), fragment=compile(gl.FRAGMENT_SHADER,FRAGMENT);
      program=gl.createProgram(); if(!program) throw new Error("Cloth program unavailable");
      gl.attachShader(program,vertex); gl.attachShader(program,fragment); gl.linkProgram(program);
      gl.deleteShader(vertex); gl.deleteShader(fragment);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error("Cloth program link failed");
      gl.useProgram(program); buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,clothMesh(),gl.STATIC_DRAW);
      const attribute=gl.getAttribLocation(program,"a_uv"); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute,2,gl.FLOAT,false,0,0);
      texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.viewport(0,0,canvas.width,canvas.height); gl.clearColor(0,0,0,0);
      ready=true; if(parent) parent.dataset.cloth="ready";
      if(playing) frame=requestAnimationFrame(render);
    } catch { fail(); }
  };
  image.onerror=fail;
  canvas.addEventListener("webglcontextlost",fail);
  image.src=source;
  return {
    start() { stop(); if(disposed) return; frames=0;last=0;until=performance.now()+8000;playing=true;if(ready) frame=requestAnimationFrame(render); },
    stop,
    destroy() {
      stop();disposed=true;image.onload=null;image.onerror=null;
      canvas.removeEventListener("webglcontextlost",fail);
      if(gl) {gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.getExtension("WEBGL_lose_context")?.loseContext();}
    }
  };
}
