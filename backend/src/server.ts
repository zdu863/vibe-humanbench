import express from 'express';
import cors from 'cors';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  createUser,
  getUser,
  getUserByUsername,
  addScore,
  getUserStats,
  getAllUserStats,
  getUserScores,
  getLeaderboard,
  getDailyLeaderboard,
  hasPlayedDaily
} from './database';

const app = express();
const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 3000);
const HOST = process.env.BACKEND_HOST || '127.0.0.1';

app.use(cors());
app.use(express.json());

// Serve static frontend files in production
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendPath));

// Generate daily seed based on date
function getDailySeed(date?: string): string {
  const d = date ? new Date(date) : new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// User routes
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  
  if (!username || username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be 2-20 characters' });
  }
  
  // Check if username exists
  const existing = getUserByUsername(username);
  if (existing) {
    return res.json(existing);
  }
  
  const id = uuidv4();
  const user = createUser(id, username);
  
  if (!user) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
  
  res.status(201).json(user);
});

app.get('/api/users/:id', (req, res) => {
  const user = getUser(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Score routes
app.post('/api/scores', (req, res) => {
  const { userId, testType, score, isDaily } = req.body;
  
  if (!userId || !testType || score === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const validTests = ['reaction', 'aim', 'number-memory', 'verbal-memory', 'sequence-memory', 'typing', 'chimp'];
  if (!validTests.includes(testType)) {
    return res.status(400).json({ error: 'Invalid test type' });
  }
  
  const dailySeed = isDaily ? getDailySeed() : null;
  
  // Check if user already played daily challenge
  if (isDaily && hasPlayedDaily(userId, testType, dailySeed!)) {
    return res.status(400).json({ error: 'Already played daily challenge today' });
  }
  
  const newScore = addScore(userId, testType, score, isDaily, dailySeed);
  res.status(201).json(newScore);
});

app.get('/api/scores/:userId', (req, res) => {
  const { testType, limit } = req.query;
  const scores = getUserScores(
    req.params.userId,
    testType as string | undefined,
    limit ? parseInt(limit as string) : 50
  );
  res.json(scores);
});

// Stats routes
app.get('/api/stats/:userId', (req, res) => {
  const { testType } = req.query;
  
  if (testType) {
    const stats = getUserStats(req.params.userId, testType as string);
    res.json(stats || { games_played: 0, best_score: null, average_score: 0 });
  } else {
    const stats = getAllUserStats(req.params.userId);
    res.json(stats);
  }
});

// Leaderboard routes
app.get('/api/leaderboard/:testType', (req, res) => {
  const { testType } = req.params;
  const { limit, daily } = req.query;
  
  const validTests = ['reaction', 'aim', 'number-memory', 'verbal-memory', 'sequence-memory', 'typing', 'chimp'];
  if (!validTests.includes(testType)) {
    return res.status(400).json({ error: 'Invalid test type' });
  }
  
  let leaderboard;
  if (daily === 'true') {
    const dailySeed = getDailySeed();
    leaderboard = getDailyLeaderboard(testType, dailySeed, limit ? parseInt(limit as string) : 10);
  } else {
    leaderboard = getLeaderboard(testType, limit ? parseInt(limit as string) : 10);
  }
  
  res.json(leaderboard);
});

// Daily challenge info
app.get('/api/daily', (req, res) => {
  const seed = getDailySeed();
  res.json({ seed, date: new Date().toISOString().split('T')[0] });
});

app.get('/api/daily/check/:userId/:testType', (req, res) => {
  const { userId, testType } = req.params;
  const seed = getDailySeed();
  const played = hasPlayedDaily(userId, testType, seed);
  res.json({ played, seed });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

export default app;
