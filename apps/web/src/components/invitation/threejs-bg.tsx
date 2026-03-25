'use client';

/**
 * ThreeJSBackground — Premium GPU-accelerated particle background for Ethereal Bloom.
 *
 * Dreamy bioluminescent fantasy night garden:
 * - Rich purple, magenta, pink, gold, cyan glowing orbs with bloom halos
 * - Soft diagonal light-ray beams cutting through mist
 * - Dense layered fog with animated FBM noise
 * - Multi-layered particles (far/mid/near) with parallax on scroll
 * - Organic wobble + breathing pulse
 *
 * ARCHITECTURE (mirrors working AnimatedBackground pattern):
 * - Cover mode:   fixed overlay z-[51] ABOVE the CoverScreen (z-50), pointer-events-none
 * - Content mode:  sticky wrapper height:0, canvas sized from .invitation-content scroll container
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════ */
interface ThreeJSBackgroundProps {
  mode: 'cover' | 'content';
}

interface ParticleData {
  baseX: number;
  baseY: number;
  speedX: number;
  speedY: number;
  size: number;
  opacity: number;
  phase: number;
  wobbleAmp: number;
  wobbleSpeed: number;
  colorIdx: number;
  layer: number;        // 0 = far (dim), 1 = mid, 2 = near (bright)
  pulseSpeed: number;
}

/* ═══════════════════════════════════════════════════════════════════════
   Rich Fantasy Colour Palette
   ═══════════════════════════════════════════════════════════════════════ */
const COLORS = [
  new THREE.Color(0xc084fc), // vivid purple
  new THREE.Color(0xe879a8), // magenta-pink
  new THREE.Color(0xfbbf24), // warm amber gold
  new THREE.Color(0xa78bfa), // soft lavender
  new THREE.Color(0xf472b6), // hot pink
  new THREE.Color(0x67e8f9), // cyan spark
  new THREE.Color(0xe0dce8), // soft white-lilac
  new THREE.Color(0xd4a0a0), // rose-gold
];

/* ═══════════════════════════════════════════════════════════════════════
   GLSL Shaders
   ═══════════════════════════════════════════════════════════════════════ */

// Particle vertex — passes per-particle attributes to fragment
const particleVS = /* glsl */ `
  attribute float aSize;
  attribute float aOpacity;
  attribute vec3  aColor;
  attribute float aLayer;
  varying float vOpacity;
  varying vec3  vColor;
  varying float vLayer;

  void main() {
    vOpacity = aOpacity;
    vColor   = aColor;
    vLayer   = aLayer;
    vec4 mv  = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`;

// Particle fragment — multi-ring glow with bloom halo
const particleFS = /* glsl */ `
  varying float vOpacity;
  varying vec3  vColor;
  varying float vLayer;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    float core       = exp(-d * 14.0);
    float innerGlow  = exp(-d *  5.0) * 0.6;
    float outerBloom = exp(-d *  2.2) * 0.25;
    float ring       = smoothstep(0.48, 0.30, d) * 0.1;

    float alpha = (core + innerGlow + outerBloom + ring) * vOpacity;
    alpha *= (0.7 + vLayer * 0.3);           // near-layer brighter

    vec3 col = mix(vColor, vec3(1.0), core * 0.4);  // white-hot core
    gl_FragColor = vec4(col, alpha);
  }
`;

// Light-ray vertex
const rayVS = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Light-ray fragment — 4 diagonal beams from top
const rayFS = /* glsl */ `
  uniform float uTime;
  varying vec2  vUv;

  void main() {
    float r1 = smoothstep(0.020, 0.0, abs(vUv.x - 0.25 + sin(uTime * 0.12        ) * 0.06 - vUv.y * 0.30));
    float r2 = smoothstep(0.035, 0.0, abs(vUv.x - 0.60 + sin(uTime * 0.08 + 1.5  ) * 0.08 - vUv.y * 0.25));
    float r3 = smoothstep(0.020, 0.0, abs(vUv.x - 0.80 + sin(uTime * 0.15 + 3.0  ) * 0.04 - vUv.y * 0.35));
    float r4 = smoothstep(0.015, 0.0, abs(vUv.x - 0.45 + sin(uTime * 0.10 + 4.5  ) * 0.05 - vUv.y * 0.20));

    float rays    = r1 + r2 + r3 + r4;
    float topFade = smoothstep(1.0, 0.2, vUv.y);
    rays *= topFade;

    vec3 col = mix(vec3(0.55, 0.35, 0.75), vec3(0.85, 0.45, 0.65), vUv.x);
    gl_FragColor = vec4(col, rays * 0.35);
  }
`;

