<div align="center">

# Code Vault - in association with LEAD

<a href="https://lead.pratham.codes" target="_blank">
  <img src="https://img.shields.io/badge/Code%20Vault-Live%20Coding%20Heist-06b6d4?style=for-the-badge&logo=hackthebox&logoColor=white" alt="Code Vault" />
</a>


### **Drag. Drop. Compile (mentally). Win the leaderboard.**


[🚀 Quick Start](#-quick-start) • [✨ Features](#-feature-highlights) • [🎮 How It Works](#-how-it-works) • [📡 API](#-api-reference) • [🛠️ Tech Stack](#tech-stack)

---

</div>

## 🎯 What is Code Vault?

**Code Vault** is a fast-paced, event-friendly coding game where teams must **reconstruct scrambled code** by dragging and dropping snippet blocks into the correct order.

Each level has two phases:

1. **Structure Phase (Drag & Drop)** — Assemble the correct program structure from mixed snippet blocks.
2. **Terminal Phase (One-shot Output)** — Provide the program’s expected output to earn bonus points.

A live **leaderboard view** updates every 2 seconds, making it ideal for projector displays during hackathons, CTFs, and campus events.

---
![Node.js](https://img.shields.io/badge/Node.js-18+-3c3c3c?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-3c3c3c?logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-3c3c3c?logo=mongodb&logoColor=47A248)

---

## 🚀 Quick Start

### 1) Prerequisites

- Node.js **18+**
- MongoDB (local or Atlas)

### 2) Backend (API)

```bash
cd server
npm install
```

Create `server/.env`:

```env
# Required
MONGODB_URI=mongodb://127.0.0.1:27017/code-vault

# Optional
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ADMIN_ID=yuvraj
DEFAULT_START_SCORE=1000
```

Seed teams + levels:

```bash
node seed.js
```

Run the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000` and exposes `GET /health`.

### 3) Frontend (Web)

```bash
cd ../code-vault
npm install
```

Create `code-vault/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Run the web app:

```bash
npm run dev
```

Open `http://localhost:5173`.

---

## ✨ Feature Highlights

<table>
<tr>
<td align="center" width="25%">
<h3>🧩</h3>
<b>Drag & Drop Code</b><br/>
<sub>Assemble scrambled snippet blocks into a valid program</sub>
</td>
<td align="center" width="25%">
<h3>🖥️</h3>
<b>Terminal Output Round</b><br/>
<sub>One-shot expected output check for bonus points</sub>
</td>
<td align="center" width="25%">
<h3>🏆</h3>
<b>Live Leaderboard</b><br/>
<sub>Auto-refreshes every 2 seconds for projector mode</sub>
</td>
<td align="center" width="25%">
<h3>🛡️</h3>
<b>Anti-cheat Strikes</b><br/>
<sub>Violations → penalty → lockout after 3 strikes</sub>
</td>
</tr>
</table>

---

## 🎮 How It Works

### Game Flow

1. **Team Login** with a team ID seeded into MongoDB.
2. Players wait in a **Waiting Room** until the admin starts the event.
3. A level loads with a **Snippet Vault** (scrambled code blocks).
4. Teams assemble code in the **Workspace** and click **Run Sequence**.
5. If correct, **Terminal Access** unlocks for one output submission.
6. Score updates, level advances, and the leaderboard updates live.

### Scoring (current defaults)

- **Correct structure:** `+500`
- **Incorrect structure (on 3rd wrong attempt):** `-100`
- **Terminal output correct:** `+200`
- **Terminal output incorrect:** `-200`
- **Violation strikes:**
  - Strike 2: `-200`
  - Strike 3: Permanent lock until reset

> Scores and strike behavior are implemented in the backend and can be tuned.

### Admin Controls

Admin actions are protected by an **admin ID** (defaults to `yuvraj`).

- Start the event: `POST /api/admin/start-game`
- Reset a team: `POST /api/admin/reset-team`
- Reset the entire game: `POST /api/admin/reset-game`

---

## 📡 API Reference

**Base URL (local):** `http://localhost:5000`

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/healthz` | Health check |

### Game

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Team login |
| GET | `/api/game-status` | Check whether the event has started |
| GET | `/api/game-data/:teamId` | Fetch team score + current level + snippets |
| POST | `/api/submit-code` | Submit assembled snippet order |
| POST | `/api/submit-terminal` | Submit expected output (one-shot) |
| POST | `/api/skip-terminal` | Skip terminal phase and advance |
| POST | `/api/report-violation` | Register a strike / violation |
| GET | `/api/leaderboard` | Live leaderboard feed |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/start-game` | Start the event |
| POST | `/api/admin/reset-team` | Clear strikes/unlock a team (optional score restore) |
| POST | `/api/admin/reset-game` | Stop event + reset all teams |

---

## 📖 Project Structure

```
Code-Vault/
├── render.yaml                 # Render deploy for API
├── .github/workflows/
│   └── render-keepalive.yml    # Optional: ping /health to avoid cold starts
├── server/                     # Express + MongoDB API
│   ├── server.js               # API routes + game logic
│   ├── seed.js                 # Seeds teams + levels
│   └── models/                 # Team + Level schemas
└── code-vault/                 # React + Vite frontend
    ├── src/
    │   ├── apiBase.js          # VITE_API_BASE_URL wiring
    │   └── components/         # Login, GameInterface, Leaderboard, etc.
    └── vercel.json             # SPA rewrites for Vercel
```

---

## 🌍 Deployment Notes

### Render (API)

- Deploy is defined in `render.yaml` (service name: `code-vault-api`).
- Health endpoint: `/health`

If you’re on a free plan and want to reduce cold starts:

- Configure GitHub Actions variable/secret `API_HEALTH_URL`
- Workflow: `.github/workflows/render-keepalive.yml` pings every 5 minutes

### Vercel (Frontend)

- `code-vault/vercel.json` includes SPA rewrites.
- Set `VITE_API_BASE_URL` to your Render service URL.

> Remember to set `CORS_ORIGIN` in the API to include your deployed frontend origin.

---

<a id="tech-stack"></a>

## 🛠️ Tech Stack

<table>
<tr>
<th>Backend</th>
<th>Frontend</th>
<th>Gameplay UI</th>
</tr>
<tr>
<td>

- Node.js + Express
- MongoDB + Mongoose
- CORS + dotenv

</td>
<td>

- React + React Router
- Vite
- Tailwind CSS

</td>
<td>

- dnd-kit (drag & drop)
- lucide-react (icons)
- framer-motion (animations)

</td>
</tr>
</table>

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Run the API + web locally
4. Submit a PR

For test data, run:

```bash
cd server
node seed.js
```

---

## 🙏 Acknowledgments

- dnd-kit — drag-and-drop interactions
- Vite + React — frontend tooling
- Tailwind CSS — UI styling
- Render + Vercel — deployment

---

<div align="center">

**Built for live events, competitions, and classrooms.**

[⬆ Back to top](#-code-vault)

</div>



