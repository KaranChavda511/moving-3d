'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Deterministic pseudo-random number generator (seeded)
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Sky gradient sphere - custom shader
function Sky({ scrollProgress }) {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0001;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = scrollProgress;
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} scale={100}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        side={THREE.BackSide}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: scrollProgress },
        }}
        vertexShader={`
          varying vec3 vPosition;
          void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uProgress;
          varying vec3 vPosition;

          void main() {
            float gradient = (vPosition.y + 1.0) * 0.5;

            vec3 blue1Top = vec3(0.10, 0.12, 0.60);
            vec3 blue1Bot = vec3(0.40, 0.52, 0.90);
            vec3 blue2Top = vec3(0.18, 0.18, 0.62);
            vec3 blue2Bot = vec3(0.58, 0.52, 0.80);
            vec3 sunsetTop = vec3(0.42, 0.28, 0.55);
            vec3 sunsetBot = vec3(0.80, 0.62, 0.55);
            vec3 warmTop = vec3(0.72, 0.45, 0.35);
            vec3 warmBot = vec3(0.88, 0.68, 0.55);
            vec3 pinkTop = vec3(0.75, 0.42, 0.35);
            vec3 pinkBot = vec3(0.85, 0.60, 0.48);

            vec3 topColor, botColor;

            if (uProgress < 0.2) {
              float t = uProgress / 0.2;
              topColor = mix(blue1Top, blue2Top, t);
              botColor = mix(blue1Bot, blue2Bot, t);
            } else if (uProgress < 0.4) {
              float t = (uProgress - 0.2) / 0.2;
              topColor = mix(blue2Top, sunsetTop, t);
              botColor = mix(blue2Bot, sunsetBot, t);
            } else if (uProgress < 0.65) {
              float t = (uProgress - 0.4) / 0.25;
              topColor = mix(sunsetTop, warmTop, t);
              botColor = mix(sunsetBot, warmBot, t);
            } else if (uProgress < 0.85) {
              float t = (uProgress - 0.65) / 0.2;
              topColor = mix(warmTop, pinkTop, t);
              botColor = mix(warmBot, pinkBot, t);
            } else {
              topColor = pinkTop;
              botColor = pinkBot;
            }

            vec3 skyColor = mix(botColor, topColor, gradient);
            gl_FragColor = vec4(skyColor, 1.0);
          }
        `}
      />
    </mesh>
  );
}

// Cloud component - tints with sky color
function CloudMesh({ position, scale = 1, scrollProgress }) {
  const materialRefs = useRef([]);
  // Pre-allocate color object
  const targetColor = useMemo(() => new THREE.Color(), []);

  const getCloudColor = (progress) => {
    if (progress < 0.25) return targetColor.setRGB(0.92, 0.92, 0.98);
    if (progress < 0.45) return targetColor.setRGB(0.78, 0.72, 0.88);
    if (progress < 0.65) return targetColor.setRGB(0.85, 0.75, 0.78);
    if (progress < 0.80) return targetColor.setRGB(0.92, 0.82, 0.75);
    return targetColor.setRGB(0.95, 0.88, 0.85);
  };

  useFrame(() => {
    const color = getCloudColor(scrollProgress);
    materialRefs.current.forEach((mat) => {
      if (mat) mat.color.lerp(color, 0.05);
    });
  });

  const setRef = (index) => (ref) => {
    if (ref) materialRefs.current[index] = ref;
  };

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial ref={setRef(0)} color="white" transparent opacity={0.9} roughness={1} />
      </mesh>
      <mesh position={[0.5, 0.1, 0.2]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial ref={setRef(1)} color="white" transparent opacity={0.85} roughness={1} />
      </mesh>
      <mesh position={[-0.5, 0.05, -0.1]}>
        <sphereGeometry args={[0.45, 12, 12]} />
        <meshStandardMaterial ref={setRef(2)} color="white" transparent opacity={0.85} roughness={1} />
      </mesh>
      <mesh position={[0.2, 0.3, 0]}>
        <sphereGeometry args={[0.4, 12, 12]} />
        <meshStandardMaterial ref={setRef(3)} color="white" transparent opacity={0.8} roughness={1} />
      </mesh>
      <mesh position={[-0.2, 0.25, 0.3]}>
        <sphereGeometry args={[0.35, 12, 12]} />
        <meshStandardMaterial ref={setRef(4)} color="white" transparent opacity={0.8} roughness={1} />
      </mesh>
    </group>
  );
}