// Mist vertex
const mistVS = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Mist fragment — multi-octave FBM noise fog
const mistFS = /* glsl */ `
  uniform float uTime;
  varying vec2  vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float n1 = fbm(uv * 3.0 + uTime * 0.06);
    float n2 = fbm(uv * 5.0 - uTime * 0.04 + 10.0);
    float n3 = fbm(uv * 2.0 + vec2(uTime * 0.03, -uTime * 0.02));

    float fog = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    float bottomBias = smoothstep(0.0, 0.6, 1.0 - uv.y);
    float edgeFade   = smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x)
                     * smoothstep(0.0, 0.08, uv.y) * smoothstep(1.0, 0.85, uv.y);

    float alpha = fog * (0.4 + bottomBias * 0.4) * edgeFade * 0.55;

    vec3 c1 = vec3(0.14, 0.08, 0.22);
    vec3 c2 = vec3(0.22, 0.12, 0.28);
    vec3 c3 = vec3(0.10, 0.10, 0.18);
    vec3 col = mix(mix(c1, c2, n1), c3, n3 * 0.5);

    gl_FragColor = vec4(col, alpha);
  }
`;

/* ═══════════════════════════════════════════════════════════════════════
   Particle counts
   ═══════════════════════════════════════════════════════════════════════ */
const FAR_COUNT  = 60;
const MID_COUNT  = 50;
const NEAR_COUNT = 30;
const TOTAL      = FAR_COUNT + MID_COUNT + NEAR_COUNT;

