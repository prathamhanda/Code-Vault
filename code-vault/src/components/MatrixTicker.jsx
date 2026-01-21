import React from "react";

const MatrixTicker = () => {
  // We duplicate the text multiple times to ensure a seamless infinite loop
  const content = (
    <>
      <span className="text-white font-black text-xl tracking-tighter mx-8 drop-shadow-[0_0_5px_rgba(0,229,255,0.8)]">
        LEAD
      </span>
      <span className="text-gray-700 mx-4 text-sm font-mono">///</span>
      <span className="text-neon-cyan font-mono font-bold tracking-[0.2em] mx-8">
        MATRIX 4.0
      </span>
      <span className="text-gray-700 mx-4 text-sm font-mono">///</span>
    </>
  );

  return (
    // Fixed at the top, transparent background with blur
    <div className="absolute top-0 left-0 w-full z-50 h-16 flex items-center overflow-hidden border-b border-white/5 bg-black/20 backdrop-blur-sm">
      {/* Left Fade (Makes text appear smoothly) */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

      {/* Right Fade (Makes text disappear smoothly) */}
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none"></div>

      {/* The Scrolling Track */}
      <div className="flex whitespace-nowrap animate-marquee">
        {/* We render the content 20 times to fill large screens */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="flex items-center">
            {content}
          </div>
        ))}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          display: flex;
          min-width: 200%;
        }
      `}</style>
    </div>
  );
};

export default MatrixTicker;
