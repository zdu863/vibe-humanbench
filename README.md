# Human Benchmark

A web application for testing and tracking your cognitive abilities, inspired by [Human Benchmark](https://humanbenchmark.com). Built with React, TypeScript, and Node.js/Express.

![Human Benchmark](https://img.shields.io/badge/React-18.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue) ![Node.js](https://img.shields.io/badge/Node.js-20+-green)

## Features

### 🎮 Cognitive Tests

1. **⚡ Reaction Time Test**
   - Measures how quickly you can respond to a visual stimulus
   - Wait for red to turn green, then click as fast as possible
   - Complete 5 rounds with averaged results
   - Scores measured in milliseconds (lower is better)

2. **🎯 Aim Trainer**
   - Tests your mouse accuracy and speed
   - Click on 30 targets as quickly as possible
   - Average time per target is calculated
   - Scores measured in milliseconds (lower is better)

### 📊 Statistics & Tracking

- **Personal Stats**: Best score, average score, games played per test
- **Score History**: Track all your attempts over time
- **Progress Tracking**: See how you improve with detailed breakdowns

### 📅 Daily Challenges

- **Seeded Randomness**: Everyone gets the same challenge each day
- **Daily Leaderboard**: Compete with others on the same exact challenge
- **One Attempt Per Day**: Makes each daily challenge count!

### 🏆 Leaderboards

- **Global Rankings**: See top performers for each test
- **All-Time & Daily Views**: Switch between overall and daily rankings
- **Your Position**: Highlighted when you appear on the board

### 👤 User System

- **Simple Login**: Just enter a username to start
- **Persistent Progress**: Data saved across sessions
- **Profile Page**: View all your stats in one place

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router 6** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Modern styling with CSS variables

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **better-sqlite3** - SQLite database for persistence
- **TypeScript** - Type safety

## Project Structure

```
human-benchmark/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
├── backend/                # Express backend
│   ├── src/
│   │   ├── server.ts       # Express server
│   │   └── database.ts     # SQLite database
│   ├── data/               # SQLite database file
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   cd zed-base
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Option 1: Production Mode (Single Port - Best for SSH)

```bash
# Build the frontend
cd frontend
npm run build

# Start the backend (serves both API and frontend)
cd ../backend
npm run build
BACKEND_PORT=3000 node dist/server.js
```

The full app will be available at **http://localhost:3000**

#### Option 2: Development Mode (Two Ports)

1. **Start the backend server** (in one terminal)
   ```bash
   cd backend
   npm run dev
   ```
   The API server will run on http://localhost:3000

2. **Start the frontend dev server** (in another terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   The app will be available at http://localhost:5173

### SSH Port Forwarding

If accessing over SSH, forward the appropriate port:

```bash
# For production mode (single port):
ssh -L 3000:localhost:3000 user@server

# For development mode (need both ports):
ssh -L 5173:localhost:5173 -L 3000:localhost:3000 user@server
```

### Building for Production

1. **Build the backend**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

## API Endpoints

### Users
- `POST /api/users` - Create or get user
- `GET /api/users/:id` - Get user by ID

### Scores
- `POST /api/scores` - Submit a score
- `GET /api/scores/:userId` - Get user's scores

### Stats
- `GET /api/stats/:userId` - Get user statistics

### Leaderboard
- `GET /api/leaderboard/:testType` - Get leaderboard for a test
  - Query params: `limit`, `daily`

### Daily Challenge
- `GET /api/daily` - Get current daily seed
- `GET /api/daily/check/:userId/:testType` - Check if user played daily

## Adding New Tests

The app is designed to be easily extensible. To add a new test:

1. Add the test definition to `frontend/src/types/index.ts`:
   ```typescript
   export const TESTS: Record<TestType, TestInfo> = {
     // ... existing tests
     newTest: {
       id: 'newTest',
       name: 'New Test',
       description: 'Description here',
       icon: '🆕',
       color: '#color',
       unit: 'ms',
       instructions: ['Step 1', 'Step 2'],
       scoreBetterWhen: 'lower'
     }
   };
   ```

2. Create the test page component in `frontend/src/pages/`

3. Add the route in `frontend/src/App.tsx`

4. Add the test type to the backend validation in `server.ts`

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Scores table
CREATE TABLE scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL,
  score REAL NOT NULL,
  is_daily BOOLEAN DEFAULT 0,
  daily_seed TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- User stats table (aggregated)
CREATE TABLE user_stats (
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL,
  best_score REAL,
  games_played INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0,
  last_played TEXT,
  PRIMARY KEY (user_id, test_type)
);
```

## License

MIT License - feel free to use this project for learning or building your own cognitive testing platform!