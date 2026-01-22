import React, { useState, useEffect } from 'react';
import { TESTS, TestType, LeaderboardEntry } from '../types';
import { useUser } from '../hooks/useUser';
import { getLeaderboard } from '../utils/api';
import './Leaderboard.css';

function Leaderboard() {
  const { user } = useUser();
  const [activeTest, setActiveTest] = useState<TestType>('reaction');
  const [viewMode, setViewMode] = useState<'all-time' | 'daily'>('all-time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard(activeTest, 50, viewMode === 'daily')
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [activeTest, viewMode]);

  const test = TESTS[activeTest];

  return (
    <div className="leaderboard-page container">
      <header className="page-header">
        <h1>Global Leaderboard</h1>
        <p>See how you stack up against other players</p>
      </header>

      <div className="leaderboard-controls">
        <div className="test-tabs">
          {Object.values(TESTS).map(t => (
            <button
              key={t.id}
              className={`tab ${activeTest === t.id ? 'active' : ''}`}
              onClick={() => setActiveTest(t.id)}
              style={activeTest === t.id ? { backgroundColor: `${t.color}20`, color: t.color } : {}}
            >
              <span className={`tab-icon icon ${t.iconClass}`} style={activeTest === t.id ? { color: t.color } : {}}></span>
              <span className="tab-name">{t.name}</span>
            </button>
          ))}
        </div>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'all-time' ? 'active' : ''}`}
            onClick={() => setViewMode('all-time')}
          >
            All Time
          </button>
          <button
            className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => setViewMode('daily')}
          >
            Today
          </button>
        </div>
      </div>

      <div className="leaderboard-content card">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading leaderboard...</p>
          </div>
        ) : leaderboard.length > 0 ? (
          <div className="leaderboard-table">
            <div className="table-header">
              <span className="col-rank">Rank</span>
              <span className="col-player">Player</span>
              <span className="col-score">Best Score</span>
            </div>
            
            <div className="table-body">
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className={`table-row ${entry.username === user?.username ? 'current-user' : ''}`}
                >
                  <span className="col-rank">
                    <span className={`rank-badge ${index < 3 ? `rank-${index + 1}` : ''}`}>
                      {index + 1}
                    </span>
                  </span>
                  <span className="col-player">
                    {entry.username === user?.username && (
                      <span className="you-badge">You</span>
                    )}
                    {entry.username}
                  </span>
                  <span className="col-score">
                    {Math.round(entry.score)}{test.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon icon icon-chart"></div>
            <h3>No Scores Yet</h3>
            <p>Be the first to set a score!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
