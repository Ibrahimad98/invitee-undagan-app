'use client';

/**
 * AnimatedBackground — Premium scroll-reactive particle backgrounds.
 *
 * ARCHITECTURE:
 * - Rendered as the FIRST CHILD inside <main class="invitation-content"> (the scroll container)
 * - Uses `position: sticky; top: 0` so the canvas stays viewport-fixed while content scrolls over it
 * - Listens to scroll events on .invitation-content to create parallax/reactive effects
 * - Canvas height = 100% of the viewport (one screen), particles rendered continuously
 *
 * ENCHANTED GARDEN: 60 drifting petals/leaves with scroll-parallax (scroll shifts wind direction)
 * ROYAL BLOSSOM: 70 bright golden bokeh + sparkle bursts + shimmer sweeps (high visibility)
 * CELESTIAL GARDEN: 65 fireflies/spores with bioluminescent glow, light rays, drifting mist
 */

import { useEffect, useRef, useCallback, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────
interface Petal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  baseSpeedX: number;
  baseSpeedY: number;
  opacity: number;
  opacityDir: number;
  hue: number;
  shape: 'petal' | 'leaf' | 'circle';
  depth: number; // 0–1 parallax layer (0 = far/slow, 1 = near/fast)
}

interface Bokeh {
  x: number;
  y: number;
  radius: number;
  baseSpeedX: number;
  baseSpeedY: number;
  opacity: number;
  maxOpacity: number;
  opacityDir: number;
  hue: number;
  pulseSpeed: number;
  pulsePhase: number;
  depth: number;
  sparkle: boolean; // bright sparkle particle
}

interface Firefly {
  x: number;
  y: number;
  radius: number;
  baseSpeedX: number;
  baseSpeedY: number;
  opacity: number;
  maxOpacity: number;
  opacityDir: number;
  pulseSpeed: number;
  pulsePhase: number;
  depth: number;
  kind: 'firefly' | 'spore' | 'glow'; // different visual types
  hue: number; // 0=teal, 1=green
  wobbleAmp: number;
  wobbleSpeed: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

// ─── Enchanted Garden ────────────────────────────────────────────────
function createPetal(w: number, h: number): Petal {
  const depth = rand(0.2, 1);
  return {
    x: rand(-20, w + 20),
    y: rand(-40, h + 40),
    size: rand(5, 14) * (0.6 + depth * 0.4),
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: rand(-0.015, 0.015) * depth,
    baseSpeedX: rand(-0.2, 0.2),
    baseSpeedY: rand(-0.5, -0.08),
    opacity: rand(0.12, 0.45) * (0.5 + depth * 0.5),
    opacityDir: rand(0.001, 0.005) * (Math.random() > 0.5 ? 1 : -1),
    hue: rand(0, 1),
    shape: (['petal', 'leaf', 'circle'] as const)[Math.floor(rand(0, 3))],
    depth,
  };
}

function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;

  const r = Math.round(125 + p.hue * 74);
  const g = Math.round(140 - p.hue * 11);
  const b = Math.round(110 - p.hue * 1);
  const color = `rgb(${r},${g},${b})`;

  if (p.shape === 'petal') {
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.45, p.size, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.75);
    ctx.lineTo(0, p.size * 0.75);
    ctx.strokeStyle = color;
    ctx.globalAlpha = p.opacity * 0.25;
    ctx.lineWidth = 0.4;
    ctx.stroke();
  } else if (p.shape === 'leaf') {
    const s = p.size;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.6, -s * 0.5, s * 0.6, s * 0.3, 0, s);
    ctx.bezierCurveTo(-s * 0.6, s * 0.3, -s * 0.6, -s * 0.5, 0, -s);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(0, s * 0.85);
    ctx.strokeStyle = color;
    ctx.globalAlpha = p.opacity * 0.2;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  } else {
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 0.5);
    grad.addColorStop(0, color);
    grad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.restore();
}

