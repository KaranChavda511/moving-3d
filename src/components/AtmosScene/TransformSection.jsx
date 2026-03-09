'use client';

import { Suspense, useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  CatmullRomCurve3,
  Color,
  DoubleSide,
  ExtrudeGeometry,
  Shape,
  TubeGeometry,
  Vector3,
} from 'three';

/* ─────────────────────────────────────────────
   Module-level animation store.
   Not a prop or hook — safe to mutate from
   useFrame callbacks. React compiler compliant.
   ───────────────────────────────────────────── */
const anim = { progress: 0 };

/* ─────────────────────────────────────────────
   Constants & Colors
   ───────────────────────────────────────────── */
const BLUE_LIGHT = new Color('#5b8aff');
const BLUE_GLOW = new Color('#7aa4ff');
const DARK_METAL = new Color('#45454f');
const METAL_WARM = new Color('#9a9ab0');
const METAL_EDGE = new Color('#5a5a66');

/* ─────────────────────────────────────────────
   Responsive layout store.
   Positions adapt to viewport — on mobile the
   machine & logo stack vertically (centered),
   on desktop they spread diagonally.
   ───────────────────────────────────────────── */
const layout = {
  // Default = desktop positions
  machine: [-2.8, 0, 3.5],
  logo: [3.2, 0.01, -3.8],
  mobile: false,
};

function buildCablePoints(m, l) {
  const mx = m[0], mz = m[2], lx = l[0], lz = l[2];
  // Midpoint and spread
  const midX = (mx + lx) / 2;
  const midZ = (mz + lz) / 2;
  const dx = (lx - mx);
  const dz = (lz - mz);
  return [
    new Vector3(mx, 0.35, mz),
    new Vector3(mx + dx * 0.1, 0.20, mz + dz * 0.1),
    new Vector3(mx + dx * 0.2, 0.10, mz + dz * 0.2),
    // S-curve: first bend sweeps one direction
    new Vector3(midX + dx * 0.25, 0.06, midZ + dz * 0.1),
    new Vector3(midX + dx * 0.35, 0.05, midZ - dz * 0.05),
    new Vector3(midX + dx * 0.3, 0.04, midZ - dz * 0.15),  // peak
    // S-curve: second bend sweeps back
    new Vector3(midX - dx * 0.1, 0.04, midZ - dz * 0.1),
    new Vector3(midX - dx * 0.25, 0.04, midZ + dz * 0.05),  // dip
    new Vector3(midX - dx * 0.05, 0.03, lz + dz * 0.15),
    new Vector3(lx - dx * 0.25, 0.02, lz + dz * 0.08),
    new Vector3(lx - dx * 0.1, 0.01, lz + dz * 0.03),
    new Vector3(lx - dx * 0.02, 0.01, lz),
  ];
}

// Initial cable curve — rebuilt when layout changes
let cableCurve = new CatmullRomCurve3(buildCablePoints(layout.machine, layout.logo));

// Timeline (0–1): lever → pulse → extrude → settle
const PHASE_LEVER = [0, 0.08];
const PHASE_PULSE = [0.08, 0.55];
const PHASE_EXTRUDE = [0.55, 0.85];
const PHASE_SETTLE = [0.85, 1.0];

/* ─────────────────────────────────────────────
   WebMob Logo Shapes — from actual SVG paths
   SVG viewBox: 0 0 188 192, scaled and centered
   at origin. Y is flipped (SVG Y-down → Three.js Y-up).
   ───────────────────────────────────────────── */
const SVG_SCALE = 0.009;
const SVG_CX = 94;
const SVG_CY = 96;

function sx(x) { return (x - SVG_CX) * SVG_SCALE; }
function sy(y) { return -(y - SVG_CY) * SVG_SCALE; }

