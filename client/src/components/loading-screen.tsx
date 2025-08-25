import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          setTimeout(() => onComplete(), 400);
          return 100;
        }
        // Much faster progress increments
        const increment = Math.random() * 15 + 10; // 10-25% increments
        return Math.min(prev + increment, 100);
      });
    }, 80); // Much faster update interval

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-500 ${
      isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      {/* Simple background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-red-900/10"></div>

      <div className="relative z-10 text-center">
        {/* Logo with animations */}
        <div className="relative mb-8 animate-fade-in-up">
          <div className="relative w-36 h-36 mx-auto mb-8">
            {/* Rotating rings */}
            <div className="absolute inset-0 border-2 border-red-500/20 rounded-full animate-ring-pulse"></div>
            <div className="absolute inset-3 border border-red-400/30 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '8s' }}></div>
            <div className="absolute inset-6 border border-red-300/20 rounded-full animate-spin" style={{ animationDuration: '12s' }}></div>
            
            {/* Main logo */}
            <div className="absolute inset-8 flex items-center justify-center">
              <div className="w-20 h-20 flex items-center justify-center bg-red-500/20 rounded-full border-2 border-red-500 animate-logo-spin">
                <span className="text-red-500 font-bold text-lg">AC</span>
              </div>
            </div>

            {/* Glowing effect layers */}
            <div className="absolute inset-0 bg-red-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute inset-4 bg-red-600/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
          </div>

          {/* Brand name with refined glitch effect */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h1 className="text-5xl font-bold font-mono text-white mb-3 animate-glitch">
              ADI CHEATS
            </h1>
            <p className="text-red-400 text-lg font-medium tracking-wider opacity-80">
              GAMING SOLUTIONS
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-96 mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-between text-sm text-gray-300 mb-3 font-medium">
            <span className="tracking-wide">Loading System</span>
            <span className="text-red-400 font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-900/80 rounded-full h-3 overflow-hidden border border-red-500/20 backdrop-blur-sm">
            <div 
              className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 h-full rounded-full transition-all duration-500 ease-out relative animate-progress-glow"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              <div className="absolute top-0 right-0 w-4 h-full bg-gradient-to-l from-white/50 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-gray-400 text-sm animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
          <div className="flex items-center justify-center space-x-2">
            <span className="font-medium tracking-wide">Initializing Gaming Environment</span>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}