function updatePetal(p: Petal, w: number, h: number, scrollVelocity: number) {
  // Scroll-reactive wind: scrolling down pushes particles sideways + up faster
  const windX = scrollVelocity * 0.15 * p.depth;
  const windY = scrollVelocity * -0.08 * p.depth;

  p.x += p.baseSpeedX + windX;
  p.y += p.baseSpeedY + windY;
  p.rotation += p.rotationSpeed + scrollVelocity * 0.002 * p.depth;
  p.opacity += p.opacityDir;

  if (p.opacity > 0.5) p.opacityDir = -Math.abs(p.opacityDir);
  if (p.opacity < 0.08) p.opacityDir = Math.abs(p.opacityDir);

  if (p.y < -60) { p.y = h + 50; p.x = rand(-10, w + 10); }
  if (p.y > h + 60) { p.y = -50; p.x = rand(-10, w + 10); }
  if (p.x < -40) p.x = w + 30;
  if (p.x > w + 40) p.x = -30;
}

// ─── Royal Blossom ───────────────────────────────────────────────────
function createBokeh(w: number, h: number): Bokeh {
  const sparkle = Math.random() < 0.25; // 25% are bright sparkle particles
  const depth = rand(0.15, 1);
  return {
    x: rand(0, w),
    y: rand(0, h),
    radius: sparkle ? rand(1.5, 5) : rand(6, 32) * (0.5 + depth * 0.5),
    baseSpeedX: rand(-0.2, 0.2),
    baseSpeedY: rand(-0.35, 0.15),
    opacity: sparkle ? rand(0.3, 0.8) : rand(0.08, 0.35),
    maxOpacity: sparkle ? 0.9 : 0.4,
    opacityDir: rand(0.002, 0.008) * (Math.random() > 0.5 ? 1 : -1),
    hue: rand(0, 1),
    pulseSpeed: rand(0.01, 0.04),
    pulsePhase: rand(0, Math.PI * 2),
    depth,
    sparkle,
  };
}

function drawBokeh(ctx: CanvasRenderingContext2D, b: Bokeh, time: number) {
  ctx.save();

  const pulse = 1 + Math.sin(time * b.pulseSpeed + b.pulsePhase) * 0.25;
  const r = b.radius * pulse;
  const osc = 0.6 + Math.sin(time * b.pulseSpeed * 0.7 + b.pulsePhase) * 0.4;
  const opacity = b.opacity * osc;

  // Gold (#d4a373) → rose (#c47a8a) → bright white for sparkles
  const cr = b.sparkle ? 240 : Math.round(212 - b.hue * 16);
  const cg = b.sparkle ? 220 : Math.round(163 - b.hue * 41);
  const cb = b.sparkle ? 190 : Math.round(115 + b.hue * 23);

  if (b.sparkle) {
    // Bright sparkle: 4-point star shape
    ctx.globalAlpha = opacity;
    const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r * 3);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.9)`);
    grad.addColorStop(0.3, `rgba(${cr},${cg},${cb},0.3)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(b.x - r * 3, b.y - r * 3, r * 6, r * 6);

    // Cross flare
    ctx.globalAlpha = opacity * 0.6;
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.7)`;
    ctx.lineWidth = 0.5;
    const flareLen = r * 4;
    ctx.beginPath();
    ctx.moveTo(b.x - flareLen, b.y);
    ctx.lineTo(b.x + flareLen, b.y);
    ctx.moveTo(b.x, b.y - flareLen);
    ctx.lineTo(b.x, b.y + flareLen);
    ctx.stroke();
  } else {
    // Large bokeh circle
    ctx.globalAlpha = opacity;

    // Big soft outer glow
    const outerGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r * 2);
    outerGrad.addColorStop(0, `rgba(${cr},${cg},${cb},0.5)`);
    outerGrad.addColorStop(0.3, `rgba(${cr},${cg},${cb},0.15)`);
    outerGrad.addColorStop(0.7, `rgba(${cr},${cg},${cb},0.03)`);
    outerGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(b.x, b.y, r * 2, 0, Math.PI * 2);
    ctx.fillStyle = outerGrad;
    ctx.fill();

    // Inner bright core
    const coreGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r * 0.5);
    coreGrad.addColorStop(0, `rgba(240,215,180,${Math.min(opacity * 2, 0.8)})`);
    coreGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(b.x, b.y, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Ring outline
    ctx.globalAlpha = opacity * 0.5;
    ctx.beginPath();
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${cr},${cg},${cb},0.35)`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  ctx.restore();
}