function createChipBody() {
  const shape = new Shape();
  shape.moveTo(sx(0), sy(48));
  shape.bezierCurveTo(sx(0), sy(21.49), sx(21.49), sy(0), sx(48), sy(0));
  shape.lineTo(sx(140), sy(0));
  shape.bezierCurveTo(sx(166.51), sy(0), sx(188), sy(21.49), sx(188), sy(48));
  shape.lineTo(sx(188), sy(144));
  shape.bezierCurveTo(sx(188), sy(170.51), sx(166.51), sy(192), sx(140), sy(192));
  shape.lineTo(sx(48), sy(192));
  shape.bezierCurveTo(sx(21.49), sy(192), sx(0), sy(170.51), sx(0), sy(144));
  shape.lineTo(sx(0), sy(48));
  shape.closePath();
  return shape;
}

function createWMLeft() {
  const shape = new Shape();
  shape.moveTo(sx(101.423), sy(110.518));
  shape.lineTo(sx(101.423), sy(130.477));
  shape.bezierCurveTo(sx(101.424), sy(130.778), sx(101.335), sy(131.073), sx(101.168), sy(131.323));
  shape.bezierCurveTo(sx(101.001), sy(131.574), sx(100.763), sy(131.769), sx(100.485), sy(131.884));
  shape.bezierCurveTo(sx(100.207), sy(131.999), sx(99.9007), sy(132.030), sx(99.6055), sy(131.971));
  shape.bezierCurveTo(sx(99.3102), sy(131.912), sx(99.0391), sy(131.766), sx(98.8266), sy(131.553));
  shape.lineTo(sx(72.8272), sy(105.554));
  shape.bezierCurveTo(sx(72.6556), sy(105.383), sx(72.4234), sy(105.287), sx(72.1813), sy(105.287));
  shape.bezierCurveTo(sx(71.9391), sy(105.287), sx(71.7068), sy(105.383), sx(71.5352), sy(105.554));
  shape.lineTo(sx(45.5962), sy(131.553));
  shape.bezierCurveTo(sx(45.384), sy(131.766), sx(45.1133), sy(131.911), sx(44.8184), sy(131.970));
  shape.bezierCurveTo(sx(44.5236), sy(132.029), sx(44.2178), sy(132.000), sx(43.9398), sy(131.885));
  shape.bezierCurveTo(sx(43.6618), sy(131.770), sx(43.4242), sy(131.576), sx(43.2569), sy(131.326));
  shape.bezierCurveTo(sx(43.0896), sy(131.076), sx(43.0002), sy(130.782), sx(43.0), sy(130.481));
  shape.lineTo(sx(43.0), sy(61.5228));
  shape.bezierCurveTo(sx(42.9994), sy(61.2217), sx(43.0883), sy(60.9273), sx(43.2553), sy(60.6768));
  shape.bezierCurveTo(sx(43.4223), sy(60.4263), sx(43.6598), sy(60.2310), sx(43.938), sy(60.1157));
  shape.bezierCurveTo(sx(44.2161), sy(60.0005), sx(44.5222), sy(59.9705), sx(44.8175), sy(60.0295));
  shape.bezierCurveTo(sx(45.1127), sy(60.0884), sx(45.3837), sy(60.2338), sx(45.5962), sy(60.4471));
  shape.lineTo(sx(59.7592), sy(74.610));
  shape.bezierCurveTo(sx(60.0437), sy(74.8957), sx(60.2033), sy(75.2825), sx(60.2032), sy(75.6857));
  shape.lineTo(sx(60.2032), sy(92.6415));
  shape.lineTo(sx(71.115), sy(81.7456));
  shape.bezierCurveTo(sx(71.4005), sy(81.4618), sx(71.7866), sy(81.3025), sx(72.1891), sy(81.3025));
  shape.bezierCurveTo(sx(72.5916), sy(81.3025), sx(72.9779), sy(81.4618), sx(73.2634), sy(81.7456));
  shape.lineTo(sx(100.977), sy(109.456));
  shape.bezierCurveTo(sx(101.258), sy(109.738), sx(101.417), sy(110.119), sx(101.421), sy(110.516));
  shape.closePath();
  return shape;
}

