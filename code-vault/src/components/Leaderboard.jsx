import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  ShieldAlert,
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

  // ➤ FIX 1: Define the missing Admin state variables to prevent crash
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [ending, setEnding] = useState(false);
  const [endError, setEndError] = useState("");

  // ➤ FIX 2: Define the missing handleStartOver function
  const handleStartOver = async () => {
    if (
      !window.confirm("WARNING: This will RESET score for ALL teams. Continue?")
    )
      return;

    setResetting(true);
    setResetError("");
    try {
      const adminId = localStorage.getItem("teamId");
      const res = await fetch(`${API_BASE_URL}/api/admin/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        throw new Error(
          data.message ||
            `Reset Failed (${res.status}${res.statusText ? ` ${res.statusText}` : ""})`,
        );
      }

      // Hard reset the client session and return to login.
      localStorage.removeItem("teamId");
      localStorage.removeItem("isAdmin");
      navigate("/");
    } catch (e) {
      setResetError(e?.message || "Reset Failed");
    } finally {
      setResetting(false);
    }
  };

  const handleEndGame = async () => {
    if (!window.confirm("WARNING: This will TERMINATE the event for all participants. Continue?")) {
      return;
    }

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
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = {};
      }
      if (!res.ok) {
        throw new Error(
          data.message ||
            `End Game Failed (${res.status}${res.statusText ? ` ${res.statusText}` : ""})`,
        );
      }
      // Keep admin on leaderboard; participants will auto-redirect.
    } catch (e) {
      setEndError(e?.message || "End Game Failed");
    } finally {
      setEnding(false);
    }
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        let url = `${API_BASE_URL}/api/leaderboard`;
        const isAdmin = localStorage.getItem("isAdmin") === "true";
        if (isAdmin) {
          const adminId = localStorage.getItem("teamId");
          url += `?adminId=${encodeURIComponent(adminId)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data)) {
          setTeams(data);
        }
        setLoading(false);
      } catch (e) {
        console.error("Leaderboard Offline");
        setLoading(false); // ➤ FIX 3: Stop loading even if error occurs
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-black via-slate-900 to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-cyan-400 font-mono tracking-widest animate-pulse">
            INITIALIZING GLOBAL RANKING SYSTEM...
          </div>
        </div>
      </div>
    );

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-black via-slate-900 to-gray-950 text-white font-sans relative overflow-hidden">
      {/* Enhanced tech background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.2) 2px, transparent 2px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.2) 2px, transparent 2px),
              linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "100px 100px, 100px 100px, 20px 20px, 20px 20px",
            backgroundPosition: "-2px -2px, -2px -2px, -1px -1px, -1px -1px",
          }}
        ></div>

        {/* Glowing gradient orbs */}
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-blue-600/15 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1.5s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-slate-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "3s" }}
        ></div>

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}

        {/* Circuit board pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="circuit"
              x="0"
              y="0"
              width="200"
              height="200"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="20" cy="20" r="2" fill="#06b6d4" />
              <circle cx="180" cy="180" r="2" fill="#3b82f6" />
              <circle cx="100" cy="100" r="2" fill="#64748b" />
              <line
                x1="20"
                y1="20"
                x2="100"
                y2="20"
                stroke="#06b6d4"
                strokeWidth="0.5"
              />
              <line
                x1="100"
                y1="20"
                x2="180"
                y2="20"
                stroke="#3b82f6"
                strokeWidth="0.5"
              />
              <line
                x1="180"
                y1="20"
                x2="180"
                y2="100"
                stroke="#3b82f6"
                strokeWidth="0.5"
              />
              <line
                x1="180"
                y1="100"
                x2="180"
                y2="180"
                stroke="#64748b"
                strokeWidth="0.5"
              />
              <line
                x1="20"
                y1="20"
                x2="20"
                y2="100"
                stroke="#06b6d4"
                strokeWidth="0.5"
              />
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="180"
                stroke="#64748b"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)" />
        </svg>

        {/* Scanlines */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59, 130, 246, 0.15) 2px, rgba(59, 130, 246, 0.15) 4px)",
          }}
        ></div>
      </div>

      {/* Add floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
      `}</style>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent z-50"></div>

      {/* Fixed Header Section */}
      <div className="flex-none relative z-10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-8 h-8 text-yellow-400 animate-pulse" />
                <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-slate-200 via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                    LEADERBOARD
                  </span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Activity className="w-4 h-4 text-green-400 animate-pulse" />
                <span>Live • Updates every 2 seconds</span>
              </div>
            </div>

            <div className="flex gap-4 items-end">
              {teams.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl px-6 py-4 shadow-2xl shadow-yellow-500/20">
                  <div className="text-xs text-yellow-200/70 uppercase tracking-widest mb-1">
                    Top Score
                  </div>
                  <div className="text-4xl font-black text-yellow-400 flex items-baseline gap-2">
                    {teams[0].score.toLocaleString()}
                    <span className="text-sm text-yellow-200/50">PTS</span>
                  </div>
                </div>
              )}

              {/* Toggle Podium Button */}
              {teams.length >= 3 && (
                <button
                  onClick={() => setShowPodium(!showPodium)}
                  className="bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-xl border border-blue-500/50 rounded-2xl px-6 py-4 shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    {showPodium ? (
                      <EyeOff className="w-5 h-5 text-blue-300" />
                    ) : (
                      <Eye className="w-5 h-5 text-blue-300" />
                    )}
                    <div className="text-sm font-bold text-blue-200">
                      {showPodium ? "Show All" : "Podium Mode"}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-cyan-400">
                {teams.length}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                Total Teams
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-400">
                {teams.filter((t) => !t.isLocked).length}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                Active
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-400">
                {teams.length > 0
                  ? Math.max(...teams.map((t) => t.currentLevel))
                  : 0}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                Max Level
              </div>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
              <div className="text-2xl font-bold text-slate-400">
                {teams.reduce((sum, t) => sum + t.violations, 0)}
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                Total Violations
              </div>
            </div>
          </div>
        </div>

        {/* Podium - Top 3 (Only when showPodium is true) */}
        {showPodium && teams.length >= 3 && (
          <div className="max-w-7xl mx-auto mt-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 mb-2">
                🏆 CHAMPIONS 🏆
              </h2>
              <p className="text-gray-400">
                Congratulations to our top performers!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
              {/* 2nd Place */}
              <div className="flex flex-col items-center order-1 md:order-1">
                <div className="w-full bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-2xl font-black shadow-lg">
                      {teams[1].teamId.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-center mb-2">
                    <div className="text-3xl font-black text-slate-300 mb-1">
                      2nd
                    </div>
                    <div className="font-bold text-white mb-1">
                      {teams[1].teamId}
                    </div>
                    <div className="text-2xl font-black text-slate-300">
                      {teams[1].score.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full border border-cyan-500/30">
                      LVL {teams[1].currentLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center order-2 md:order-2 col-span-3 md:col-span-1">
                <Trophy className="w-8 h-8 text-yellow-400 mb-2 animate-bounce" />
                <div className="w-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 backdrop-blur-xl border-2 border-yellow-400/50 rounded-2xl p-6 shadow-2xl shadow-yellow-500/30 hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl font-black text-slate-900 shadow-xl ring-4 ring-yellow-400/30">
                      {teams[0].teamId.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-center mb-2">
                    <div className="text-4xl font-black text-yellow-400 mb-1">
                      1st
                    </div>
                    <div className="font-bold text-white text-lg mb-1">
                      {teams[0].teamId}
                    </div>
                    <div className="text-3xl font-black text-yellow-400">
                      {teams[0].score.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-xs bg-cyan-500/30 text-cyan-300 px-2 py-1 rounded-full border border-cyan-400/50">
                      LVL {teams[0].currentLevel}
                    </span>
                    <Crown className="w-4 h-4 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center order-3 md:order-3">
                <div className="w-full bg-gradient-to-br from-orange-700/40 to-orange-900/40 backdrop-blur-xl border border-orange-600/50 rounded-2xl p-6 shadow-xl hover:scale-105 transition-transform duration-300">
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                      {teams[2].teamId.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="text-center mb-2">
                    <div className="text-3xl font-black text-orange-400 mb-1">
                      3rd
                    </div>
                    <div className="font-bold text-white mb-1">
                      {teams[2].teamId}
                    </div>
                    <div className="text-2xl font-black text-orange-300">
                      {teams[2].score.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full border border-cyan-500/30">
                      LVL {teams[2].currentLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Rankings Section */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* All Rankings */}
          {!showPodium && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                All Rankings
              </h2>

              {teams.map((team, index) => {
                const isTop3 = index < 3;

                return (
                  <div
                    key={team.teamId}
                    className={`
                      group relative bg-slate-900/40 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                      ${team.isLocked ? "opacity-60 border-red-500/30" : "border-slate-700/50 hover:border-cyan-500/50"}
                      ${isTop3 ? "bg-gradient-to-r from-slate-800/60 to-slate-900/40" : ""}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div
                        className={`
                        text-3xl font-black min-w-[60px] text-center
                        ${index === 0 ? "text-yellow-400" : index === 1 ? "text-slate-300" : index === 2 ? "text-orange-400" : "text-gray-500"}
                      `}
                      >
                        #{index + 1}
                      </div>

                      {/* Avatar */}
                      <div
                        className={`
                        w-14 h-14 rounded-full flex items-center justify-center font-black text-xl shadow-lg flex-shrink-0
                        ${
                          index === 0
                            ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-slate-900"
                            : index === 1
                              ? "bg-gradient-to-br from-slate-400 to-slate-600 text-white"
                              : index === 2
                                ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                                : "bg-slate-700 text-gray-300"
                        }
                      `}
                      >
                        {team.teamId.charAt(0).toUpperCase()}
                      </div>

                      {/* Team Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg text-white truncate flex items-center gap-2">
                          {team.teamId}
                          {index < 3 && (
                            <Star className="w-4 h-4 text-yellow-400" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {team._id.slice(-8)}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">
                            Level
                          </div>
                          <span className="inline-flex items-center justify-center bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-lg text-sm font-bold border border-cyan-500/30">
                            {team.currentLevel}
                          </span>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">
                            Violations
                          </div>
                          <div className="flex gap-1 justify-center">
                            {team.violations === 0 ? (
                              <span className="text-gray-600 text-xs">
                                None
                              </span>
                            ) : (
                              <span className="text-red-400 font-bold">
                                {team.violations}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-xs text-gray-500 mb-1">
                            Status
                          </div>
                          {team.isLocked ? (
                            <span className="inline-flex items-center gap-1 text-red-400 text-xs font-bold">
                              <Lock className="w-3 h-3" /> LOCKED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-green-400 text-xs font-bold">
                              <Zap className="w-3 h-3" /> ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right">
                        <div
                          className={`
                          text-3xl font-black tabular-nums
                          ${isTop3 ? "text-white" : "text-gray-400"}
                        `}
                        >
                          {team.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>

                    {/* Mobile Stats */}
                    <div className="md:hidden flex items-center justify-between mt-3 pt-3 border-t border-slate-700/50 text-sm">
                      <span className="text-cyan-400">
                        LVL {team.currentLevel}
                      </span>
                      <span className="text-gray-400">
                        {team.violations} violations
                      </span>
                      {team.isLocked ? (
                        <span className="text-red-400 text-xs">LOCKED</span>
                      ) : (
                        <span className="text-green-400 text-xs">ACTIVE</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer spacer */}
          {isAdmin && (
            <div className="w-full max-w-3xl mx-auto px-2 sm:px-6 pb-10 mt-10">
              <div className="border border-slate-700/60 bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
                <div className="text-center mb-4">
                  <div className="text-xs tracking-[0.35em] text-emerald-300 font-bold">
                    ADMIN CONTROLS
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Reset the event back to standby.
                  </div>
                </div>

                {resetError && (
                  <div className="text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 py-2 rounded mb-4">
                    {resetError}
                  </div>
                )}

                {endError && (
                  <div className="text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 py-2 rounded mb-4">
                    {endError}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleStartOver}
                    disabled={resetting || ending}
                    className={`flex-1 py-4 rounded-xl font-black tracking-widest text-sm transition-all duration-300 ${
                      resetting || ending
                        ? "bg-slate-800 text-slate-400 cursor-wait"
                        : "bg-cyan-400 text-black hover:bg-white hover:scale-[1.01] shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                    }`}
                  >
                    {resetting ? "RESETTING..." : "START OVER"}
                  </button>

                  <button
                    onClick={handleEndGame}
                    disabled={ending || resetting}
                    className={`flex-1 py-4 rounded-xl font-black tracking-widest text-sm transition-all duration-300 ${
                      ending || resetting
                        ? "bg-slate-800 text-slate-400 cursor-wait"
                        : "bg-red-500 text-black hover:bg-white hover:scale-[1.01] shadow-[0_0_20px_rgba(239,68,68,0.35)]"
                    }`}
                  >
                    {ending ? "ENDING..." : "END GAME"}
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="h-20"></div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