function updateBokeh(b: Bokeh, w: number, h: number, scrollVelocity: number) {
  // Scroll parallax: particles shift based on depth and scroll speed
  const parallaxX = scrollVelocity * 0.08 * b.depth * (b.x > w / 2 ? 1 : -1);
  const parallaxY = scrollVelocity * -0.12 * b.depth;

  b.x += b.baseSpeedX + parallaxX;
  b.y += b.baseSpeedY + parallaxY;
  b.opacity += b.opacityDir;

  if (b.opacity > b.maxOpacity) b.opacityDir = -Math.abs(b.opacityDir);
  if (b.opacity < 0.04) b.opacityDir = Math.abs(b.opacityDir);

  if (b.y < -40) { b.y = h + 30; b.x = rand(0, w); }
  if (b.y > h + 40) { b.y = -30; b.x = rand(0, w); }
  if (b.x < -50) b.x = w + 40;
  if (b.x > w + 50) b.x = -40;
}

// ─── Celestial Garden ────────────────────────────────────────────────
function createFirefly(w: number, h: number): Firefly {
  const depth = rand(0.15, 1);
  const kinds: ('firefly' | 'spore' | 'glow')[] = ['firefly', 'firefly', 'spore', 'spore', 'glow'];
  const kind = kinds[Math.floor(rand(0, kinds.length))];
  return {
    x: rand(0, w),
    y: rand(0, h),
    radius: kind === 'glow' ? rand(15, 35) : kind === 'spore' ? rand(1.5, 4) : rand(2, 7),
    baseSpeedX: rand(-0.15, 0.15),
    baseSpeedY: rand(-0.25, 0.1),
    opacity: kind === 'glow' ? rand(0.03, 0.1) : rand(0.15, 0.7),
    maxOpacity: kind === 'glow' ? 0.12 : kind === 'spore' ? 0.6 : 0.85,
    opacityDir: rand(0.003, 0.012) * (Math.random() > 0.5 ? 1 : -1),
    pulseSpeed: rand(0.015, 0.05),
    pulsePhase: rand(0, Math.PI * 2),
    depth,
    kind,
    hue: rand(0, 1),
    wobbleAmp: rand(0.3, 1.2),
    wobbleSpeed: rand(0.01, 0.04),
  };
}