function createWMRight() {
  const shape = new Shape();
  shape.moveTo(sx(87.4375), sy(81.4828));
  shape.lineTo(sx(87.4375), sy(61.5233));
  shape.bezierCurveTo(sx(87.438), sy(61.2223), sx(87.5277), sy(60.9282), sx(87.6952), sy(60.678));
  shape.bezierCurveTo(sx(87.8627), sy(60.4279), sx(88.1006), sy(60.233), sx(88.3788), sy(60.1179));
  shape.bezierCurveTo(sx(88.6569), sy(60.0029), sx(88.963), sy(59.9727), sx(89.2583), sy(60.0314));
  shape.bezierCurveTo(sx(89.5535), sy(60.0901), sx(89.8248), sy(60.2349), sx(90.0378), sy(60.4476));
  shape.lineTo(sx(116.037), sy(86.4469));
  shape.bezierCurveTo(sx(116.208), sy(86.6175), sx(116.44), sy(86.7133), sx(116.681), sy(86.7133));
  shape.bezierCurveTo(sx(116.923), sy(86.7133), sx(117.154), sy(86.6175), sx(117.325), sy(86.4469));
  shape.lineTo(sx(143.264), sy(60.4476));
  shape.bezierCurveTo(sx(143.477), sy(60.2349), sx(143.748), sy(60.0901), sx(144.044), sy(60.0314));
  shape.bezierCurveTo(sx(144.339), sy(59.9727), sx(144.645), sy(60.0029), sx(144.923), sy(60.1179));
  shape.bezierCurveTo(sx(145.201), sy(60.233), sx(145.439), sy(60.4279), sx(145.607), sy(60.678));
  shape.bezierCurveTo(sx(145.774), sy(60.9282), sx(145.864), sy(61.2223), sx(145.864), sy(61.5233));
  shape.lineTo(sx(145.864), sy(130.477));
  shape.bezierCurveTo(sx(145.863), sy(130.778), sx(145.773), sy(131.071), sx(145.605), sy(131.321));
  shape.bezierCurveTo(sx(145.437), sy(131.570), sx(145.199), sy(131.765), sx(144.921), sy(131.879));
  shape.bezierCurveTo(sx(144.643), sy(131.994), sx(144.338), sy(132.024), sx(144.043), sy(131.965));
  shape.bezierCurveTo(sx(143.748), sy(131.906), sx(143.477), sy(131.761), sx(143.264), sy(131.549));
  shape.lineTo(sx(129.108), sy(117.393));
  shape.bezierCurveTo(sx(128.966), sy(117.252), sx(128.854), sy(117.084), sx(128.777), sy(116.9));
  shape.bezierCurveTo(sx(128.7), sy(116.715), sx(128.66), sy(116.517), sx(128.66), sy(116.317));
  shape.lineTo(sx(128.66), sy(99.3615));
  shape.lineTo(sx(117.753), sy(110.273));
  shape.bezierCurveTo(sx(117.467), sy(110.557), sx(117.081), sy(110.716), sx(116.678), sy(110.716));
  shape.bezierCurveTo(sx(116.276), sy(110.716), sx(115.89), sy(110.557), sx(115.604), sy(110.273));
  shape.lineTo(sx(87.8926), sy(82.5418));
  shape.bezierCurveTo(sx(87.61), sy(82.261), sx(87.4491), sy(81.8803), sx(87.4447), sy(81.482));
  shape.closePath();
  return shape;
}

/* ─────────────────────────────────────────────
   Grid Floor + Lines
   ───────────────────────────────────────────── */
function GridFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[20, 20, 1, 1]} />
      <meshStandardMaterial color="#1a1c28" roughness={0.55} metalness={0.45} />
    </mesh>
  );
}

function GridLines() {
  const lines = useMemo(() => {
    const arr = [];
    const size = 10;
    const step = 0.8;
    for (let i = -size; i <= size; i += step) {
      arr.push(
        <line key={`x${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([-size, 0, i, size, 0, i]), 3]}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#2a2e42" transparent opacity={0.35} />
        </line>,
        <line key={`z${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([i, 0, -size, i, 0, size]), 3]}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#2a2e42" transparent opacity={0.35} />
        </line>
      );
    }
    return arr;
  }, []);

  return <group>{lines}</group>;
}

/* ─────────────────────────────────────────────
   Machine with Top-Mounted Lever
   Chunky pull lever on top — the clear focal
   point. Box has edge highlights to pop against
   the dark background.
   ───────────────────────────────────────────── */
