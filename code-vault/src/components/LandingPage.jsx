import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, ShieldAlert, ArrowRight, Lock, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../apiBase";

// ➤ IMPORT IMAGE (Must be in src/components folder)
import leadLogo from "./LEAD_white.png";

const LandingPage = () => {
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    // ... (same login logic)
  };

  return (
    // ➤ NUCLEAR FIX:
    // 1. Removed ALL 'bg-' classes.
    // 2. Added 'style' to force the background image via CSS.
    // 3. Added 'border-red-500' so you can see if the container exists.
    <div
      className="h-screen w-screen flex items-center justify-center font-sans text-gray-200 relative overflow-hidden border-4 border-red-500"
      style={{
        backgroundColor: "#ac1b1b", // Fallback black
        backgroundImage: `url(${leadLogo})`, // ➤ Forces the image here
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "60%", // Adjust size of logo (60% of screen width)
      }}
    >
      {/* Decorative Grid Overlay (Kept on top for texture) */}

      <div className="relative z-10 w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-neon-cyan/10 rounded-full mb-4 border border-neon-cyan/30 shadow-[0_0_15px_rgba(0,229,255,0.2)] backdrop-blur-md">
            <Terminal className="w-8 h-8 text-neon-cyan" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 drop-shadow-lg">
            CODE VAULT
          </h1>
          <p className="text-gray-400 font-mono text-sm tracking-widest">
            SECURE TERMINAL ACCESS
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Team Identity
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="w-full bg-black/50 border border-gray-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan transition-all font-mono placeholder-gray-600 backdrop-blur-sm"
                  placeholder="Enter Team ID..."
                  autoFocus
                />
                <Lock className="absolute right-3 top-3.5 w-4 h-4 text-gray-500" />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-neon-cyan text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> AUTHENTICATING...
                </>
              ) : (
                <>
                  ENTER MAINFRAME <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
