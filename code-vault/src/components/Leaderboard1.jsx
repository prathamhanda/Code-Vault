import React, { useState, useEffect } from "react";
import { Trophy, ShieldAlert, Lock, Activity, Zap } from "lucide-react";
import { API_BASE_URL } from "../apiBase";

const Leaderboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/leaderboard`);
        const data = await res.json();
        setTeams(data);
        setLoading(false);
      } catch (e) {
        console.error("Leaderboard Offline");
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center text-neon-cyan font-mono animate-pulse tracking-widest">
        INITIALIZING GLOBAL RANKING SYSTEM...
      </div>
    );

  return (
    // ➤ MAIN CONTAINER: Flex Column Layout.
    // This forces the "Header" to stay at the top and the "List" to fill the rest.
    <div className="h-screen w-screen flex flex-col bg-dark-900 text-white font-mono relative selection:bg-neon-cyan selection:text-black overflow-hidden">
      {/* GLOBAL BACKGROUND (Fixed) */}
      <div className="fixed inset-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-dark-800 via-black to-black -z-10 pointer-events-none"></div>
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50 z-50 pointer-events-none"></div>

      {/* ➤ TOP SECTION (Fixed Height, Non-Scrolling) */}
      <div className="flex-none px-8 pt-8 pb-4 bg-dark-900/95 backdrop-blur-xl border-b border-gray-800 z-40">
        {/* TITLE ROW */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 mb-2">
              GLOBAL{" "}
              <span className="text-neon-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]">
                LEADERBOARD
              </span>
            </h1>
            <p className="text-gray-400 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-neon-green animate-pulse" />
              LIVE FEED ESTABLISHED • UPDATING T-MINUS 2S
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-4xl font-bold text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">
              {teams.length > 0 ? teams[0].score : 0}{" "}
              <span className="text-sm text-gray-500">PTS</span>
            </div>
            <div className="text-xs text-gray-500 tracking-widest uppercase">
              Current Top Score
            </div>
          </div>
        </div>

        {/* COLUMN HEADERS ROW */}
        <div className="grid grid-cols-12 gap-4 text-xs tracking-widest text-gray-500 uppercase font-bold px-6">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Agent Name (Team)</div>
          <div className="col-span-2 text-center">Level Clearance</div>
          <div className="col-span-2 text-center">Violations</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-2 text-right">Total Score</div>
        </div>
      </div>

      {/* ➤ BOTTOM SECTION (Scrollable List) */}
      {/* 'flex-1' makes it fill remaining height. 'overflow-y-auto' enables scrolling INSIDE this box only. */}
      <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-3 scroll-smooth">
        {teams.map((team, index) => {
          const isTop3 = index < 3;
          const rankColor =
            index === 0
              ? "text-yellow-400"
              : index === 1
                ? "text-gray-300"
                : index === 2
                  ? "text-orange-400"
                  : "text-gray-500";
          const rowBorder =
            index === 0
              ? "border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.1)]"
              : "border-dark-700 hover:border-gray-600";
          const bgStyle =
            index === 0
              ? "bg-gradient-to-r from-yellow-900/10 to-transparent"
              : "bg-dark-800/40";

          return (
            <div
              key={team.teamId}
              className={`
                relative grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-xl border ${rowBorder} ${bgStyle} backdrop-blur-sm transition-all duration-300 hover:scale-[1.01]
                ${team.isLocked ? "opacity-50 grayscale border-red-900/50" : ""}
              `}
            >
              {/* RANK */}
              <div
                className={`col-span-1 text-2xl font-black ${rankColor} flex items-center gap-2`}
              >
                {index + 1}
                {index === 0 && (
                  <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
                )}
              </div>

              {/* TEAM NAME */}
              <div className="col-span-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index === 0 ? "bg-yellow-500 text-black" : "bg-dark-700 text-gray-400"}`}
                >
                  {team.teamId.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-white tracking-wide uppercase">
                    {team.teamId}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    ID: {team._id.slice(-6)}
                  </div>
                </div>
              </div>

              {/* LEVEL */}
              <div className="col-span-2 text-center">
                <span className="bg-dark-900 border border-gray-700 px-3 py-1 rounded text-neon-cyan text-sm font-bold shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                  LVL {team.currentLevel}
                </span>
              </div>

              {/* VIOLATIONS */}
              <div className="col-span-2 flex justify-center">
                {team.violations === 0 ? (
                  <span className="text-gray-600 text-xs">-</span>
                ) : (
                  <div className="flex gap-1">
                    {[...Array(team.violations)].map((_, i) => (
                      <ShieldAlert key={i} className="w-4 h-4 text-red-500" />
                    ))}
                  </div>
                )}
              </div>

              {/* STATUS */}
              <div className="col-span-1 text-center">
                {team.isLocked ? (
                  <div className="flex items-center justify-center gap-1 text-red-500 font-bold text-xs animate-pulse">
                    <Lock className="w-3 h-3" /> TERMINATED
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-neon-green font-bold text-xs">
                    <Zap className="w-3 h-3" /> ACTIVE
                  </div>
                )}
              </div>

              {/* SCORE */}
              <div
                className={`col-span-2 text-right font-mono text-2xl font-bold tracking-tighter ${isTop3 ? "text-white" : "text-gray-400"}`}
              >
                {team.score.toLocaleString()}
              </div>
            </div>
          );
        })}

        {/* Spacer at bottom so last item isn't flush with screen edge */}
        <div className="h-10"></div>
      </div>
    </div>
  );
};

export default Leaderboard;