function Machine() {
  const leverRef = useRef();
  const groupRef = useRef();

  useFrame(() => {
    if (!leverRef.current) return;
    const p = anim.progress;

    // Update position from layout
    if (groupRef.current) {
      groupRef.current.position.set(...layout.machine);
    }

    // Lever starts tilted backward (positive X = leaning back)
    // and pulls forward to vertical (0) when activated
    const LEVER_BACK = 0.35; // ~20° backward lean at rest
    let leverAngle = LEVER_BACK;
    if (p >= PHASE_LEVER[0] && p <= PHASE_LEVER[1]) {
      const t = (p - PHASE_LEVER[0]) / (PHASE_LEVER[1] - PHASE_LEVER[0]);
      // ease-out-back for satisfying snap
      const c1 = 1.70158;
      const c3 = c1 + 1;
      const eased = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      leverAngle = LEVER_BACK * (1 - eased);
    } else if (p > PHASE_LEVER[1] && p < PHASE_SETTLE[1]) {
      leverAngle = 0; // vertical = pulled down
    } else {
      leverAngle = LEVER_BACK; // resting = tilted back
    }

    leverRef.current.rotation.x = leverAngle;
  });

  return (
    <group ref={groupRef} position={[-2.8, 0, 3.5]} scale={[1.2, 1.2, 1.2]}>
      {/* Main body */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.85, 0.7, 0.7]} />
        <meshStandardMaterial color={DARK_METAL} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Top plate — lighter for edge definition */}
      <mesh position={[0, 0.71, 0]}>
        <boxGeometry args={[0.88, 0.02, 0.73]} />
        <meshStandardMaterial color={METAL_EDGE} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Bottom edge trim — rim highlight */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.88, 0.02, 0.73]} />
        <meshStandardMaterial color={METAL_EDGE} roughness={0.25} metalness={0.8} />
      </mesh>

      {/* Front face vertical vent slots */}
      <mesh position={[-0.14, 0.38, 0.355]}>
        <boxGeometry args={[0.1, 0.35, 0.02]} />
        <meshStandardMaterial color="#1e1e28" roughness={0.6} metalness={0.5} />
      </mesh>
      <mesh position={[0.14, 0.38, 0.355]}>
        <boxGeometry args={[0.1, 0.35, 0.02]} />
        <meshStandardMaterial color="#1e1e28" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Lever base mount — chunky cylinder on top */}
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.06, 16]} />
        <meshStandardMaterial color={METAL_EDGE} roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Lever — pivots from inside the base mount */}
      <group ref={leverRef} position={[0, 0.74, 0]}>
        {/* Lever arm */}
        <mesh position={[0, 0.25, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
          <meshStandardMaterial color={METAL_WARM} roughness={0.15} metalness={0.85} />
        </mesh>
        {/* Handle — horizontal, facing user (runs along X axis) */}
        <mesh position={[0, 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.26, 16]} />
          <meshStandardMaterial color={METAL_WARM} roughness={0.1} metalness={0.85} />
        </mesh>
        {/* End caps — smaller than handle radius */}
        <mesh position={[0.13, 0.5, 0]}>
          <sphereGeometry args={[0.055, 12, 10]} />
          <meshStandardMaterial color={METAL_WARM} roughness={0.1} metalness={0.85} />
        </mesh>
        <mesh position={[-0.13, 0.5, 0]}>
          <sphereGeometry args={[0.055, 12, 10]} />
          <meshStandardMaterial color={METAL_WARM} roughness={0.1} metalness={0.85} />
        </mesh>
      </group>

      {/* Base feet — visible metallic */}
      {[[-0.32, 0.26], [0.32, 0.26], [-0.32, -0.26], [0.32, -0.26]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]}>
          <cylinderGeometry args={[0.06, 0.07, 0.04, 10]} />
          <meshStandardMaterial color={METAL_WARM} roughness={0.25} metalness={0.75} />
        </mesh>
      ))}

      {/* Status light — front face */}
      <StatusLight />

      {/* Cable connection port — side facing logo */}
      <mesh position={[0.44, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 12]} />
        <meshStandardMaterial color="#2a2a32" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  );
}

