import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, Radio } from "lucide-react";
import { API_BASE_URL } from "../apiBase";

const WaitingRoom = () => {
  const navigate = useNavigate();
  const [dots, setDots] = useState("");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const isAdmin = localStorage.getItem("isAdmin") === "true";

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
        const res = await fetch(`${API_BASE_URL}/api/game-status`);
        const data = await res.json();
        if (data.started) {
          navigate(isAdmin ? "/leaderboard" : "/game");
        }
      } catch (err) {
        console.error("Server unreachable");
      }
    };

    const poller = setInterval(checkStatus, 2000);
    return () => clearInterval(poller);
  }, [navigate]);

  const handleStartGame = async () => {
    setStartError("");
    setStarting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/start-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: localStorage.getItem("teamId") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStartError(data.message || "START REQUEST DENIED");
        return;
      }
      navigate("/leaderboard");
    } catch (e) {
      setStartError("SERVER UNREACHABLE");
    } finally {
      setStarting(false);
    }
  };

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

      {isAdmin && (
        <div className="z-10 mt-6 w-full max-w-md px-10">
          <div className="border border-dark-700 bg-dark-900/50 backdrop-blur-md rounded-xl p-6 shadow-2xl">
            <div className="text-center mb-4">
              <h2 className="text-xs tracking-[0.3em] text-neon-green font-bold">
                ADMIN CONSOLE
              </h2>
              <p className="text-[11px] text-gray-500 mt-1">
                Authorize uplink to initiate the event.
              </p>
            </div>

            {startError && (
              <div className="text-center text-xs text-red-500 bg-red-500/10 border border-red-500/20 py-2 rounded mb-4">
                {startError}
              </div>
            )}

            <button
              onClick={handleStartGame}
              disabled={starting}
              className={`w-full py-4 rounded-lg font-black tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                starting
                  ? "bg-gray-800 text-gray-500 cursor-wait"
                  : "bg-neon-cyan text-black hover:bg-white hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,255,0.3)]"
              }`}
            >
              {starting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> INITIATING...
                </>
              ) : (
                "START GAME"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitingRoom;
