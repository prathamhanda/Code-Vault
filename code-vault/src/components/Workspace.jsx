import React, { useState, useMemo } from "react";
import WorkspaceRow from "./WorkspaceRow";
import { TerminalSquare, RotateCcw, Plus, Code, Cpu } from "lucide-react";

const Workspace = ({
  rows = {},
  isTerminalActive,
  onTerminalSubmit,
  onRemoveItem,
  onClearBoard,
  onAddLine,
  disabled,
}) => {
  const [terminalInput, setTerminalInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onTerminalSubmit(terminalInput);
  };

  // Safe check for rows
  const safeRows = rows || {};

  // ➤ LOGIC: Convert Drag-and-Drop Rows into Real String Code
  const compiledCode = useMemo(() => {
    return (
      Object.keys(safeRows)
        // Sort rows numerically (row-0, row-1, row-10...)
        .sort((a, b) => {
          const numA = parseInt(a.split("-")[1] || "0");
          const numB = parseInt(b.split("-")[1] || "0");
          return numA - numB;
        })
        .map((key) => {
          const rowItems = safeRows[key];
          if (!rowItems || rowItems.length === 0) return "";
          // Join all blocks in a single row with space
          return rowItems.map((item) => item.code).join(" ");
        })
        .filter((line) => line.trim() !== "") // Remove empty lines
        .join("\n")
    );
  }, [safeRows]);

  return (
    <div className="flex-1 bg-black/50 backdrop-blur-md rounded-xl border border-dark-700 flex flex-col overflow-hidden relative shadow-2xl">
      {/* --- HEADER --- */}
      <div className="bg-dark-800/80 p-3 border-b border-dark-700 flex justify-between items-center">
        <div className="flex items-center gap-2 text-neon-cyan">
          <TerminalSquare className="w-5 h-5" />
          <span className="font-mono text-sm tracking-widest font-bold">
            MAIN_SEQUENCE.C
          </span>
        </div>

        {/* Clear Button */}
        {!isTerminalActive && !disabled && (
          <button
            onClick={onClearBoard}
            className="flex items-center gap-2 text-xs font-mono text-red-400 border border-red-500/30 px-3 py-1 rounded hover:bg-red-500/20 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> CLEAR
          </button>
        )}
      </div>

      {/* --- WORKSPACE ROWS AREA --- */}
      {/* When terminal opens, we blur this background area so focus is on the terminal */}
      <div
        className={`flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar relative transition-all duration-500 ${
          isTerminalActive ? "opacity-20 blur-sm pointer-events-none" : ""
        }`}
      >
        {Object.keys(safeRows).map((rowId, index) => (
          <div key={rowId} className="flex gap-3">
            <div className="w-6 flex-shrink-0 text-right font-mono text-gray-600 text-sm pt-3 select-none">
              {index + 1}
            </div>
            <div className="flex-1">
              <WorkspaceRow
                id={rowId}
                items={safeRows[rowId]}
                onRemoveItem={onRemoveItem}
                disabled={isTerminalActive || disabled}
              />
            </div>
          </div>
        ))}

        {/* Add Line Button */}
        {!disabled && !isTerminalActive && (
          <button
            onClick={onAddLine}
            className="w-full py-2 border-2 border-dashed border-gray-700 rounded text-gray-500 hover:border-gray-500 hover:text-gray-400 flex items-center justify-center gap-2 transition-colors mt-4"
          >
            <Plus className="w-4 h-4" /> ADD LINE
          </button>
        )}
      </div>

      {/* --- TERMINAL DRAWER (HACKER MODE) --- */}
      {isTerminalActive && (
        <div className="absolute inset-0 bg-[#050505] z-50 flex flex-col p-6 animate-in slide-in-from-bottom duration-500 border-t-2 border-neon-cyan shadow-[0_-10px_50px_rgba(0,255,255,0.15)]">
          {/* 1. Terminal Status Header */}
          <div className="border-b border-gray-800 pb-4 mb-4 flex justify-between items-end">
            <div>
              <h2 className="text-neon-green font-mono text-2xl font-bold flex items-center gap-3">
                <Cpu className="w-6 h-6 animate-pulse" />
                TERMINAL ACCESS
              </h2>
              <div className="text-gray-500 text-xs mt-1 font-mono tracking-wider">
                COMPILER STATUS:{" "}
                <span className="text-neon-cyan drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
                  ONLINE
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500 font-mono">MODE</div>
              <div className="text-neon-pink font-bold font-mono tracking-widest animate-pulse">
                EXECUTION
              </div>
            </div>
          </div>

          {/* 2. CODE PREVIEW WINDOW (This fixes your dull visibility issue) */}
          <div className="flex-1 flex flex-col min-h-0 mb-4">
            <div className="flex items-center gap-2 text-neon-cyan text-xs font-bold tracking-widest mb-2">
              <Code className="w-3 h-3" />
              SOURCE CODE PREVIEW
            </div>

            {/* The Code Box */}
            <div className="flex-1 bg-[#0a0a0a] border border-gray-800 rounded-lg p-4 overflow-y-auto custom-scrollbar relative group shadow-inner">
              {/* Optional: Subtle scanline overlay for cool effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none opacity-20"></div>

              {/* The Code Text */}
              <pre className="font-mono text-sm md:text-base leading-relaxed relative z-0">
                {compiledCode.split("\n").map((line, i) => (
                  <div key={i} className="flex">
                    {/* Line Number */}
                    <span className="text-gray-700 select-none w-8 text-right mr-4 font-bold text-xs pt-1">
                      {i + 1}
                    </span>
                    {/* Code Content - Bright White/Cyan */}
                    <span className="text-gray-100 drop-shadow-[0_0_2px_rgba(255,255,255,0.2)]">
                      {line}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* 3. INPUT AREA (High Visibility) */}
          <div className="pt-2">
            <p className="text-neon-cyan font-mono text-xs mb-2 flex items-center gap-2">
              <span className="animate-pulse">▶</span> Enter the expected return
              value to finalize:
            </p>
            <form onSubmit={handleSubmit} className="flex relative shadow-lg">
              <div className="bg-gray-900 border border-r-0 border-neon-green/30 px-3 flex items-center justify-center rounded-l">
                <span className="text-neon-green font-bold text-lg">$</span>
              </div>
              <input
                type="text"
                autoFocus
                className="flex-1 bg-gray-900/80 border border-neon-green/30 p-3 text-white font-mono text-lg outline-none focus:border-neon-green focus:bg-black transition-all placeholder:text-gray-600"
                placeholder="Type output here..."
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
              />
              <button
                type="submit"
                className="bg-neon-green text-black px-6 font-bold font-mono tracking-widest hover:bg-white hover:shadow-[0_0_15px_rgba(0,255,0,0.6)] transition-all rounded-r"
              >
                EXECUTE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