function StatusLight() {
  const ref = useRef();
  useFrame(() => {
    if (!ref.current) return;
    const p = anim.progress;
    const active = p > PHASE_LEVER[1] && p < PHASE_SETTLE[1];
    ref.current.material.color.set(active ? '#335fff' : '#22c55e');
    ref.current.material.emissive.set(active ? '#335fff' : '#22c55e');
    ref.current.material.emissiveIntensity = active ? 4 : 2.5;
  });

  return (
    <mesh ref={ref} position={[0.3, 0.55, 0.36]}>
      <sphereGeometry args={[0.04, 12, 8]} />
      <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2.5} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   Cable / Tube — thicker, heavier looking
   ───────────────────────────────────────────── */
function Cable() {
  const meshRef = useRef();
  const builtLayout = useRef(null);

  useFrame(() => {
    if (!meshRef.current) return;
    // Rebuild tube when layout changes
    const key = layout.machine.join(',') + '|' + layout.logo.join(',');
    if (builtLayout.current !== key) {
      builtLayout.current = key;
      const oldGeo = meshRef.current.geometry;
      meshRef.current.geometry = new TubeGeometry(cableCurve, 80, 0.085, 8, false);
      if (oldGeo) oldGeo.dispose();
    }
  });

  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[cableCurve, 80, 0.085, 8, false]} />
      <meshStandardMaterial color="#4a4c62" roughness={0.3} metalness={0.7} emissive="#1a1c3a" emissiveIntensity={0.15} />
    </mesh>
  );
}

/* ─────────────────────────────────────────────
   Energy Pulse
   ───────────────────────────────────────────── */
function EnergyPulse() {
  const meshRef = useRef();
  const trailRef = useRef();
  const glowRef = useRef();

  useFrame(() => {
    if (!meshRef.current) return;
    const p = anim.progress;

    let pulseT = 0;
    if (p >= PHASE_PULSE[0] && p <= PHASE_PULSE[1]) {
      pulseT = (p - PHASE_PULSE[0]) / (PHASE_PULSE[1] - PHASE_PULSE[0]);
    } else if (p > PHASE_PULSE[1]) {
      pulseT = 1;
    }

    const pos = cableCurve.getPointAt(Math.min(pulseT, 1));
    meshRef.current.position.copy(pos);
    meshRef.current.position.y += 0.01;

    const visible = p >= PHASE_PULSE[0] && p <= PHASE_PULSE[1];
    meshRef.current.visible = visible;
    if (trailRef.current) trailRef.current.visible = visible;
    if (glowRef.current) glowRef.current.visible = visible;

    if (trailRef.current && pulseT > 0.02) {
      const tp = cableCurve.getPointAt(Math.max(pulseT - 0.04, 0));
      trailRef.current.position.set(tp.x, tp.y + 0.01, tp.z);
    }
    if (glowRef.current) {
      glowRef.current.position.set(pos.x, pos.y + 0.01, pos.z);
    }
  });

  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 12, 8]} />
        <meshStandardMaterial color={BLUE_GLOW} emissive={BLUE_GLOW} emissiveIntensity={5} transparent opacity={0.95} />
      </mesh>
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.05, 10, 6]} />
        <meshStandardMaterial color={BLUE_LIGHT} emissive={BLUE_LIGHT} emissiveIntensity={3} transparent opacity={0.6} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.2, 12, 8]} />
        <meshStandardMaterial color={BLUE_GLOW} emissive={BLUE_GLOW} emissiveIntensity={2} transparent opacity={0.18} />
      </mesh>
    </>
  );
}

/* ─────────────────────────────────────────────
   WM Logo — Single blue rounded chip that extrudes
   up as one piece ("button press release").
   WM letters sit on top as white raised marks.
   ───────────────────────────────────────────── */
