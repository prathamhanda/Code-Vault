import React from "react";
import { Play, Coins, User } from "lucide-react";

const Navbar = ({ onRun, score, disabled, teamName }) => {
  return (
    <div className="h-16 bg-dark-900 border-b border-neon-cyan/30 flex items-center justify-between px-6 shadow-[0_0_15px_rgba(0,255,255,0.1)] relative z-10">
      {/* LEFT: BRAND & TEAM */}
      <div className="flex items-center gap-4">
        <div className="w-2 h-8 bg-neon-cyan animate-pulse"></div>
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white leading-none">
            CODE <span className="text-neon-cyan">VAULT</span>
          </h1>
          {/* DISPLAY TEAM NAME */}
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mt-1">
            <User className="w-3 h-3" />
            <span className="uppercase tracking-widest text-neon-green">
              {teamName || "UNKNOWN AGENT"}
            </span>
          </div>
        </div>
      </div>

      {/* CENTER: SCORE */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 px-6 py-2 rounded border border-dark-700 shadow-inner">
        <Coins className="text-yellow-400 w-5 h-5" />
        <span className="text-yellow-400 font-mono text-2xl font-bold">
          {score}
        </span>
      </div>

      {/* RIGHT: RUN BUTTON */}
      <button
        onClick={!disabled ? onRun : undefined}
        disabled={disabled}
        className={`
            flex items-center gap-2 px-6 py-2 rounded font-bold transition-all duration-200
            ${
              disabled
                ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                : "bg-neon-cyan text-black hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] border border-neon-cyan"
            }
        `}
      >
        <Play
          className={`w-4 h-4 ${disabled ? "fill-gray-500" : "fill-black"}`}
        />
        RUN SEQUENCE
      </button>
    </div>
  );
};

export default Navbar;
