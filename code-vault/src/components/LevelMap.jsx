import React from "react";
import { CheckCircle2, Circle, Lock } from "lucide-react";

const LevelMap = ({ currentLevel, totalLevels }) => {
  return (
    <div className="flex flex-col h-full bg-dark-800/50 backdrop-blur-md rounded-xl border border-dark-700 overflow-hidden">
      <div className="p-3 border-b border-dark-700 bg-dark-900/80">
        <span className="font-mono text-xs font-bold tracking-widest text-gray-300">
          SYSTEM_PROGRESS
        </span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-800"></div>

          {Array.from({ length: totalLevels }).map((_, index) => {
            const levelNum = index + 1;
            let status = "locked";
            if (levelNum < currentLevel) status = "completed";
            if (levelNum === currentLevel) status = "current";

            return (
              <div
                key={levelNum}
                className="relative flex items-center gap-4 mb-6 last:mb-0"
              >
                {/* Icon Node */}
                <div
                  className={`
                            relative z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 
                            ${
                              status === "completed"
                                ? "bg-neon-green border-neon-green"
                                : status === "current"
                                  ? "bg-neon-cyan border-neon-cyan shadow-[0_0_10px_#00ffff]"
                                  : "bg-dark-900 border-gray-700"
                            }
                        `}
                >
                  {status === "completed" && (
                    <CheckCircle2 className="w-4 h-4 text-black" />
                  )}
                  {status === "current" && (
                    <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                  )}
                  {status === "locked" && (
                    <Lock className="w-3 h-3 text-gray-600" />
                  )}
                </div>

                {/* Text */}
                <div
                  className={`${status === "locked" ? "opacity-30" : "opacity-100"}`}
                >
                  <div className="text-xs font-mono font-bold text-gray-400">
                    LEVEL_0{levelNum}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    {status === "completed"
                      ? "DECRYPTED"
                      : status === "current"
                        ? "IN PROGRESS..."
                        : "ENCRYPTED"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
