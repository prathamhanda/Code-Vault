import React from "react";
import { AlertOctagon, Radio } from "lucide-react";

const Terminated = () => {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-neon-cyan font-mono relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

      <div className="z-10 flex flex-col items-center gap-6 p-10 border border-red-500/40 bg-dark-900/50 backdrop-blur-md rounded-xl shadow-2xl">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 animate-ping"></div>
          <AlertOctagon className="w-16 h-16 text-red-500 relative z-10" />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-[0.2em] text-white mb-2">
            SEQUENCE TERMINATED
          </h1>
          <p className="text-sm text-gray-400">
            ADMIN HAS TERMINATED THE SEQUENCE.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-red-400 border border-red-500/30 px-3 py-1 rounded-full bg-red-500/5">
          <Radio className="w-3 h-3 animate-pulse" />
          CONNECTION CLOSED
        </div>

        <div className="text-[11px] text-gray-500 text-center max-w-sm leading-relaxed">
          Please wait for an admin to reopen the event. You can close this tab.
        </div>
      </div>
    </div>
  );
};

export default Terminated;
