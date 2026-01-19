import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Radio } from "lucide-react";

const WaitingRoom = () => {
  const navigate = useNavigate();
  const [dots, setDots] = useState("");

  // 1. Animation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // 2. The Polling Logic (Checks server every 2 seconds)
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/game-status");
        const data = await res.json();
        if (data.started) {
          navigate("/game");
        }
      } catch (err) {
        console.error("Server unreachable");
      }
    };

    const poller = setInterval(checkStatus, 2000);
    return () => clearInterval(poller);
  }, [navigate]);

  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-neon-cyan font-mono relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

      <div className="z-10 flex flex-col items-center gap-6 p-10 border border-dark-700 bg-dark-900/50 backdrop-blur-md rounded-xl shadow-2xl animate-pulse">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-cyan blur-xl opacity-20 animate-ping"></div>
          <Lock className="w-16 h-16 text-neon-cyan relative z-10" />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-[0.2em] text-white mb-2">
            SYSTEM STANDBY
          </h1>
          <p className="text-sm text-gray-400">AWAITING ADMIN UPLINK{dots}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neon-green border border-neon-green/30 px-3 py-1 rounded-full bg-neon-green/5">
          <Radio className="w-3 h-3 animate-pulse" />
          SIGNAL ESTABLISHED
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
