import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import Navbar from "./Navbar";
import SnippetBank from "./SnippetBank";
import Workspace from "./Workspace";
import LevelMap from "./LevelMap";
import {
  XCircle,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Maximize,
  Lock,
} from "lucide-react";
import { API_BASE_URL } from "../apiBase";

const generateRows = (count) => {
  const rows = {};
  for (let i = 0; i < count; i++) rows[`row-${i}`] = [];
  return rows;
};

const Modal = ({ type, message, onClose }) => {
  if (!type) return null;
  const isSuccess = type === "success";
  const isLocked = type === "locked";

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md">
        <div className="w-[500px] bg-dark-900 border-2 border-red-600 p-8 rounded-lg text-center shadow-[0_0_50px_rgba(255,0,0,0.5)]">
          <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-red-600 mb-2 tracking-widest">
            LEVEL TERMINATED
          </h2>
          <p className="text-gray-400 font-mono mb-6">{message}</p>
          <div className="text-red-500/50 text-xs animate-pulse">
            CONTACT ADMIN TO RESET
          </div>
        </div>
      </div>
    );
  }

  let borderColor = isSuccess ? "border-neon-green" : "border-red-500";
  let icon = isSuccess ? (
    <CheckCircle className="w-8 h-8 text-neon-green" />
  ) : (
    <XCircle className="w-8 h-8 text-red-500" />
  );
  let title = isSuccess ? "SYSTEM SUCCESS" : "EXECUTION ERROR";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-[450px] bg-dark-900 border ${borderColor} p-6 rounded-lg shadow-2xl`}
      >
        <div className="flex items-center gap-4 mb-4">
          {icon}
          <h2 className={`text-xl font-bold text-white`}>{title}</h2>
        </div>
        <p className="text-gray-300 font-mono text-sm mb-6 whitespace-pre-wrap leading-relaxed">
          {message}
        </p>
        <button
          onClick={onClose}
          className={`w-full py-2 rounded font-bold text-black ${isSuccess ? "bg-neon-green hover:bg-green-400" : "bg-red-500 hover:bg-red-400"} transition-colors`}
        >
          ACKNOWLEDGE
        </button>
      </div>
    </div>
  );
};

function GameInterface() {
  const [isLoading, setIsLoading] = useState(true);
  const [bankItems, setBankItems] = useState([]);
  const [workspaceRows, setWorkspaceRows] = useState(() => generateRows(15));
  const [activeId, setActiveId] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isTerminalActive, setIsTerminalActive] = useState(false);
  const [terminalAttempts, setTerminalAttempts] = useState(0);
  const [modal, setModal] = useState({ type: null, message: "" });
  const [teamName, setTeamName] = useState("");

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLevelLocked, setIsLevelLocked] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    // Admin accounts should not enter gameplay if event is active or game is started
    if (localStorage.getItem("isAdmin") === "true") {
      // Check if event is closed, then send admin to waiting room
      fetch(`${API_BASE_URL}/api/game-status?adminId=${encodeURIComponent(localStorage.getItem("teamId") || "")}`)
        .then(res => res.json())
        .then(data => {
          if (data.eventActive === false) {
            window.location.href = "/waiting-room";
          } else {
            window.location.href = "/leaderboard";
          }
        });
      return;
    }

    const checkServer = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/game-status`);
        const data = await res.json();
        if (data.eventActive === false) {
          window.location.href = "/terminated";
          return;
        }
        if (!data.started) {
          window.location.href = "/waiting-room";
          return;
        }
        setIsGameStarted(true);
      } catch (e) {
        console.log("Server unreachable");
      }
    };
    checkServer();

    window.history.pushState(null, null, window.location.href);
    const handlePopState = () =>
      window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    loadLevel();
  }, []);

  const loadLevel = async () => {
    const teamId = localStorage.getItem("teamId");
    if (!teamId) return;

    setTeamName(teamId.replace(/-/g, " "));
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/game-data/${teamId}`);
      const data = await response.json();

      if (data.status === "LOCKED") {
        setIsLevelLocked(true);
        setModal({
          type: "locked",
          message:
            "Security protocol violation detected. System access terminated.",
        });
        setIsLoading(false);
        return;
      }

      if (data.status === "SUCCESS") {
        setBankItems(data.snippets);
        setWorkspaceRows(generateRows(15));
        setCurrentScore(data.score);
        setCurrentLevel(data.level);
        setViolationCount(data.violations || 0);
        if (data.isLocked) setIsLevelLocked(true);
        setIsTerminalActive(false);
        setTerminalAttempts(0);
      } else if (data.status === "COMPLETE") {
        setModal({ type: "success", message: "ALL LEVELS CLEARED." });
      }
    } catch (error) {
      console.error("Failed to load level:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLine = () => {
    setWorkspaceRows((prev) => {
      const nextIndex = Object.keys(prev).length;
      return { ...prev, [`row-${nextIndex}`]: [] };
    });
  };

  const isBoardEmpty = Object.values(workspaceRows).every(
    (row) => row.length === 0,
  );

  const handleClearBoard = () => {
    if (isLevelLocked) return;
    const allItems = Object.values(workspaceRows).flat();
    if (allItems.length === 0) return;

    setBankItems((prev) => [...prev, ...allItems]);
    const rowCount = Object.keys(workspaceRows).length;
    setWorkspaceRows(generateRows(rowCount));
  };

  const handleCodeSubmit = async () => {
    if (isLevelLocked && violationCount < 3) return;

    const teamId = localStorage.getItem("teamId");
    const submittedOrder = Object.values(workspaceRows).map((row) =>
      row.map((item) => item.id),
    );

    try {
      const response = await fetch(`${API_BASE_URL}/api/submit-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId, submittedOrder }),
      });

      const data = await response.json();
      setCurrentScore(data.currentScore);

      if (data.status === "SUCCESS") {
        setModal({
          type: "success",
          message: "STRUCTURE VERIFIED. TERMINAL UNLOCKED.",
        });
        setIsTerminalActive(true);
      } else {
        if (violationCount >= 3) {
          setIsLevelLocked(true);
          setModal({ type: "locked", message: "Level terminated." });
        } else {
          setModal({
            type: "error",
            message: `STRUCTURE INVALID.\n${data.message}`,
          });
        }
      }
    } catch (error) {
      setModal({ type: "error", message: "SERVER ERROR" });
    }
  };

  const handleTerminalSubmit = async (userOutput) => {
    const teamId = localStorage.getItem("teamId");
    const response = await fetch(`${API_BASE_URL}/api/submit-terminal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId, userOutput }),
    });

    const data = await response.json();
    setCurrentScore(data.currentScore);

    if (data.status === "SUCCESS") {
      setModal({
        type: "success",
        message: "OUTPUT CORRECT (+200). ADVANCING...",
      });
    } else {
      setModal({
        type: "error",
        message: data.message || "OUTPUT INCORRECT (-200). ADVANCING...",
      });
    }

    setTimeout(() => {
      setModal({ type: null, message: "" });
      loadLevel();
    }, 2500);
  };

  const handleSkipTerminal = async () => {
    const teamId = localStorage.getItem("teamId");
    await fetch(`${API_BASE_URL}/api/skip-terminal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    loadLevel();
  };

  // --- FOCUS WARDEN (ANTI-CHEAT) ---
  const handleViolationTrigger = async () => {
    if (isLevelLocked) return;

    // LOGIC:
    // Count 0 -> 1: Warning
    // Count 1 -> 2: Penalty (-200)
    // Count 2 -> 3: Termination (Lock)

    const nextCount = violationCount + 1;
    setViolationCount(nextCount);
    setShowOverlay(true);

    const teamId = localStorage.getItem("teamId");
    try {
      const res = await fetch(`${API_BASE_URL}/api/report-violation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId }),
      });
      const data = await res.json();

      setCurrentScore(data.currentScore);
      setViolationCount(data.violations);

      if (data.isLocked || data.violations >= 3) {
        setTimeout(() => {
          setShowOverlay(false);
          handleCodeSubmit(); // Force submit -> Fail -> Lock
        }, 3000);
      }
    } catch (err) {
      console.error("Violation reporting failed");
    }
  };

  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement) {
        setIsFullScreen(false);
        if (isGameStarted && !isLevelLocked) {
          handleViolationTrigger();
        }
      } else {
        setIsFullScreen(true);
      }
    };

    const handleVisibility = () => {
      if (document.hidden && isGameStarted && !isLevelLocked) {
        handleViolationTrigger();
      }
    };

    document.addEventListener("fullscreenchange", handleChange);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("fullscreenchange", handleChange);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isGameStarted, violationCount, isLevelLocked]);

  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem
        .requestFullscreen()
        .then(() => {
          setIsFullScreen(true);
          setShowOverlay(false);
        })
        .catch(console.error);
    }
  };

  const findContainer = (id) => {
    if (bankItems.find((i) => i.id === id)) return "bank-area";
    const rowKey = Object.keys(workspaceRows).find((key) =>
      workspaceRows[key].find((i) => i.id === id),
    );
    return rowKey;
  };

  const handleDragStart = (e) => {
    setActiveId(e.active.id);
    const fromBank = bankItems.find((i) => i.id === e.active.id);
    if (fromBank) setActiveItem(fromBank);
    else {
      for (const key in workspaceRows) {
        const item = workspaceRows[key].find((i) => i.id === e.active.id);
        if (item) {
          setActiveItem(item);
          break;
        }
      }
    }
  };

  const handleDragOver = (e) => {
    const { active, over } = e;
    const overId = over?.id;
    if (!overId || active.id === overId) return;

    const activeContainer = findContainer(active.id);
    const overContainer = Object.keys(workspaceRows).includes(overId)
      ? overId
      : findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer)
      return;

    if (activeContainer === "bank-area" && overContainer.startsWith("row-")) {
      const item = bankItems.find((i) => i.id === active.id);
      if (!item) return;
      setBankItems((items) => items.filter((i) => i.id !== active.id));
      setWorkspaceRows((rows) => ({
        ...rows,
        [overContainer]: [...rows[overContainer], item],
      }));
    }

    if (
      activeContainer.startsWith("row-") &&
      overContainer.startsWith("row-")
    ) {
      setWorkspaceRows((prev) => {
        const sourceItems = [...prev[activeContainer]];
        const destItems = [...prev[overContainer]];
        const activeIndex = sourceItems.findIndex((i) => i.id === active.id);
        const item = sourceItems[activeIndex];
        sourceItems.splice(activeIndex, 1);

        const overIndex = destItems.findIndex((i) => i.id === over.id);
        if (overIndex >= 0) destItems.splice(overIndex, 0, item);
        else destItems.push(item);

        return {
          ...prev,
          [activeContainer]: sourceItems,
          [overContainer]: destItems,
        };
      });
    }
  };

  const handleDragEnd = (e) => {
    const { active, over } = e;
    setActiveId(null);
    setActiveItem(null);
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = Object.keys(workspaceRows).includes(over?.id)
      ? over.id
      : findContainer(over?.id);

    if (
      activeContainer &&
      overContainer &&
      activeContainer === overContainer &&
      activeContainer.startsWith("row-")
    ) {
      const activeIndex = workspaceRows[activeContainer].findIndex(
        (i) => i.id === active.id,
      );
      const overIndex = workspaceRows[overContainer].findIndex(
        (i) => i.id === over.id,
      );
      if (activeIndex !== overIndex) {
        setWorkspaceRows((prev) => ({
          ...prev,
          [activeContainer]: arrayMove(
            prev[activeContainer],
            activeIndex,
            overIndex,
          ),
        }));
      }
    }
  };

  const handleRemoveItem = (id) => {
    let foundRow = null;
    let itemToRemove = null;

    for (const rowId in workspaceRows) {
      const item = workspaceRows[rowId].find((i) => i.id === id);
      if (item) {
        foundRow = rowId;
        itemToRemove = item;
        break;
      }
    }

    if (itemToRemove && foundRow) {
      setWorkspaceRows((prev) => ({
        ...prev,
        [foundRow]: prev[foundRow].filter((i) => i.id !== id),
      }));
      setBankItems((prev) => [...prev, itemToRemove]);
    }
  };

  if (isLoading || !isGameStarted) {
    return (
      <div className="bg-black h-screen w-screen text-white flex flex-col items-center justify-center font-mono">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-cyan mb-4"></div>
        <p className="animate-pulse tracking-widest text-neon-cyan">
          {isGameStarted
            ? "DECRYPTING LEVEL DATA..."
            : "ESTABLISHING UPLINK..."}
        </p>
      </div>
    );
  }

  if (!isFullScreen && violationCount === 0 && !isLevelLocked) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white z-50 font-mono">
        <div className="max-w-md text-center border border-neon-cyan p-8 rounded-xl bg-dark-900 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
          <h1 className="text-2xl font-bold mb-4 text-neon-cyan tracking-widest">
            PROTOCOL REQUIRED
          </h1>
          <p className="text-gray-400 mb-8 text-sm">
            Secure environment mandatory.
          </p>
          <button
            onClick={enterFullScreen}
            className="bg-neon-cyan text-black font-bold py-3 px-8 rounded flex items-center justify-center gap-2 mx-auto hover:scale-105 transition-transform"
          >
            <Maximize className="w-5 h-5" /> INITIALIZE INTERFACE
          </button>
        </div>
      </div>
    );
  }

  if (showOverlay) {
    let title = "SECURITY WARNING";
    let color = "text-yellow-500";
    let border = "border-yellow-500";
    let Icon = AlertTriangle;
    let msg = "Focus lost. This is your first warning.";

    if (violationCount === 2) {
      title = "PENALTY APPLIED";
      color = "text-orange-500";
      border = "border-orange-500";
      Icon = ShieldAlert;
      msg = "Second Violation. 200 COINS DEDUCTED.";
    }
    if (violationCount >= 3) {
      title = "CRITICAL FAILURE";
      color = "text-red-600";
      border = "border-red-600";
      Icon = AlertOctagon;
      msg = "MAXIMUM VIOLATIONS REACHED. FORCED SUBMISSION...";
    }

    return (
      <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center font-mono">
        <div
          className={`w-[500px] bg-dark-900 border-2 ${border} p-8 rounded-lg text-center shadow-[0_0_50px_rgba(255,0,0,0.2)] animate-in zoom-in duration-300`}
        >
          <Icon className={`w-20 h-20 ${color} mx-auto mb-6 animate-pulse`} />
          <h1 className={`text-3xl font-bold ${color} mb-4 tracking-widest`}>
            {title}
          </h1>
          <p className="text-gray-300 mb-8 text-sm">{msg}</p>
          {violationCount < 3 && (
            <button
              onClick={enterFullScreen}
              className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-10 rounded border border-gray-600"
            >
              ACKNOWLEDGE & RESUME
            </button>
          )}
          {violationCount >= 3 && (
            <div className="text-red-500 animate-pulse text-xs">
              UPLOADING DATA PACKETS...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={!isLevelLocked ? handleDragStart : undefined}
      onDragOver={!isLevelLocked ? handleDragOver : undefined}
      onDragEnd={!isLevelLocked ? handleDragEnd : undefined}
    >
      <div className="h-screen w-screen bg-dark-900 text-gray-200 flex flex-col font-sans relative">
        <Navbar
          onRun={handleCodeSubmit}
          score={currentScore}
          disabled={isBoardEmpty || isLevelLocked}
          teamName={teamName}
        />

        <Modal
          type={modal.type}
          message={modal.message}
          onClose={() => {
            if (modal.type !== "locked") setModal({ type: null, message: "" });
          }}
        />

        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          <div className="w-1/5 min-w-[250px]">
            <SnippetBank items={bankItems} />
          </div>

          <div className="flex-1 flex flex-col relative">
            <Workspace
              rows={workspaceRows}
              isTerminalActive={isTerminalActive}
              onTerminalSubmit={handleTerminalSubmit}
              onRemoveItem={!isLevelLocked ? handleRemoveItem : undefined}
              onClearBoard={handleClearBoard}
              onAddLine={handleAddLine}
              disabled={isLevelLocked}
            />

            {isTerminalActive && (
              <button
                onClick={handleSkipTerminal}
                className="absolute bottom-[200px] right-6 bg-gray-700 text-white text-xs px-4 py-2 rounded border border-gray-500 z-50 hover:bg-gray-600 shadow-lg"
              >
                SKIP TERMINAL ➜
              </button>
            )}
          </div>

          <div className="w-1/5 min-w-[200px]">
            <LevelMap currentLevel={currentLevel} totalLevels={10} />
          </div>
        </div>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: "0.5" } },
            }),
          }}
        >
          {activeItem && (
            <div className="bg-neon-cyan/20 p-2 rounded border border-neon-cyan text-neon-cyan font-mono text-xs shadow-xl backdrop-blur-md cursor-grabbing">
              {activeItem.code}
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

export default GameInterface;