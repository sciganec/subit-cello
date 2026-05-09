import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = {
  ME: "#d58f61",
  WE: "#527d63",
  YOU: "#82a6b1",
  THEY: "#6b7280",
};

const WHO_LABELS = {
  ME: "Інструмент",
  WE: "Школа",
  YOU: "Діалог",
  THEY: "Система",
};

function Node({ position, who, entry, isHovered, onHover, onSelect }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (isHovered) {
      meshRef.current.scale.setScalar(1.5 + Math.sin(state.clock.elapsedTime * 10) * 0.1);
    } else {
      meshRef.current.scale.setScalar(1);
    }
  });

  return (
    <group 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { onHover(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); onSelect(entry); }}
    >
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color={COLORS[who]} 
          emissive={COLORS[who]} 
          emissiveIntensity={isHovered ? 2 : 0.5} 
        />
      </mesh>
      
      {isHovered && entry && (
        <Html distanceFactor={10}>
          <div className="viz-tooltip-react">
            <div style={{ color: COLORS[who], fontWeight: 700 }}>{entry.index}. {entry.label}</div>
            <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '4px' }}>
              {entry.season} · {WHO_LABELS[who]}
            </div>
          </div>
        </Html>
      )}

      {/* Outer Glow */}
      <mesh scale={[2.2, 2.2, 2.2]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color={COLORS[who]} transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function CelloScene({ entries, onSelectNode }) {
  const groupRef = useRef();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useFrame((state) => {
    if (groupRef.current && hoveredIndex === null) {
      groupRef.current.rotation.y += 0.003;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
    }
  });

  const nodes = useMemo(() => {
    const list = [];
    
    // Lower Bout (WE) - Index 17-32
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const side = i < 8 ? 1 : -1;
      const globalIdx = 17 + i;
      list.push({
        pos: [Math.cos(angle) * 2.8, Math.sin(angle) * 2.8 - 3, Math.cos(angle * 2) * 1.6 * side],
        who: "WE",
        entry: entries.find(e => e.index === globalIdx)
      });
    }

    // Upper Bout (ME) - Index 1-16
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const side = i < 8 ? 1 : -1;
      const globalIdx = 1 + i;
      list.push({
        pos: [Math.cos(angle) * 2.0, Math.sin(angle) * 2.0 + 1.2, Math.cos(angle * 2) * 1.2 * side],
        who: "ME",
        entry: entries.find(e => e.index === globalIdx)
      });
    }

    // Waist (YOU) - Index 33-48
    for (let i = 0; i < 16; i++) {
      const side = i < 8 ? 1 : -1;
      const t = (i % 8) / 7;
      const angle = -Math.PI/2 + t * Math.PI;
      const globalIdx = 33 + i;
      list.push({
        pos: [Math.cos(angle) * (1.1 + Math.abs(Math.sin(t * Math.PI)) * 0.5) * side, -1.2 + t * 2.4, Math.sin(angle) * 1.8],
        who: "YOU",
        entry: entries.find(e => e.index === globalIdx)
      });
    }

    // Neck/Strings (THEY) - Index 49-64
    const stringX = [-0.3, -0.1, 0.1, 0.3];
    for (let i = 0; i < 16; i++) {
      const globalIdx = 49 + i;
      if (i < 12) {
        const sIdx = i % 4;
        const yLvl = Math.floor(i / 4);
        list.push({
          pos: [stringX[sIdx], 3.8 + yLvl * 1.3, 0.8 - yLvl * 0.15],
          who: "THEY",
          entry: entries.find(e => e.index === globalIdx)
        });
      } else {
        const t = (i - 12) / 3;
        const angle = t * Math.PI * 3.5;
        const r = 0.2 + t * 0.35;
        list.push({
          pos: [Math.cos(angle) * r, 8.5 + Math.sin(angle) * r, Math.sin(angle) * 0.35],
          who: "THEY",
          entry: entries.find(e => e.index === globalIdx)
        });
      }
    }

    return list;
  }, [entries]);

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <Node 
          key={i} 
          position={n.pos} 
          who={n.who} 
          entry={n.entry}
          isHovered={hoveredIndex === i}
          onHover={(h) => setHoveredIndex(h ? i : null)}
          onSelect={onSelectNode}
        />
      ))}
      
      {/* Visual Bridge */}
      <mesh position={[0, -1, 1.8]}>
        <boxGeometry args={[1.2, 0.4, 0.1]} />
        <meshStandardMaterial color="white" transparent opacity={0.3} metalness={0.8} roughness={0.2} />
      </mesh>

      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.5} />
    </group>
  );
}

export default function CelloViz({ entries, onSelectNode }) {
  return (
    <div className="viz-container" style={{ height: '700px', width: '100%' }}>
      <Canvas camera={{ position: [0, 1.5, 14], fov: 75 }}>
        <ambientLight intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <CelloScene entries={entries} onSelectNode={onSelectNode} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
}
