import {
  BufferAttribute,
  LinearFilter,
  LinearSRGBColorSpace,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  WebGLRenderer,
} from "three";
import gsap from "gsap";

/**
 * Cloth page transition: the clicked project cover lifts off the page like
 * fabric caught by air, ripples as it grows to fill the screen, then settles
 * perfectly flat so the swap to the project page is seamless.
 *
 * Our own implementation (not domgl): a WebGL sheet whose outline grows from
 * the card's box to the viewport, with depth from a small cloth height field.
 * The height field is a damped wave simulation: every point is pulled towards
 * a billow shape and coupled to its neighbours, so pushes travel across the
 * sheet as ripples instead of moving it rigidly. Points far from the centre
 * trail behind, like the corners of a sheet that is being lifted.
 *
 * Loaded on demand (PageTransition imports it), so three.js never weighs on
 * a page's first load.
 */

/** Grid resolution of the sheet: segments across and down. */
const SEG_X = 40;
const SEG_Y = 30;

/** Seconds for the whole lift. */
const DURATION = 1.3;

/** Cloth constants. Tension spreads ripples, pull follows the billow shape,
 *  damping stops it ringing. */
const TENSION = 900;
const PULL = 70;
const DAMPING = 7;

export type ClothHandle = {
  /** Removes the canvas's GPU resources. The caller removes the element. */
  dispose: () => void;
};

export function supportsCloth(): boolean {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const vertex = /* glsl */ `
  uniform float uProgress;
  uniform float uFlat;
  uniform vec4 uFrom;      // left, top, width, height in CSS px
  uniform vec4 uTo;
  uniform vec2 uViewport;
  attribute float aZ;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    vUv = uv;

    // Corners trail the centre, like a sheet lifted from the middle.
    float d = distance(uv, vec2(0.5));
    float p = clamp((uProgress - d * 0.3) / (1.0 - 0.3 * 0.7072), 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);

    vec4 r = mix(uFrom, uTo, p);
    vec2 px = vec2(r.x + uv.x * r.z, r.y + (1.0 - uv.y) * r.w);
    vec3 pos = vec3(px.x - uViewport.x * 0.5, uViewport.y * 0.5 - px.y, 0.0);

    // Depth from the cloth simulation, forced to zero as the lift ends so
    // the last frame matches the flat full-screen image exactly.
    pos.z = aZ * uFlat;

    vPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uImage;     // natural image size
  uniform vec4 uFrom;
  uniform vec4 uTo;
  uniform float uProgress;
  uniform float uEnv;
  varying vec2 vUv;
  varying vec3 vPos;

  void main() {
    // object-fit: cover, for the sheet's current overall size.
    vec2 size = mix(uFrom.zw, uTo.zw, uProgress);
    float rs = size.x / size.y;
    float ri = uImage.x / uImage.y;
    vec2 scale = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
    vec4 c = texture2D(uMap, (vUv - 0.5) * scale + 0.5);

    // Light the folds: normal from the surface's screen-space slope.
    vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
    float light = dot(n, normalize(vec3(-0.45, 0.6, 1.0)));
    float shade = mix(1.0, 0.72 + 0.36 * light, uEnv);

    gl_FragColor = vec4(c.rgb * shade, 1.0);
  }
`;

/**
 * Plays the lift inside `host` (a fixed, full-screen element) and calls
 * onCovered once the sheet lies flat over the whole screen.
 */
export function playCloth({
  host,
  image,
  from,
  onCovered,
}: {
  host: HTMLElement;
  image: HTMLImageElement;
  from: DOMRect;
  onCovered: () => void;
}): ClothHandle {
  const W = window.innerWidth;
  const H = window.innerHeight;

  const renderer = new WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(W, H);
  renderer.outputColorSpace = LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  Object.assign(renderer.domElement.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
  });
  host.appendChild(renderer.domElement);

  // A camera at the distance where z = 0 maps one unit to one CSS pixel.
  const fov = 30;
  const distance = H / 2 / Math.tan((fov * Math.PI) / 360);
  const camera = new PerspectiveCamera(fov, W / H, 1, distance * 4);
  camera.position.z = distance;

  const texture = new Texture(image);
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  const material = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
      uMap: { value: texture },
      uImage: { value: [image.naturalWidth || 1, image.naturalHeight || 1] },
      uFrom: { value: [from.left, from.top, from.width, from.height] },
      uTo: { value: [0, 0, W, H] },
      uViewport: { value: [W, H] },
      uProgress: { value: 0 },
      uEnv: { value: 0 },
      uFlat: { value: 1 },
    },
  });

  const geometry = new PlaneGeometry(1, 1, SEG_X, SEG_Y);
  const NX = SEG_X + 1;
  const NY = SEG_Y + 1;
  const count = NX * NY;
  const z = new Float32Array(count);
  const vz = new Float32Array(count);
  const zAttr = new BufferAttribute(z, 1);
  geometry.setAttribute("aZ", zAttr);

  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  const scene = new Scene();
  scene.add(mesh);

  // How far towards the viewer the middle of the sheet billows.
  const amp = Math.min(W, H) * 0.22;

  // Per-point distance from the centre, in uv, for the billow shape.
  const dist = new Float32Array(count);
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      dist[j * NX + i] = Math.hypot(i / SEG_X - 0.5, j / SEG_Y - 0.5);
    }
  }

  const state = { p: 0 };
  let time = 0;

  const simulate = (dt: number) => {
    const env = Math.sin(Math.PI * state.p);
    // Two substeps keep the wave stable at low frame rates.
    const steps = 2;
    const h = Math.min(dt, 1 / 30) / steps;
    for (let s = 0; s < steps; s++) {
      time += h;
      for (let j = 0; j < NY; j++) {
        const up = j > 0 ? -NX : 0;
        const down = j < NY - 1 ? NX : 0;
        for (let i = 0; i < NX; i++) {
          const k = j * NX + i;
          const left = i > 0 ? -1 : 0;
          const right = i < NX - 1 ? 1 : 0;
          const lap =
            z[k + left] + z[k + right] + z[k + up] + z[k + down] - 4 * z[k];

          // Billow: domed in the middle, with a gust that drifts across.
          const u = i / SEG_X;
          const v = j / SEG_Y;
          const gust =
            Math.sin(u * 5 + time * 3.1) * Math.cos(v * 4 - time * 2.3);
          const target =
            env * amp * (Math.max(0, 1 - dist[k] * 1.4) + 0.3 * gust);

          vz[k] += h * (TENSION * lap + PULL * (target - z[k]) - DAMPING * vz[k]);
        }
      }
      for (let k = 0; k < count; k++) z[k] += vz[k] * h;
    }
    zAttr.needsUpdate = true;
  };

  const draw = () => {
    const p = state.p;
    material.uniforms.uProgress.value = p;
    material.uniforms.uEnv.value = Math.sin(Math.PI * p);
    // Fade the depth out over the last 20% so it lands perfectly flat.
    material.uniforms.uFlat.value = Math.min(1, (1 - p) * 5);
    renderer.render(scene, camera);
  };

  const tick = (_t: number, deltaMs: number) => {
    simulate(deltaMs / 1000);
    draw();
  };

  draw();
  gsap.ticker.add(tick);

  const tween = gsap.to(state, {
    p: 1,
    duration: DURATION,
    ease: "power2.inOut",
    onComplete: () => {
      gsap.ticker.remove(tick);
      state.p = 1;
      draw();
      onCovered();
    },
  });

  return {
    dispose: () => {
      tween.kill();
      gsap.ticker.remove(tick);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