function drawFirefly(ctx: CanvasRenderingContext2D, f: Firefly, time: number) {
  ctx.save();
  const pulse = 1 + Math.sin(time * f.pulseSpeed + f.pulsePhase) * 0.35;
  const osc = 0.5 + Math.sin(time * f.pulseSpeed * 0.6 + f.pulsePhase) * 0.5;
  const opacity = f.opacity * osc;
  const r = f.radius * pulse;

  // Teal (#4ecdc4) → green (#64dc96) blend based on hue
  const cr = Math.round(78 + f.hue * 22);
  const cg = Math.round(205 + f.hue * 15);
  const cb = Math.round(196 - f.hue * 46);

  if (f.kind === 'glow') {
    // Large soft bioluminescent glow blob
    ctx.globalAlpha = opacity;
    const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.3)`);
    grad.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.08)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.fill();
  } else if (f.kind === 'spore') {
    // Tiny floating spore with soft glow
    ctx.globalAlpha = opacity;
    const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 3);
    grad.addColorStop(0, `rgba(${cr},${cg},${cb},0.8)`);
    grad.addColorStop(0.3, `rgba(${cr},${cg},${cb},0.2)`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(f.x, f.y, r * 3, 0, Math.PI * 2);
    ctx.fill();
    // Bright core
    ctx.globalAlpha = opacity * 1.2;
    ctx.fillStyle = `rgba(168,237,234,0.9)`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Firefly: bright pulsing core + large glow halo
    ctx.globalAlpha = opacity;

    // Outer glow halo
    const haloR = r * 5;
    const halo = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, haloR);
    halo.addColorStop(0, `rgba(${cr},${cg},${cb},0.35)`);
    halo.addColorStop(0.2, `rgba(${cr},${cg},${cb},0.1)`);
    halo.addColorStop(0.5, `rgba(${cr},${cg},${cb},0.02)`);
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(f.x, f.y, haloR, 0, Math.PI * 2);
    ctx.fill();

    // Bright white-teal core
    ctx.globalAlpha = Math.min(opacity * 1.5, 0.95);
    const core = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
    core.addColorStop(0, `rgba(220,250,245,0.95)`);
    core.addColorStop(0.4, `rgba(${cr},${cg},${cb},0.7)`);
    core.addColorStop(1, 'transparent');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function updateFirefly(f: Firefly, w: number, h: number, scrollVelocity: number, time: number) {
  // Organic wobble movement
  const wobbleX = Math.sin(time * f.wobbleSpeed + f.pulsePhase) * f.wobbleAmp;
  const wobbleY = Math.cos(time * f.wobbleSpeed * 0.7 + f.pulsePhase) * f.wobbleAmp * 0.6;

  // Scroll-reactive: fireflies scatter outward on scroll
  const scrollX = scrollVelocity * 0.1 * f.depth * (f.x > w / 2 ? 1 : -1);
  const scrollY = scrollVelocity * -0.06 * f.depth;

  f.x += f.baseSpeedX + wobbleX + scrollX;
  f.y += f.baseSpeedY + wobbleY + scrollY;
  f.opacity += f.opacityDir;

  if (f.opacity > f.maxOpacity) f.opacityDir = -Math.abs(f.opacityDir);
  if (f.opacity < 0.02) f.opacityDir = Math.abs(f.opacityDir);

  if (f.y < -50) { f.y = h + 40; f.x = rand(0, w); }
  if (f.y > h + 50) { f.y = -40; f.x = rand(0, w); }
  if (f.x < -60) f.x = w + 50;
  if (f.x > w + 60) f.x = -50;
}

// ─── Mist layer (Celestial Garden) ───────────────────────────────────
function drawMistLayer(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  ctx.save();
  // Drifting mist bands
  const y1 = h * 0.7 + Math.sin(time * 0.002) * h * 0.05;
  ctx.globalAlpha = 0.04;
  const mist1 = ctx.createLinearGradient(0, y1 - 60, 0, y1 + 60);
  mist1.addColorStop(0, 'transparent');
  mist1.addColorStop(0.5, 'rgba(78,205,196,0.3)');
  mist1.addColorStop(1, 'transparent');
  ctx.fillStyle = mist1;
  ctx.fillRect(0, y1 - 60, w, 120);

  const y2 = h * 0.35 + Math.cos(time * 0.0015) * h * 0.04;
  ctx.globalAlpha = 0.025;
  const mist2 = ctx.createLinearGradient(0, y2 - 40, 0, y2 + 40);
  mist2.addColorStop(0, 'transparent');
  mist2.addColorStop(0.5, 'rgba(100,220,150,0.25)');
  mist2.addColorStop(1, 'transparent');
  ctx.fillStyle = mist2;
  ctx.fillRect(0, y2 - 40, w, 80);
  ctx.restore();
}

// ─── Light rays (Celestial Garden) ───────────────────────────────────
function drawLightRays(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  ctx.save();
  // Diagonal light ray from top-left
  const rayAngle = -0.4 + Math.sin(time * 0.001) * 0.05;
  const rayX = w * 0.25 + Math.sin(time * 0.0012) * w * 0.1;

  ctx.translate(rayX, 0);
  ctx.rotate(rayAngle);
  ctx.globalAlpha = 0.03;
  const rayGrad = ctx.createLinearGradient(-30, 0, 30, 0);
  rayGrad.addColorStop(0, 'transparent');
  rayGrad.addColorStop(0.5, 'rgba(168,237,234,0.5)');
  rayGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = rayGrad;
  ctx.fillRect(-30, -h * 0.1, 60, h * 1.2);

  // Second thinner ray
  ctx.globalAlpha = 0.02;
  const ray2Grad = ctx.createLinearGradient(-15, 0, 15, 0);
  ray2Grad.addColorStop(0, 'transparent');
  ray2Grad.addColorStop(0.5, 'rgba(78,205,196,0.4)');
  ray2Grad.addColorStop(1, 'transparent');
  ctx.fillStyle = ray2Grad;
  ctx.fillRect(40, -h * 0.1, 30, h * 1.2);
  ctx.restore();
}

// ─── Shimmer sweep (Royal Blossom) ───────────────────────────────────
function drawShimmerSweep(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  // Diagonal gold shimmer sweep
  const sweepX = ((time * 0.4) % (w + 200)) - 100;
  ctx.save();
  ctx.globalAlpha = 0.06;
  const grad = ctx.createLinearGradient(sweepX - 40, 0, sweepX + 40, h);
  grad.addColorStop(0, 'transparent');
  grad.addColorStop(0.4, 'rgba(212,163,115,0.5)');
  grad.addColorStop(0.5, 'rgba(230,201,168,0.7)');
  grad.addColorStop(0.6, 'rgba(212,163,115,0.5)');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.fillRect(sweepX - 40, 0, 80, h);
  ctx.restore();

  // Secondary slower sweep
  const sweep2 = ((time * 0.2 + 300) % (w + 300)) - 150;
  ctx.save();
  ctx.globalAlpha = 0.035;
  const grad2 = ctx.createLinearGradient(sweep2 - 60, 0, sweep2 + 60, h);
  grad2.addColorStop(0, 'transparent');
  grad2.addColorStop(0.45, 'rgba(196,122,138,0.4)');
  grad2.addColorStop(0.55, 'rgba(196,122,138,0.4)');
  grad2.addColorStop(1, 'transparent');
  ctx.fillStyle = grad2;
  ctx.fillRect(sweep2 - 60, 0, 120, h);
  ctx.restore();
}

// ─── Ambient glow layer ──────────────────────────────────────────────
function drawAmbientGlow(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, theme: string) {
  ctx.save();
  if (theme === 'royal-blossom') {
    // Moving warm glow spots
    const gx1 = w * 0.3 + Math.sin(time * 0.003) * w * 0.15;
    const gy1 = h * 0.3 + Math.cos(time * 0.004) * h * 0.1;
    const g1 = ctx.createRadialGradient(gx1, gy1, 0, gx1, gy1, h * 0.45);
    g1.addColorStop(0, 'rgba(212,163,115,0.07)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    const gx2 = w * 0.7 + Math.cos(time * 0.0025) * w * 0.12;
    const gy2 = h * 0.7 + Math.sin(time * 0.0035) * h * 0.1;
    const g2 = ctx.createRadialGradient(gx2, gy2, 0, gx2, gy2, h * 0.4);
    g2.addColorStop(0, 'rgba(196,122,138,0.05)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);
  } else if (theme === 'celestial-garden') {
    // Mystical forest: drifting teal/green glow pools
    const gx1 = w * 0.3 + Math.sin(time * 0.002) * w * 0.18;
    const gy1 = h * 0.35 + Math.cos(time * 0.003) * h * 0.12;
    const g1 = ctx.createRadialGradient(gx1, gy1, 0, gx1, gy1, h * 0.4);
    g1.addColorStop(0, 'rgba(78,205,196,0.06)');
    g1.addColorStop(1, 'transparent');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, w, h);

    const gx2 = w * 0.7 + Math.cos(time * 0.0025) * w * 0.15;
    const gy2 = h * 0.65 + Math.sin(time * 0.0035) * h * 0.1;
    const g2 = ctx.createRadialGradient(gx2, gy2, 0, gx2, gy2, h * 0.35);
    g2.addColorStop(0, 'rgba(100,220,150,0.04)');
    g2.addColorStop(1, 'transparent');
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, w, h);

    // Subtle bottom forest floor glow
    const g3 = ctx.createLinearGradient(0, h * 0.8, 0, h);
    g3.addColorStop(0, 'transparent');
    g3.addColorStop(1, 'rgba(78,205,196,0.03)');
    ctx.fillStyle = g3;
    ctx.fillRect(0, h * 0.8, w, h * 0.2);
  } else {
    // Enchanted garden: soft green/gold drifting glow
    const gx = w * 0.5 + Math.sin(time * 0.002) * w * 0.2;
    const gy = h * 0.4 + Math.cos(time * 0.003) * h * 0.15;
    const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, h * 0.5);
    g.addColorStop(0, 'rgba(125,140,110,0.04)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();
}

// ─── Main Component ──────────────────────────────────────────────────
interface AnimatedBackgroundProps {
  theme: 'enchanted-garden' | 'royal-blossom' | 'celestial-garden';
  mode?: 'content' | 'cover';
}

export default function AnimatedBackground({ theme, mode = 'content' }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<(Petal | Bokeh | Firefly)[]>([]);
  const scrollRef = useRef({ lastY: 0, velocity: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  const isGarden = theme === 'enchanted-garden';
  const isCelestial = theme === 'celestial-garden';
  const particleCount = mode === 'cover' ? 30 : (isGarden ? 60 : isCelestial ? 65 : 70);

  const initParticles = useCallback((w: number, h: number) => {
    const arr: (Petal | Bokeh | Firefly)[] = [];
    for (let i = 0; i < particleCount; i++) {
      if (isGarden) arr.push(createPetal(w, h));
      else if (isCelestial) arr.push(createFirefly(w, h));
      else arr.push(createBokeh(w, h));
    }
    particlesRef.current = arr;
  }, [isGarden, isCelestial, particleCount]);

  // Reduced motion detection
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Track scroll velocity from .invitation-content
  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scrollContainer = canvas.closest('.invitation-content') || canvas.closest('.invitation-root');
    if (!scrollContainer) return;

    const onScroll = () => {
      const y = scrollContainer.scrollTop;
      scrollRef.current.velocity = (y - scrollRef.current.lastY) * 0.5;
      scrollRef.current.lastY = y;
    };
    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [reducedMotion]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      // For content mode: the parent wrapper has height:0, so get dimensions
      // from the scroll container (.invitation-content) which is the actual viewport
      const scrollContainer = canvas.closest('.invitation-content') || canvas.closest('.invitation-root');
      const w = scrollContainer?.clientWidth || canvas.clientWidth;
      const h = scrollContainer?.clientHeight || canvas.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      if (mode === 'cover') {
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      } else {
        // Content mode: match the scroll container's visible height
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (particlesRef.current.length === 0) {
        initParticles(w, h);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    let time = 0;

    const loop = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);
      time++;

      // Decay scroll velocity smoothly
      scrollRef.current.velocity *= 0.92;
      const sv = scrollRef.current.velocity;

      // Ambient glow layer
      drawAmbientGlow(ctx, w, h, time, theme);

      if (isGarden) {
        for (const p of particlesRef.current as Petal[]) {
          drawPetal(ctx, p);
          updatePetal(p, w, h, sv);
        }
      } else if (isCelestial) {
        // Celestial Garden: light rays, fireflies, mist
        drawLightRays(ctx, w, h, time);

        for (const f of particlesRef.current as Firefly[]) {
          drawFirefly(ctx, f, time);
          updateFirefly(f, w, h, sv, time);
        }

        drawMistLayer(ctx, w, h, time);
      } else {
        // Royal Blossom
        drawShimmerSweep(ctx, w, h, time);

        for (const b of particlesRef.current as Bokeh[]) {
          drawBokeh(ctx, b, time);
          updateBokeh(b, w, h, sv);
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [isGarden, isCelestial, theme, initParticles, reducedMotion]);

  if (reducedMotion) {
    if (mode === 'cover') {
      return (
        <div
          className="absolute inset-0 w-full pointer-events-none"
          style={{
            zIndex: 0,
            background: isGarden
              ? 'radial-gradient(ellipse at 30% 20%, rgba(125,140,110,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(199,149,109,0.06) 0%, transparent 50%)'
              : isCelestial
              ? 'radial-gradient(ellipse at 30% 30%, rgba(78,205,196,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(100,220,150,0.05) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 50% 30%, rgba(212,163,115,0.1) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(196,122,138,0.07) 0%, transparent 50%)',
          }}
          aria-hidden="true"
        />
      );
    }
    // Content mode: zero-height sticky wrapper so it takes NO layout space
    return (
      <div
        className="sticky top-0 w-full pointer-events-none"
        style={{ zIndex: 0, height: 0, overflow: 'visible' }}
        aria-hidden="true"
      >
        <div
          className="animated-bg-reduced"
          style={{
            width: '100%',
            height: 'var(--animated-bg-h, 100dvh)',
            background: isGarden
              ? 'radial-gradient(ellipse at 30% 20%, rgba(125,140,110,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(199,149,109,0.06) 0%, transparent 50%)'
              : isCelestial
              ? 'radial-gradient(ellipse at 30% 30%, rgba(78,205,196,0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(100,220,150,0.05) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 50% 30%, rgba(212,163,115,0.1) 0%, transparent 50%), radial-gradient(ellipse at 30% 70%, rgba(196,122,138,0.07) 0%, transparent 50%)',
          }}
        />
      </div>
    );
  }

  if (mode === 'cover') {
    // Cover mode: absolute overlay on cover screen
    return (
      <div
        className="absolute inset-0 w-full pointer-events-none"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    );
  }

  // Content mode: sticky wrapper with height:0 + overflow:visible
  // Takes ZERO layout space so no gap appears before the first section.
  // The inner canvas is sized by JS resize() to match the scroll container height.
  return (
    <div
      ref={wrapperRef}
      className="sticky top-0 w-full pointer-events-none"
      style={{ zIndex: 0, height: 0, overflow: 'visible' }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
      />
    </div>
  );
}
