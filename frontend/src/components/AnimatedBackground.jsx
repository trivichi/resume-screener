import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingParticles() {
  const ref = useRef();
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      temp.push(x, y, z);
    }
    return new Float32Array(temp);
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime * 0.075;
    }
  });

  return (
    <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function FloatingDocuments() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 5) * Math.PI * 2) * 3,
            Math.sin((i / 5) * Math.PI * 4) * 2,
            Math.sin((i / 5) * Math.PI * 2) * 3,
          ]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          <planeGeometry args={[0.6, 0.8]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.15}
            emissive="#667eea"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10" style={{ width: '100vw', height: '100vh' }}>
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <FloatingParticles />
        <FloatingDocuments />
      </Canvas>
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-slate-900/40 pointer-events-none" />
    </div>
  );
}