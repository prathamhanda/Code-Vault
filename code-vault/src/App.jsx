import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login"; // ➤ FIX: Use the Login component I gave you
import GameInterface from "./components/GameInterface";
import WaitingRoom from "./components/WaitingRoom";
import Leaderboard from "./components/Leaderboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Login Screen (Contains the 'Yuvraj' backdoor) */}
        <Route path="/" element={<Login />} />

        {/* 2. The Waiting Room (Where users go if game hasn't started) */}
        <Route path="/waiting-room" element={<WaitingRoom />} />

        {/* 3. The Main Game */}
        <Route path="/game" element={<GameInterface />} />

        {/* 4. Leaderboard (Admin/Projector View) */}
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;