function LogoShape() {
  const bodyRef = useRef();
  const wmLeftRef = useRef();
  const wmRightRef = useRef();
  const glowRef = useRef();
  const groupRef = useRef();
  const currentDepth = useRef(0.005);
  const lastBuiltDepth = useRef(0.005);

  const chipBody = useMemo(() => createChipBody(), []);
  const wmLeft = useMemo(() => createWMLeft(), []);
  const wmRight = useMemo(() => createWMRight(), []);

  useFrame(() => {
    if (!bodyRef.current) return;
    // Update position from layout
    if (groupRef.current) {
      groupRef.current.position.set(...layout.logo);
    }
    const p = anim.progress;

    let targetDepth = 0.005;
    if (p >= PHASE_EXTRUDE[0] && p <= PHASE_EXTRUDE[1]) {
      const t = (p - PHASE_EXTRUDE[0]) / (PHASE_EXTRUDE[1] - PHASE_EXTRUDE[0]);
      const c1 = 1.70158;
      const c3 = c1 + 1;
      const eased = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      targetDepth = 0.005 + eased * 0.2;
    } else if (p > PHASE_EXTRUDE[1]) {
      targetDepth = 0.205;
    }

    currentDepth.current += (targetDepth - currentDepth.current) * 0.1;
    const depth = currentDepth.current;

    if (Math.abs(depth - lastBuiltDepth.current) > 0.001) {
      lastBuiltDepth.current = depth;

      const bodyOpts = {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 3,
      };

      const oldBody = bodyRef.current.geometry;
      bodyRef.current.geometry = new ExtrudeGeometry(chipBody, bodyOpts);
      oldBody.dispose();

      const wmOpts = {
        depth: depth + 0.012,
        bevelEnabled: true,
        bevelThickness: 0.003,
        bevelSize: 0.003,
        bevelSegments: 2,
      };

      if (wmLeftRef.current) {
        const oldLeft = wmLeftRef.current.geometry;
        wmLeftRef.current.geometry = new ExtrudeGeometry(wmLeft, wmOpts);
        oldLeft.dispose();
      }
      if (wmRightRef.current) {
        const oldRight = wmRightRef.current.geometry;
        wmRightRef.current.geometry = new ExtrudeGeometry(wmRight, wmOpts);
        oldRight.dispose();
      }
    }

    let ei = 0;
    if (p >= PHASE_EXTRUDE[0] - 0.05 && p <= PHASE_SETTLE[1]) {
      if (p < PHASE_EXTRUDE[0]) ei = (p - (PHASE_EXTRUDE[0] - 0.05)) / 0.05;
      else if (p <= PHASE_EXTRUDE[1]) ei = 1;
      else ei = Math.max(1 - (p - PHASE_SETTLE[0]) / (PHASE_SETTLE[1] - PHASE_SETTLE[0]), 0.3);
    }

    bodyRef.current.material.emissiveIntensity = ei * 1.0;
    if (wmLeftRef.current) wmLeftRef.current.material.emissiveIntensity = ei * 0.5;
    if (wmRightRef.current) wmRightRef.current.material.emissiveIntensity = ei * 0.5;
    if (glowRef.current) {
      glowRef.current.material.opacity = ei * 0.12;
      glowRef.current.visible = ei > 0.01;
    }
  });

  const initOpts = { depth: 0.005, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3 };
  const wmInitOpts = { depth: 0.017, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2 };

  return (
    <group ref={groupRef} position={[3.2, 0.01, -3.8]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Blue rounded chip */}
      <mesh ref={bodyRef} castShadow>
        <extrudeGeometry args={[chipBody, initOpts]} />
        <meshStandardMaterial color="#2a5fff" emissive={BLUE_LIGHT} emissiveIntensity={0} roughness={0.25} metalness={0.5} />
      </mesh>

      {/* WM left letter */}
      <mesh ref={wmLeftRef} castShadow>
        <extrudeGeometry args={[wmLeft, wmInitOpts]} />
        <meshStandardMaterial color="#ffffff" emissive="#aaccff" emissiveIntensity={0} roughness={0.15} metalness={0.3} />
      </mesh>

      {/* WM right letter */}
      <mesh ref={wmRightRef} castShadow>
        <extrudeGeometry args={[wmRight, wmInitOpts]} />
        <meshStandardMaterial color="#ffffff" emissive="#aaccff" emissiveIntensity={0} roughness={0.15} metalness={0.3} />
      </mesh>

      {/* Glow behind */}
      <mesh ref={glowRef} position={[0, 0, -0.01]}>
        <extrudeGeometry args={[chipBody, { depth: 0.25, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1 }]} />
        <meshStandardMaterial color={BLUE_GLOW} emissive={BLUE_GLOW} emissiveIntensity={2} transparent opacity={0} side={DoubleSide} />
      </mesh>
    </group>
  );
}

