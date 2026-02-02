import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CyberHand } from './components/CyberHand';
import { GameScene } from './components/GameScene';
import { UI } from './components/UI';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      
      {/* 2D Overlay for Webcam and Hand Skeleton */}
      <CyberHand />
      
      {/* Game UI */}
      <UI />

      {/* 3D Scene */}
      <div className="absolute inset-0 z-10">
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 5, 6], fov: 60 }}
          performance={{ min: 0.6 }}
        >
           <Suspense fallback={null}>
              <GameScene />
           </Suspense>
        </Canvas>
      </div>

      {/* Aesthetic Vignette */}
      <div className="absolute inset-0 pointer-events-none z-20 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))]" style={{backgroundSize: "100% 2px, 3px 100%"}} />

      {/* Footer Credits */}
      <div className="absolute bottom-2 left-0 w-full text-center z-50 pointer-events-auto">
        <p className="text-xs md:text-sm text-gray-500 font-mono tracking-wider">
          Projeto Desenvolvido por <span className="text-cyan-500">Matheus Siqueira</span> — 
          <a 
            href="https://www.matheussiqueira.dev" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="ml-2 text-cyan-400 hover:text-white hover:underline transition-colors"
          >
            Portfolio
          </a>
        </p>
      </div>

    </div>
  );
};

export default App;
