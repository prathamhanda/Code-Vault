import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Lock,
  Activity,
  Zap,
  Crown,
  Star,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { API_BASE_URL } from "../apiBase";

const Leaderboard = () => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPodium, setShowPodium] = useState(false);

  // Admin state
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState("");

  // Reset Game
  const handleStartOver = async () => {
    if (!window.confirm("WARNING: This will RESET score for ALL teams. Continue?")) return;

    setResetting(true);
    setResetError("");

    try {
      const adminId = localStorage.getItem("teamId");

      const res = await fetch(`${API_BASE_URL}/api/admin/reset-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });

      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!res.ok) {
        throw new Error(data.message || "Reset Failed");
      }

      localStorage.removeItem("teamId");
      localStorage.removeItem("isAdmin");
      navigate("/");
    } catch (e) {
      setResetError(e.message || "Reset Failed");
    } finally {
      setResetting(false);
    }
  };

  // End Game
  const handleEndGame = async () => {
    if (!window.confirm("WARNING: This will TERMINATE the event for all participants. Continue?")) return;

    setEnding(true);
    setEndError("");

    try {
      const adminId = localStorage.getItem("teamId");

      const res = await fetch(`${API_BASE_URL}/api/admin/end-game`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });

      const raw = await res.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!res.ok) {
        throw new Error(data.message || "End Game Failed");
      }
    } catch (e) {
      setEndError(e.message || "End Game Failed");
    } finally {
      setEnding(false);
    }
  };

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/leaderboard`);
        const data = await res.json();
        if (Array.isArray(data)) setTeams(data);
      } catch (e) {
        console.error("Leaderboard fetch failed");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-cyan-400">
        <div className="animate-pulse font-mono tracking-widest">
          INITIALIZING GLOBAL RANKING SYSTEM...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-gray-950 text-white">
      {/* Header */}
      <div className="p-8 flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black flex items-center gap-3">
            <Crown className="text-yellow-400" />
            LEADERBOARD
          </h1>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Activity className="text-green-400" />
            Live updates every 2 seconds
          </div>
        </div>

        {teams.length >= 3 && (
          <button
            onClick={() => setShowPodium(!showPodium)}
            className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 px-4 py-2 rounded-xl"
          >
            {showPodium ? <EyeOff /> : <Eye />}
            {showPodium ? "Show All" : "Podium Mode"}
          </button>
        )}
      </div>

      {/* Rankings */}
      <div className="max-w-6xl mx-auto px-4 space-y-3">
        {!showPodium &&
          teams.map((team, index) => (
            <div
              key={team.teamId}
              className="flex items-center gap-4 bg-slate-900/40 border border-slate-700/50 rounded-xl p-4"
            >
              <div className="text-3xl font-black w-16 text-center">#{index + 1}</div>

              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-black">
                {team.teamId[0].toUpperCase()}
              </div>

              <div className="flex-1">
                <div className="font-bold flex items-center gap-2">
                  {team.teamId}
                  {index < 3 && <Star className="text-yellow-400 w-4 h-4" />}
                </div>
                <div className="text-xs text-gray-500">Level {team.currentLevel}</div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black">{team.score.toLocaleString()}</div>
                <div className="text-xs text-gray-500">PTS</div>
              </div>

              {team.isLocked ? (
                <Lock className="text-red-400" />
              ) : (
                <Zap className="text-green-400" />
              )}
            </div>
          ))}
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="max-w-xl mx-auto mt-12 p-6 bg-slate-900/40 border border-slate-700/50 rounded-2xl">
          <div className="text-center text-emerald-300 tracking-widest font-bold mb-4">
            ADMIN CONTROLS
          </div>

          {resetError && <div className="text-red-400 text-sm mb-2">{resetError}</div>}
          {endError && <div className="text-red-400 text-sm mb-2">{endError}</div>}

          <div className="flex gap-4">
            <button
              onClick={handleStartOver}
              disabled={resetting || ending}
              className="flex-1 py-3 rounded-xl bg-cyan-400 text-black font-black"
            >
              {resetting ? "RESETTING..." : "START OVER"}
            </button>

            <button
              onClick={handleEndGame}
              disabled={ending || resetting}
              className="flex-1 py-3 rounded-xl bg-red-500 text-black font-black"
            >
              {ending ? "ENDING..." : "END GAME"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
