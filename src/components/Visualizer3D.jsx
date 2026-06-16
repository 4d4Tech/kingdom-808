import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useAudio } from '../context/AudioProvider';

// A simple immersive particle field that changes based on genre
const GenreAtmosphere = ({ genre, isPlaying }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current && isPlaying) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  // Different colors based on genre token
  const getColor = () => {
    switch(genre) {
      case 'Glowstep': return '#fed65b';
      case 'Heirwave': return '#94ccff';
      case 'ZionDrill': return '#ba1a1a';
      case 'Antha': return '#0077b6';
      case 'ZionSoul': return '#e9c349';
      case 'Rhema&B': return '#6a7278';
      case 'Upperground': return '#005d90';
      default: return '#0077b6';
    }
  };

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[2, 1]} />
      <meshStandardMaterial color={getColor()} wireframe={true} />
    </mesh>
  );
};

const Visualizer3D = () => {
  const { currentTrack, isPlaying } = useAudio();

  // If no track is playing, we can show a default subtle atmosphere
  const genre = currentTrack ? currentTrack.genre : 'Unknown';

  return (
    <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <GenreAtmosphere genre={genre} isPlaying={isPlaying} />
      </Canvas>
    </div>
  );
};

export default Visualizer3D;