/* ═══════════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════════ */
export default function ThreeJSBackground({ mode }: ThreeJSBackgroundProps) {
  // We attach the Three.js renderer canvas into this wrapper div
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef    = useRef<number>(0);
  const scrollRef   = useRef({ lastY: 0, velocity: 0 });
  const timeRef     = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  // ─── Reduced motion detection ──────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // ─── Create 3-layer particle data ─────────────────────────────────
  const makeParticles = useCallback((w: number, h: number): ParticleData[] => {
    const out: ParticleData[] = [];
    const addLayer = (count: number, layer: number) => {
      const sMin = layer === 0 ? 2 : layer === 1 ? 5  : 12;
      const sMax = layer === 0 ? 6 : layer === 1 ? 14 : 28;
      const oMin = layer === 0 ? 0.06 : layer === 1 ? 0.12 : 0.18;
      const oMax = layer === 0 ? 0.18 : layer === 1 ? 0.32 : 0.50;
      const spd  = layer === 0 ? 0.3  : layer === 1 ? 0.6  : 1.0;
      for (let i = 0; i < count; i++) {
        out.push({
          baseX:      (Math.random() - 0.5) * w,
          baseY:      (Math.random() - 0.5) * h,
          speedX:     (Math.random() - 0.5) * 0.1 * spd,
          speedY:     (Math.random() * 0.1 + 0.02) * spd,
          size:       Math.random() * (sMax - sMin) + sMin,
          opacity:    Math.random() * (oMax - oMin) + oMin,
          phase:      Math.random() * Math.PI * 2,
          wobbleAmp:  (Math.random() * 12 + 3) * (layer === 2 ? 1.5 : 1),
          wobbleSpeed: Math.random() * 0.6 + 0.2,
          colorIdx:   Math.floor(Math.random() * COLORS.length),
          layer,
          pulseSpeed: Math.random() * 1.5 + 0.5,
        });
      }
    };
    addLayer(FAR_COUNT, 0);
    addLayer(MID_COUNT, 1);
    addLayer(NEAR_COUNT, 2);
    return out;
  }, []);

  // ─── Scroll tracking ──────────────────────────────────────────────
  useEffect(() => {
    if (reducedMotion || !wrapperRef.current) return;
    const sc = wrapperRef.current.closest('.invitation-content')
            || wrapperRef.current.closest('.invitation-root');
    if (!sc) return;
    const onScroll = () => {
      const y = sc.scrollTop;
      scrollRef.current.velocity = (y - scrollRef.current.lastY) * 0.5;
      scrollRef.current.lastY = y;
    };
    sc.addEventListener('scroll', onScroll, { passive: true });
    return () => sc.removeEventListener('scroll', onScroll);
  }, [reducedMotion]);

  // ─── Main Three.js lifecycle ───────────────────────────────────────
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || reducedMotion) return;

    /* ── Dimension helpers ────────────────────────────────────────── */
    // KEY FIX: For content mode the wrapper has height:0, so we must
    // measure from .invitation-content (the actual scroll viewport),
    // exactly like AnimatedBackground does with its <canvas>.
    const scrollContainer =
      wrapper.closest('.invitation-content') || wrapper.closest('.invitation-root');

    const measure = (): { w: number; h: number } => {
      if (mode === 'cover') {
        // Cover: wrapper is absolute inset-0, has real dimensions from parent
        return { w: wrapper.clientWidth, h: wrapper.clientHeight };
      }
      // Content: get size from scroll container
      const w = scrollContainer?.clientWidth  || window.innerWidth;
      const h = scrollContainer?.clientHeight || window.innerHeight;
      return { w, h };
    };

    let { w, h } = measure();
    if (w === 0 || h === 0) return; // safety

    /* ── Renderer ─────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.style.pointerEvents = 'none';
    canvas.style.display = 'block';

    if (mode === 'cover') {
      canvas.style.width  = '100%';
      canvas.style.height = '100%';
    } else {
      canvas.style.width  = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    wrapper.appendChild(canvas);
    rendererRef.current = renderer;

    /* ── Scene + Camera ───────────────────────────────────────────── */
    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 100);
    cam.position.z = 10;

    /* ── Particles ────────────────────────────────────────────────── */
    const particles = makeParticles(w, h);
    const geo = new THREE.BufferGeometry();

    const pos  = new Float32Array(TOTAL * 3);
    const sz   = new Float32Array(TOTAL);
    const opac = new Float32Array(TOTAL);
    const col  = new Float32Array(TOTAL * 3);
    const lay  = new Float32Array(TOTAL);

    particles.forEach((p, i) => {
      pos[i * 3]     = p.baseX;
      pos[i * 3 + 1] = p.baseY;
      pos[i * 3 + 2] = 0;
      sz[i]   = p.size;
      opac[i] = p.opacity;
      lay[i]  = p.layer / 2;
      const c = COLORS[p.colorIdx];
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    });

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sz, 1));
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opac, 1));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aLayer',   new THREE.BufferAttribute(lay, 1));

    const pMat = new THREE.ShaderMaterial({
      vertexShader: particleVS,
      fragmentShader: particleFS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const pts = new THREE.Points(geo, pMat);
    pts.position.z = 2;
    scene.add(pts);

    /* ── Mist ─────────────────────────────────────────────────────── */
    const mistGeo = new THREE.PlaneGeometry(w, h);
    const mistMat = new THREE.ShaderMaterial({
      vertexShader: mistVS,
      fragmentShader: mistFS,
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
    });
    const mist = new THREE.Mesh(mistGeo, mistMat);
    mist.position.z = -1;
    scene.add(mist);

    /* ── Light Rays ───────────────────────────────────────────────── */
    const rayGeo = new THREE.PlaneGeometry(w, h);
    const rayMat = new THREE.ShaderMaterial({
      vertexShader: rayVS,
      fragmentShader: rayFS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
    });
    const rays = new THREE.Mesh(rayGeo, rayMat);
    rays.position.z = 0;
    scene.add(rays);

    /* ── Animation loop ───────────────────────────────────────────── */
    let running = true;
    const animate = () => {
      if (!running) return;
      frameRef.current = requestAnimationFrame(animate);
      timeRef.current += 0.016;
      const t = timeRef.current;

      const pA = geo.getAttribute('position') as THREE.BufferAttribute;
      const oA = geo.getAttribute('aOpacity') as THREE.BufferAttribute;
      const sA = geo.getAttribute('aSize')    as THREE.BufferAttribute;

      scrollRef.current.velocity *= 0.92;
      const sv = scrollRef.current.velocity * 0.5;

      particles.forEach((p, i) => {
        p.baseY += p.speedY;
        p.baseX += p.speedX;

        const hH = h / 2 + 50;
        const hW = w / 2 + 50;
        if (p.baseY >  hH) { p.baseY = -hH; p.baseX = (Math.random() - 0.5) * w; }
        if (p.baseX >  hW) p.baseX = -hW;
        if (p.baseX < -hW) p.baseX =  hW;

        const wb1 = Math.sin(t * p.wobbleSpeed + p.phase) * p.wobbleAmp;
        const wb2 = Math.sin(t * p.wobbleSpeed * 0.6 + p.phase * 1.7) * p.wobbleAmp * 0.3;
        const px  = sv * (0.3 + p.layer * 0.5);

        pA.setXY(i, p.baseX + wb1 + wb2 - px, p.baseY + Math.sin(t * 0.3 + p.phase) * 2);

        const pulse = Math.sin(t * p.pulseSpeed + p.phase) * 0.15;
        oA.setX(i, Math.max(0.03, p.opacity + pulse));

        if (p.layer === 2) {
          const sp = Math.sin(t * p.pulseSpeed * 0.8 + p.phase) * 3;
          sA.setX(i, Math.max(6, p.size + sp));
        }
      });

      pA.needsUpdate = true;
      oA.needsUpdate = true;
      sA.needsUpdate = true;

      mistMat.uniforms.uTime.value = t;
      rayMat.uniforms.uTime.value  = t;

      renderer.render(scene, cam);
    };
    animate();

    /* ── Resize ───────────────────────────────────────────────────── */
    const onResize = () => {
      const { w: nw, h: nh } = measure();
      if (nw === 0 || nh === 0) return;
      w = nw; h = nh;
      renderer.setSize(w, h);
      if (mode === 'content') {
        canvas.style.width  = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      cam.left = -w / 2; cam.right = w / 2;
      cam.top  =  h / 2; cam.bottom = -h / 2;
      cam.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    /* ── Cleanup ──────────────────────────────────────────────────── */
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      geo.dispose(); pMat.dispose();
      mistGeo.dispose(); mistMat.dispose();
      rayGeo.dispose(); rayMat.dispose();
      renderer.dispose();
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
    };
  }, [reducedMotion, mode, makeParticles]);

  /* ═══════════════════════════════════════════════════════════════════
     Render
     ═══════════════════════════════════════════════════════════════════ */

  const fallbackBg =
    'radial-gradient(ellipse at 40% 30%, rgba(192,132,252,0.1) 0%, transparent 50%), ' +
    'radial-gradient(ellipse at 60% 70%, rgba(232,121,168,0.08) 0%, transparent 50%)';

  // ── Reduced-motion fallback ─────────────────────────────────────
  if (reducedMotion) {
    if (mode === 'cover') {
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 51, background: fallbackBg }}
          aria-hidden="true"
        />
      );
    }
    return (
      <div
        className="sticky top-0 w-full pointer-events-none"
        style={{ zIndex: 0, height: 0, overflow: 'visible' }}
        aria-hidden="true"
      >
        <div style={{ width: '100%', height: '100vh', background: fallbackBg }} />
      </div>
    );
  }

  // ── Cover mode ──────────────────────────────────────────────────
  // Use `absolute inset-0 z-[51]` so particles render ABOVE the
  // CoverScreen (which is absolute/fixed z-50). pointer-events-none
  // lets clicks pass through to the cover's Open button.
  // NOTE: absolute (not fixed) so it stays within the phone frame.
  if (mode === 'cover') {
    return (
      <div
        ref={wrapperRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 51 }}
        aria-hidden="true"
      />
    );
  }

  // ── Content mode ────────────────────────────────────────────────
  // FIXED: height:0 wrapper (takes no layout space), but Three.js
  // measures from .invitation-content, so the renderer canvas gets
  // real dimensions. Exactly like AnimatedBackground.
  return (
    <div
      ref={wrapperRef}
      className="sticky top-0 w-full pointer-events-none"
      style={{ zIndex: 0, height: 0, overflow: 'visible' }}
      aria-hidden="true"
    />
  );
}
