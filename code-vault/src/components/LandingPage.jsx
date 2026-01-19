import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, ShieldAlert, ArrowRight, Lock, Loader2 } from "lucide-react";

const LandingPage = () => {
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });

      const data = await response.json();

      if (data.status === "SUCCESS") {
        // Save team info to localStorage
        localStorage.setItem(
          "teamId",
          data.teamId || teamId.toLowerCase().replace(/\s+/g, "-"),
        );
        navigate("/waiting-room"); // Redirect to the waiting room
      } else {
        setError(data.message || "ACCESS DENIED"); // Show "Event Closed" or "Invalid Team"
      }
    } catch (err) {
      setError("Connection Refused: Server Unreachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-dark-900 flex items-center justify-center font-sans text-gray-200 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-dark-800 via-dark-900 to-black opacity-80 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>

      <div className="relative z-10 w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-neon-cyan/10 rounded-full mb-4 border border-neon-cyan/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
            <Terminal className="w-8 h-8 text-neon-cyan" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            CODE VAULT
          </h1>
          <p className="text-gray-500 font-mono text-sm">
            SECURE TERMINAL ACCESS
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-dark-800/50 backdrop-blur-md border border-dark-700 rounded-xl p-6 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Team Identity
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full bg-dark-900/80 border border-dark-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all font-mono placeholder-gray-600"
                  placeholder="Enter Team ID..."
                  autoFocus
                />
                <Lock className="absolute right-3 top-3.5 w-4 h-4 text-gray-600" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                <ShieldAlert className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-neon-cyan text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> AUTHENTICATING...
                </>
              ) : (
                <>
                  ENTER MAINFRAME{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Rules Section */}
        <div className="mt-8 border-t border-dark-700 pt-6">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
            Protocol Rules
          </h3>
          <ul className="space-y-2 text-xs text-gray-500 font-mono">
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan">•</span>
              <span>
                Syntax Logic must be constructed in the Assembly Area.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan">•</span>
              <span>3 Incorrect Attempts trigger a penalty (-100 Coins).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan">•</span>
              <span>Terminal Output prediction grants bonus data packets.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
