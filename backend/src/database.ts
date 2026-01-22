import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '..', 'data', 'benchmark.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db: DatabaseType = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    test_type TEXT NOT NULL,
    score REAL NOT NULL,
    is_daily BOOLEAN DEFAULT 0,
    daily_seed TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT NOT NULL,
    test_type TEXT NOT NULL,
    best_score REAL,
    games_played INTEGER DEFAULT 0,
    average_score REAL DEFAULT 0,
    last_played TEXT,
    PRIMARY KEY (user_id, test_type),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_scores_user ON scores(user_id);
  CREATE INDEX IF NOT EXISTS idx_scores_test ON scores(test_type);
  CREATE INDEX IF NOT EXISTS idx_scores_daily ON scores(is_daily, daily_seed);
`);

export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface Score {
  id: number;
  user_id: string;
  test_type: string;
  score: number;
  is_daily: boolean;
  daily_seed: string | null;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  test_type: string;
  best_score: number | null;
  games_played: number;
  average_score: number;
  last_played: string | null;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  created_at: string;
}

// User operations
export function createUser(id: string, username: string): User | null {
  try {
    const stmt = db.prepare('INSERT INTO users (id, username) VALUES (?, ?)');
    stmt.run(id, username);
    return getUser(id);
  } catch (e) {
    return null;
  }
}

export function getUser(id: string): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | null;
}

export function getUserByUsername(username: string): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as User | null;
}

// Score operations
export function addScore(
  userId: string,
  testType: string,
  score: number,
  isDaily: boolean = false,
  dailySeed: string | null = null
): Score {
  const stmt = db.prepare(`
    INSERT INTO scores (user_id, test_type, score, is_daily, daily_seed)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(userId, testType, score, isDaily ? 1 : 0, dailySeed);
  
  // Update user stats
  updateUserStats(userId, testType, score);
  
  return {
    id: result.lastInsertRowid as number,
    user_id: userId,
    test_type: testType,
    score,
    is_daily: isDaily,
    daily_seed: dailySeed,
    created_at: new Date().toISOString()
  };
}

function updateUserStats(userId: string, testType: string, newScore: number): void {
  const existingStats = getUserStats(userId, testType);
  
  // Determine if lower or higher is better for this test type
  const lowerIsBetter = testType === 'reaction' || testType === 'aim';
  
  if (existingStats) {
    const newGamesPlayed = existingStats.games_played + 1;
    const newAverage = ((existingStats.average_score * existingStats.games_played) + newScore) / newGamesPlayed;
    
    // Determine if new score is better based on test type
    const isBetterScore = existingStats.best_score === null || 
      (lowerIsBetter ? newScore < existingStats.best_score : newScore > existingStats.best_score);
    
    const newBest = isBetterScore ? newScore : existingStats.best_score;
    
    const stmt = db.prepare(`
      UPDATE user_stats 
      SET best_score = ?, games_played = ?, average_score = ?, last_played = datetime('now')
      WHERE user_id = ? AND test_type = ?
    `);
    stmt.run(newBest, newGamesPlayed, newAverage, userId, testType);
  } else {
    const stmt = db.prepare(`
      INSERT INTO user_stats (user_id, test_type, best_score, games_played, average_score, last_played)
      VALUES (?, ?, ?, 1, ?, datetime('now'))
    `);
    stmt.run(userId, testType, newScore, newScore);
  }
}

export function getUserStats(userId: string, testType: string): UserStats | null {
  const stmt = db.prepare('SELECT * FROM user_stats WHERE user_id = ? AND test_type = ?');
  return stmt.get(userId, testType) as UserStats | null;
}

export function getAllUserStats(userId: string): UserStats[] {
  const stmt = db.prepare('SELECT * FROM user_stats WHERE user_id = ?');
  return stmt.all(userId) as UserStats[];
}

export function getUserScores(userId: string, testType?: string, limit: number = 50): Score[] {
  if (testType) {
    const stmt = db.prepare(`
      SELECT * FROM scores 
      WHERE user_id = ? AND test_type = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(userId, testType, limit) as Score[];
  } else {
    const stmt = db.prepare(`
      SELECT * FROM scores 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    return stmt.all(userId, limit) as Score[];
  }
}

// Leaderboard operations
export function getLeaderboard(testType: string, limit: number = 10): LeaderboardEntry[] {
  // For reaction time and aim trainer, lower is better; for number-memory, higher is better
  const lowerIsBetter = testType === 'reaction' || testType === 'aim';
  const orderDirection = lowerIsBetter ? 'ASC' : 'DESC';
  
  const stmt = db.prepare(`
    SELECT u.username, us.best_score as score, us.last_played as created_at
    FROM user_stats us
    JOIN users u ON us.user_id = u.id
    WHERE us.test_type = ? AND us.best_score IS NOT NULL
    ORDER BY us.best_score ${orderDirection}
    LIMIT ?
  `);
  return stmt.all(testType, limit) as LeaderboardEntry[];
}

export function getDailyLeaderboard(testType: string, dailySeed: string, limit: number = 10): LeaderboardEntry[] {
  const lowerIsBetter = testType === 'reaction' || testType === 'aim';
  const orderDirection = lowerIsBetter ? 'ASC' : 'DESC';
  const aggregateFunc = lowerIsBetter ? 'MIN' : 'MAX';
  
  const stmt = db.prepare(`
    SELECT u.username, ${aggregateFunc}(s.score) as score, s.created_at
    FROM scores s
    JOIN users u ON s.user_id = u.id
    WHERE s.test_type = ? AND s.is_daily = 1 AND s.daily_seed = ?
    GROUP BY s.user_id
    ORDER BY score ${orderDirection}
    LIMIT ?
  `);
  return stmt.all(testType, dailySeed, limit) as LeaderboardEntry[];
}

export function hasPlayedDaily(userId: string, testType: string, dailySeed: string): boolean {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM scores 
    WHERE user_id = ? AND test_type = ? AND is_daily = 1 AND daily_seed = ?
  `);
  const result = stmt.get(userId, testType, dailySeed) as { count: number };
  return result.count > 0;
}

// Database instance is not exported directly - use the functions above
