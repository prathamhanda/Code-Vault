import React, { useState } from "react";
import { Terminal, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

const Login = () => {
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const input = teamId.trim();

    // ➤ 1. THE BACKDOOR: Check for "Yuvraj"
    if (input.toLowerCase() === "yuvraj") {
      window.location.href = "/leaderboard";
      return;
    }

    // ➤ 2. STANDARD LOGIN LOGIC
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: input }),
      });

      const data = await res.json();

      if (data.status === "SUCCESS") {
        localStorage.setItem("teamId", data.teamId);
        window.location.href = "/game"; // Redirect to Game Interface
      } else {
        setError(data.message || "ACCESS DENIED");
      }
    } catch (err) {
      setError("SERVER UNREACHABLE");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center font-mono relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-dark-800 via-black to-black opacity-80"></div>
      <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>

      {/* Login Card */}
      <div className="z-10 w-full max-w-md p-8 bg-dark-900/50 backdrop-blur-xl border border-dark-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-800 border border-dark-700 mb-4 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
            <Terminal className="w-8 h-8 text-neon-cyan" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            CODE <span className="text-neon-cyan">VAULT</span>
          </h1>
          <p className="text-gray-500 text-xs tracking-widest uppercase">
            Secure Access Terminal v2.0
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-neon-green font-bold tracking-widest ml-1">
              AGENT IDENTIFIER
            </label>
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="ENTER TEAM ID..."
              className="w-full bg-black/50 border border-gray-700 text-white px-4 py-4 rounded-lg focus:outline-none focus:border-neon-cyan focus:shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-all text-center tracking-widest uppercase placeholder:text-gray-700"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold animate-pulse bg-red-500/10 py-2 rounded border border-red-500/20">
              <AlertCircle className="w-3 h-3" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !teamId}
            className={`
              w-full py-4 rounded-lg font-black tracking-widest text-sm flex items-center justify-center gap-2 transition-all duration-300
              ${
                loading
                  ? "bg-gray-800 text-gray-500 cursor-wait"
                  : "bg-neon-cyan text-black hover:bg-white hover:scale-[1.02] shadow-[0_0_20px_rgba(0,255,255,0.3)]"
              }
            `}
          >
            {loading ? (
              "AUTHENTICATING..."
            ) : (
              <>
                INITIATE SESSION <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 flex justify-center text-[10px] text-gray-600 gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> ENCRYPTED
          </span>
          <span>•</span>
          <span>SECURE CONNECTION</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