/* ─────────────────────────────────────────────
   Dynamic Pulse Light
   ───────────────────────────────────────────── */
function PulseLight() {
  const lightRef = useRef();

  useFrame(() => {
    if (!lightRef.current) return;
    const p = anim.progress;

    if (p >= PHASE_PULSE[0] && p <= PHASE_PULSE[1]) {
      const t = (p - PHASE_PULSE[0]) / (PHASE_PULSE[1] - PHASE_PULSE[0]);
      const pos = cableCurve.getPointAt(Math.min(t, 1));
      lightRef.current.position.set(pos.x, pos.y + 0.3, pos.z);
      lightRef.current.intensity = 2.5;
    } else if (p >= PHASE_EXTRUDE[0] && p <= PHASE_SETTLE[1]) {
      lightRef.current.position.set(layout.logo[0], 0.8, layout.logo[2]);
      const g = p <= PHASE_EXTRUDE[1] ? 1 : Math.max(1 - (p - PHASE_SETTLE[0]) / (PHASE_SETTLE[1] - PHASE_SETTLE[0]), 0.3);
      lightRef.current.intensity = 3.5 * g;
    } else {
      lightRef.current.intensity = 0;
    }
  });

  return <pointLight ref={lightRef} color={BLUE_GLOW} intensity={0} distance={5} decay={2} />;
}

/* ─────────────────────────────────────────────
   Responsive Lights — follow layout positions
   ───────────────────────────────────────────── */
function ResponsiveLights() {
  const keyRef = useRef();
  const fillRef = useRef();

  useFrame(() => {
    if (keyRef.current) {
      keyRef.current.position.set(layout.machine[0], 2.5, layout.machine[2] + 0.5);
    }
    if (fillRef.current) {
      fillRef.current.position.set(layout.logo[0] + 0.4, 1.8, layout.logo[2] + 0.3);
    }
  });

  return (
    <>
      <pointLight ref={keyRef} intensity={1.4} color="#e0d8cc" distance={10} />
      <pointLight ref={fillRef} intensity={0.8} color="#5b8aff" distance={9} />
    </>
  );
}

/* ─────────────────────────────────────────────
   Main 3D Scene
   ───────────────────────────────────────────── */
function TransformScene() {
  return (
    <>
      <color attach="background" args={['#111116']} />
      <fog attach="fog" args={['#111116', 12, 30]} />

      <ambientLight intensity={0.8} color="#c0c0d0" />
      <directionalLight position={[4, 8, 4]} intensity={2.8} color="#e0dcd4" castShadow />
      <directionalLight position={[-3, 5, -2]} intensity={1.2} color="#4466aa" />
      {/* Key / fill lights — positioned by ResponsiveLights */}
      <ResponsiveLights />
      {/* Rim/edge light */}
      <pointLight position={[-2.5, 0.8, 0.0]} intensity={0.6} color="#6a6a80" distance={5} />

      <PulseLight />

      <GridFloor />
      <GridLines />
      <Machine />
      <Cable />
      <LogoShape />
      <EnergyPulse />
    </>
  );
}

/* ─────────────────────────────────────────────
   Animation Controller — ~5s loop
   ───────────────────────────────────────────── */
function AnimationController({ isPlaying }) {
  useFrame((_, delta) => {
    if (!isPlaying) return;
    anim.progress += delta * 0.2;
    if (anim.progress > 1.2) anim.progress = 0;
  });
  return null;
}

/* ─────────────────────────────────────────────
   Camera Rig — responsive, adapts to viewport
   ───────────────────────────────────────────── */
// Module-level camera config — safe to mutate outside React.
const camCfg = { x: 4.2, y: 9.5, z: 5.0, fov: 40, dirty: true };

