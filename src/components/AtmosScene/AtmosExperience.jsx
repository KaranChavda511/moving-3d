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
function Sky({ scrollRef }) {
  const meshRef = useRef();
  const materialRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0001;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uProgress.value = scrollRef.current;
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
          uProgress: { value: 0 },
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

// Cloud GLB model - loaded once, cloned for each instance
let _cloudModelCache = null;
let _cloudModelLoading = false;
const _cloudModelCallbacks = [];
let _cloudModelRefCount = 0;

function loadCloudModel(callback) {
  _cloudModelRefCount++;
  if (_cloudModelCache) {
    callback(_cloudModelCache);
    return;
  }
  _cloudModelCallbacks.push(callback);
  if (_cloudModelLoading) return;
  _cloudModelLoading = true;
  const loader = new GLTFLoader();
  loader.load('/models/Cloud.glb', (gltf) => {
    const scene = gltf.scene;
    // Auto-scale to ~1 unit
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 1 / maxDim : 0.01;
    scene.scale.set(s, s, s);
    _cloudModelCache = scene;
    _cloudModelCallbacks.forEach((cb) => cb(scene));
    _cloudModelCallbacks.length = 0;
  });
}

function releaseCloudModel() {
  _cloudModelRefCount--;
  if (_cloudModelRefCount <= 0 && _cloudModelCache) {
    _cloudModelCache.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
    });
    _cloudModelCache = null;
    _cloudModelLoading = false;
    _cloudModelRefCount = 0;
  }
}

function CloudMesh({ position, scale = 1, scrollRef }) {
  const groupRef = useRef();
  const materialsRef = useRef([]);
  const targetColor = useMemo(() => new THREE.Color(), []);

  const getCloudColor = (progress) => {
    if (progress < 0.25) return targetColor.setRGB(0.92, 0.92, 0.98);
    if (progress < 0.45) return targetColor.setRGB(0.78, 0.72, 0.88);
    if (progress < 0.65) return targetColor.setRGB(0.85, 0.75, 0.78);
    if (progress < 0.80) return targetColor.setRGB(0.92, 0.82, 0.75);
    return targetColor.setRGB(0.95, 0.88, 0.85);
  };

  useEffect(() => {
    const container = groupRef.current;
    let clone = null;
    loadCloudModel((original) => {
      if (!container) return;
      clone = original.clone(true);
      // Collect all materials for color tinting
      clone.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone();
          child.material.transparent = true;
          child.material.opacity = 0.9;
          child.material.roughness = 1;
          materialsRef.current.push(child.material);
        }
      });
      container.add(clone);
    });
    return () => {
      if (clone && container) {
        container.remove(clone);
        materialsRef.current.forEach((mat) => mat.dispose());
        materialsRef.current = [];
      }
      releaseCloudModel();
    };
  }, []);

  useFrame(() => {
    const color = getCloudColor(scrollRef.current);
    materialsRef.current.forEach((mat) => {
      mat.color.lerp(color, 0.05);
    });
  });

  return <group ref={groupRef} position={position} scale={scale} />;
}

// Airplane - loads GLB directly with Three.js GLTFLoader (no drei)
function Airplane({ curve, scrollRef }) {
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
    const progress = Math.max(0, Math.min(1, scrollRef.current));
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
export default function AtmosExperience({ scrollRef }) {
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
  // Clouds are placed close to the flight path so you fly through them
  const clouds = useMemo(() => {
    const rng = seededRandom(42);
    const cloudArray = [];

    // Close clouds — directly around the path, you fly past these
    for (let i = 0; i < 50; i++) {
      const t = i / 50;
      const pointOnPath = curve.getPointAt(t);

      // Place on left or right side of path, close but not blocking
      const side = rng() > 0.5 ? 1 : -1;
      const dist = 2.5 + rng() * 5; // 2.5–7.5 units from path
      const offsetX = side * dist;
      const offsetY = (rng() - 0.5) * 4; // slight vertical variation
      const offsetZ = (rng() - 0.5) * 8; // slight depth stagger

      cloudArray.push({
        position: [
          pointOnPath.x + offsetX,
          pointOnPath.y + offsetY,
          pointOnPath.z + offsetZ,
        ],
        scale: 1.0 + rng() * 2.5, // big, close clouds
      });
    }

    // Mid-distance clouds — further out, fill the sky
    for (let i = 0; i < 30; i++) {
      const t = i / 30;
      const pointOnPath = curve.getPointAt(t);

      const side = rng() > 0.5 ? 1 : -1;
      const dist = 8 + rng() * 12; // 8–20 units from path
      const offsetY = (rng() - 0.5) * 10;
      const offsetZ = (rng() - 0.5) * 15;

      cloudArray.push({
        position: [
          pointOnPath.x + side * dist,
          pointOnPath.y + offsetY,
          pointOnPath.z + offsetZ,
        ],
        scale: 0.5 + rng() * 1.5, // smaller, distant clouds
      });
    }

    return cloudArray;
  }, [curve]);

  // Camera moves along curve based on scroll
  useFrame(() => {
    const progress = Math.max(0, Math.min(1, scrollRef.current));
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
      <Sky scrollRef={scrollRef} />

      {/* Lighting */}
      <ambientLight intensity={1.2} color="#ccd8ff" />
      <directionalLight position={[5, 10, -5]} intensity={1.5} color="#ffffff" />
      <hemisphereLight skyColor="#aabbff" groundColor="#ffd4b0" intensity={0.8} />

      {/* Airplane with manual bobbing */}
      <Airplane curve={curve} scrollRef={scrollRef} />

      {/* Clouds */}
      {clouds.map((cloud, idx) => (
        <CloudMesh
          key={idx}
          position={cloud.position}
          scale={cloud.scale}
          scrollRef={scrollRef}
        />
      ))}
    </>
  );
}
