export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <div className="w-12 h-12 flex items-center justify-center bg-red-500/20 rounded-lg border-2 border-red-500 filter drop-shadow-lg hover:drop-shadow-xl transition-all duration-300">
          <span className="text-red-500 font-bold text-lg">RX</span>
        </div>
        <div className="absolute inset-0 w-12 h-12 border-2 border-red-500/30 rounded-lg animate-pulse opacity-50"></div>
      </div>
      <div className="relative">
        <h1 className="text-2xl font-bold font-mono text-glow animate-glitch">
          ROMEL XITERS
        </h1>
      </div>
    </div>
  );
}