function CameraRig() {
  const { size } = useThree();

  // Compute camera params when viewport changes.
  // Stored in module-level object (same pattern as `anim`).
  useEffect(() => {
    const aspect = size.width / size.height;
    const w = size.width;
    const isMobile = w <= 480 || aspect < 0.6;
    const isSmallPhone = !isMobile && (w <= 640 || aspect < 0.8);
    const isTablet = !isMobile && !isSmallPhone && (w <= 768 || aspect < 1.0);

    // --- Layout: reposition objects for viewport ---
    if (isMobile) {
      // Phone portrait: stack vertically, centered on X
      layout.machine = [0, 0, 3.0];
      layout.logo = [0, 0.01, -3.0];
      layout.mobile = true;
      camCfg.x = 0.5; camCfg.y = 12.0; camCfg.z = 2.0; camCfg.fov = 50;
    } else if (isSmallPhone) {
      layout.machine = [-0.8, 0, 2.8];
      layout.logo = [0.8, 0.01, -2.8];
      layout.mobile = true;
      camCfg.x = 1.2; camCfg.y = 11.0; camCfg.z = 2.5; camCfg.fov = 47;
    } else if (isTablet) {
      layout.machine = [-1.8, 0, 3.0];
      layout.logo = [2.0, 0.01, -3.2];
      layout.mobile = false;
      camCfg.x = 2.5; camCfg.y = 11.0; camCfg.z = 3.5; camCfg.fov = 43;
    } else if (w <= 1024) {
      layout.machine = [-2.4, 0, 3.2];
      layout.logo = [2.8, 0.01, -3.5];
      layout.mobile = false;
      camCfg.x = 3.5; camCfg.y = 10.0; camCfg.z = 4.2; camCfg.fov = 41;
    } else if (w <= 1440) {
      layout.machine = [-2.8, 0, 3.5];
      layout.logo = [3.2, 0.01, -3.8];
      layout.mobile = false;
      camCfg.x = 4.2; camCfg.y = 9.5; camCfg.z = 5.0; camCfg.fov = 40;
    } else {
      layout.machine = [-2.8, 0, 3.5];
      layout.logo = [3.2, 0.01, -3.8];
      layout.mobile = false;
      camCfg.x = 4.0; camCfg.y = 9.0; camCfg.z = 4.8; camCfg.fov = 38;
    }

    // Rebuild cable curve for new positions
    cableCurve = new CatmullRomCurve3(buildCablePoints(layout.machine, layout.logo));
    camCfg.dirty = true;
  }, [size]);

  // Apply inside useFrame — avoids React compiler mutation errors.
  useFrame(({ camera }) => {
    if (!camCfg.dirty) return;
    camCfg.dirty = false;
    const mx = layout.machine[0], mz = layout.machine[2];
    const lx = layout.logo[0], lz = layout.logo[2];
    const lookX = (mx + lx) / 2;
    const lookZ = (mz + lz) / 2;
    camera.position.set(camCfg.x, camCfg.y, camCfg.z);
    camera.fov = camCfg.fov;
    camera.lookAt(lookX, 0.0, lookZ);
    camera.updateProjectionMatrix();
  });

  return null;
}

/* ─────────────────────────────────────────────
   Canvas Wrapper
   ───────────────────────────────────────────── */
function TransformCanvas({ active }) {
  const [webglFailed, setWebglFailed] = useState(false);

  const onContextLost = useCallback((e) => {
    e.preventDefault();
    setWebglFailed(true);
  }, []);

  if (webglFailed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#111116]">
        <p className="text-center text-sm text-white/50 px-4">3D preview unavailable on this device</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {active ? (
        <Canvas
          camera={{ fov: 40, near: 0.1, far: 60 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          dpr={[1, 1.5]}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', onContextLost);
          }}
        >
          <CameraRig />
          <AnimationController isPlaying={active} />
          <Suspense fallback={null}>
            <TransformScene />
          </Suspense>
        </Canvas>
      ) : (
        <div className="h-full w-full bg-[#111116]" />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section (IntersectionObserver auto-play)
   ───────────────────────────────────────────── */
export default function TransformSection() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden">
      <TransformCanvas active={isVisible} />
    </section>
  );
}
