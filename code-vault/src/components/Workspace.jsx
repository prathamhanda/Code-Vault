import React, { useState } from "react";
import WorkspaceRow from "./WorkspaceRow";
import { TerminalSquare, RotateCcw, Plus } from "lucide-react";

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

        {/* Clear Button (Only show if terminal is closed) */}
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
      <div
        className={`flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar relative ${isTerminalActive ? "pb-[350px]" : ""}`}
      >
        {Object.keys(safeRows).map((rowId, index) => (
          <div key={rowId} className="flex gap-3">
            {/* Line Number */}
            <div className="w-6 flex-shrink-0 text-right font-mono text-gray-600 text-sm pt-3 select-none">
              {index + 1}
            </div>

            {/* The Row Component */}
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

      {/* --- TERMINAL DRAWER (Bottom Half) --- */}
      {isTerminalActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-black/95 z-20 flex flex-col p-6 animate-in slide-in-from-bottom duration-300 border-t-2 border-neon-cyan shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
          <div className="border-b border-gray-700 pb-2 mb-4">
            <h2 className="text-neon-green font-mono text-lg flex items-center gap-2">
              <span className="animate-pulse">_</span> TERMINAL ACCESS GRANTED
            </h2>
          </div>

          <div className="flex-1 font-mono text-gray-300 text-sm mb-4 space-y-2 overflow-y-auto custom-scrollbar">
            <p>Sequence verified successfully.</p>
            <p>Compiling logic...</p>
            <p className="text-neon-cyan">Waiting for standard output:</p>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <span className="text-neon-green py-2">$</span>
            <input
              type="text"
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-white font-mono"
              placeholder="Enter expected output..."
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
            />
            <button
              type="submit"
              className="bg-neon-green text-black px-4 py-2 font-bold text-sm hover:bg-green-400"
            >
              EXECUTE
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Workspace;