// Airplane - loads GLB directly with Three.js GLTFLoader (no drei)
function Airplane({ curve, scrollProgress }) {
  const meshRef = useRef();
  const currentRoll = useRef(0);
  const { camera } = useThree();
  const modelContainerRef = useRef(null);
  const modelObjRef = useRef(null);

  // Pre-allocate reusable objects to avoid GC pressure in useFrame
  const _forward = useMemo(() => new THREE.Vector3(), []);
  const _rollQuat = useMemo(() => new THREE.Quaternion(), []);
  const _forwardAxis = useMemo(() => new THREE.Vector3(), []);

  // Load GLB model using Three.js GLTFLoader directly, add to container imperatively
  useEffect(() => {
    const container = modelContainerRef.current;
    const loader = new GLTFLoader();
    loader.load('/models/Airplane.glb', (gltf) => {
      const scene = gltf.scene;
      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const s = maxDim > 0 ? 1 / maxDim : 0.01;
      scene.scale.set(s, s, s);
      scene.rotation.set(0, Math.PI, 0);
      modelObjRef.current = scene;
      if (container) {
        container.add(scene);
      }
    });
    return () => {
      if (modelObjRef.current && container) {
        container.remove(modelObjRef.current);
      }
    };
  }, []);

  // Float bobbing state
  const bobOffset = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Position in front of camera
    _forward.set(0, -0.08, -2.5);
    _forward.applyQuaternion(camera.quaternion);
    meshRef.current.position.copy(camera.position).add(_forward);
    meshRef.current.quaternion.copy(camera.quaternion);

    // Banking/tilt from curve direction
    const progress = Math.max(0, Math.min(1, scrollProgress));
    const ahead = Math.min(1, progress + 0.03);
    const behind = Math.max(0, progress - 0.03);
    const pointAhead = curve.getPointAt(ahead);
    const pointBehind = curve.getPointAt(behind);
    const lateralDelta = pointAhead.x - pointBehind.x;
    const targetRoll = -lateralDelta * 0.5;
    currentRoll.current += (targetRoll - currentRoll.current) * 0.03;

    _forwardAxis.set(0, 0, -1).applyQuaternion(camera.quaternion).normalize();
    _rollQuat.setFromAxisAngle(_forwardAxis, currentRoll.current);
    meshRef.current.quaternion.premultiply(_rollQuat);

    // Manual Float replacement - sin-wave bobbing
    const m = modelObjRef.current;
    if (m) {
      bobOffset.current = Math.sin(time * 2) * 0.08;
      m.position.y = bobOffset.current;
      // Subtle rotation wobble
      m.rotation.x = Math.sin(time * 3.5) * 0.03;
      m.rotation.z = Math.cos(time * 4.2) * 0.03;
    }
  });

  return (
    <group ref={meshRef}>
      <group ref={modelContainerRef} />
    </group>
  );
}

// Main experience
export default function AtmosExperience({ scrollProgress }) {
  const { camera } = useThree();

  // Pre-allocate reusable objects for camera animation
  const _targetQuat = useMemo(() => new THREE.Quaternion(), []);
  const _tempCam = useMemo(() => {
    const cam = new THREE.PerspectiveCamera();
    return cam;
  }, []);

  // Flight path curve
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.8, 0.5, -10),
      new THREE.Vector3(-1.5, 1.2, -20),
      new THREE.Vector3(1.2, 2.0, -30),
      new THREE.Vector3(-0.8, 1.5, -40),
      new THREE.Vector3(2.0, 2.5, -50),
      new THREE.Vector3(-1.2, 2.0, -60),
      new THREE.Vector3(0.6, 3.0, -70),
      new THREE.Vector3(-1.5, 2.5, -80),
      new THREE.Vector3(0.3, 3.5, -90),
      new THREE.Vector3(1.0, 2.8, -100),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, []);

  // Generate clouds along path (deterministic)
  const clouds = useMemo(() => {
    const rng = seededRandom(42);
    const cloudArray = [];
    const numClouds = 45;

    for (let i = 0; i < numClouds; i++) {
      const t = i / numClouds;
      const pointOnPath = curve.getPointAt(t);

      let offsetX = (rng() - 0.5) * 30;
      let offsetY = (rng() - 0.5) * 12;
      if (Math.abs(offsetX) < 3) {
        offsetX = offsetX > 0 ? offsetX + 3 : offsetX - 3;
      }

      cloudArray.push({
        position: [
          pointOnPath.x + offsetX,
          pointOnPath.y + offsetY,
          pointOnPath.z + (rng() - 0.5) * 20,
        ],
        scale: 0.8 + rng() * 1.8,
      });
    }
    return cloudArray;
  }, [curve]);

  // Camera moves along curve based on scroll
  useFrame(() => {
    const progress = Math.max(0, Math.min(1, scrollProgress));
    const pos = curve.getPointAt(progress);
    const lookAhead = Math.min(1, progress + 0.025);
    const lookAtPos = curve.getPointAt(lookAhead);

    camera.position.lerp(pos, 0.05);

    _tempCam.position.copy(pos);
    _tempCam.lookAt(lookAtPos);
    _targetQuat.copy(_tempCam.quaternion);
    camera.quaternion.slerp(_targetQuat, 0.05);
  });

  return (
    <>
      <Sky scrollProgress={scrollProgress} />

      {/* Lighting */}
      <ambientLight intensity={1.2} color="#ccd8ff" />
      <directionalLight position={[5, 10, -5]} intensity={1.5} color="#ffffff" />
      <hemisphereLight skyColor="#aabbff" groundColor="#ffd4b0" intensity={0.8} />

      {/* Airplane with manual bobbing */}
      <Airplane curve={curve} scrollProgress={scrollProgress} />

      {/* Clouds */}
      {clouds.map((cloud, idx) => (
        <CloudMesh
          key={idx}
          position={cloud.position}
          scale={cloud.scale}
          scrollProgress={scrollProgress}
        />
      ))}
    </>
  );
}
