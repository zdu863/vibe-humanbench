import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { TESTS, TestType, LeaderboardEntry, UserStats } from '../types';
import { useUser } from '../hooks/useUser';
import { getLeaderboard, getUserStats } from '../utils/api';
import './Results.css';

function Results() {
  const { testType } = useParams<{ testType: TestType }>();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  
  const score = parseInt(searchParams.get('score') || '0');
  const times = searchParams.get('times')?.split(',').map(Number) || [];
  const isDaily = searchParams.get('daily') === 'true';
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  const test = testType ? TESTS[testType] : null;

  useEffect(() => {
    if (!testType || !user) return;

    // Fetch leaderboard
    getLeaderboard(testType, 10, isDaily).then(data => {
      setLeaderboard(data);
      // Find user's rank
      const userRank = data.findIndex(entry => entry.username === user.username);
      if (userRank !== -1) {
        setRank(userRank + 1);
      }
    }).catch(console.error);

    // Fetch user stats
    getUserStats(user.id, testType).then(data => {
      if (!Array.isArray(data)) {
        setStats(data);
      }
    }).catch(console.error);
  }, [testType, user, isDaily]);

  if (!test || !testType) {
    return <div className="container">Test not found</div>;
  }

  const getScoreRating = () => {
    if (testType === 'reaction') {
      if (score < 200) return { rating: 'Excellent', color: '#4ade80' };
      if (score < 250) return { rating: 'Good', color: '#6366f1' };
      if (score < 300) return { rating: 'Average', color: '#fbbf24' };
      return { rating: 'Below Average', color: '#f87171' };
    } else if (testType === 'aim') {
      if (score < 300) return { rating: 'Excellent', color: '#4ade80' };
      if (score < 400) return { rating: 'Good', color: '#6366f1' };
      if (score < 500) return { rating: 'Average', color: '#fbbf24' };
      return { rating: 'Below Average', color: '#f87171' };
    } else if (testType === 'number-memory') {
      if (score >= 10) return { rating: 'Exceptional', color: '#a78bfa' };
      if (score >= 8) return { rating: 'Excellent', color: '#4ade80' };
      if (score >= 6) return { rating: 'Good', color: '#6366f1' };
      if (score >= 4) return { rating: 'Average', color: '#fbbf24' };
      return { rating: 'Below Average', color: '#f87171' };
    } else if (testType === 'verbal-memory') {
      if (score >= 80) return { rating: 'Exceptional', color: '#fbbf24' };
      if (score >= 50) return { rating: 'Excellent', color: '#4ade80' };
      if (score >= 30) return { rating: 'Good', color: '#6366f1' };
      if (score >= 15) return { rating: 'Average', color: '#fbbf24' };
      return { rating: 'Below Average', color: '#f87171' };
    } else if (testType === 'sequence-memory') {
      if (score >= 12) return { rating: 'Exceptional', color: '#14b8a6' };
      if (score >= 9) return { rating: 'Excellent', color: '#4ade80' };
      if (score >= 7) return { rating: 'Good', color: '#6366f1' };
      if (score >= 5) return { rating: 'Average', color: '#fbbf24' };
      return { rating: 'Below Average', color: '#f87171' };
    }
    return { rating: 'Completed', color: '#6366f1' };
  };

  // Determine if lower or higher is better for this test
  const lowerIsBetter = testType === 'reaction' || testType === 'aim';

  const rating = getScoreRating();
  const isNewBest = stats && (stats.best_score === null || 
    (lowerIsBetter ? score <= stats.best_score : score >= stats.best_score));

  return (
    <div className="results container">
      <div className="results-header">
        <div className="test-icon-wrapper" style={{ backgroundColor: `${test.color}20`, color: test.color }}>
          <span className={`icon icon-lg ${test.iconClass}`}></span>
        </div>
        <h1>{test.name} Results</h1>
        {isDaily && <span className="daily-badge">Daily Challenge</span>}
      </div>

      <div className="results-grid">
        <div className="main-result card">
          <div className="score-display">
            <span className="score-value">{score}</span>
            <span className="score-unit">{test.unit}</span>
          </div>
          
          <div className="score-rating" style={{ color: rating.color }}>
            {rating.rating}
            {isNewBest && <span className="new-best">New Personal Best!</span>}
          </div>

          {times.length > 0 && (
            <div className="times-breakdown">
              <h3>Time Breakdown</h3>
              <div className="times-list">
                {times.map((time, i) => (
                  <div key={i} className="time-item">
                    <span className="time-label">
                      {testType === 'reaction' ? `Round ${i + 1}` : `Target ${i + 1}`}
                    </span>
                    <span className="time-value">{time}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="result-actions">
            <Link to={`/test/${testType}`} className="btn btn-primary">
              Play Again
            </Link>
            <Link to="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>

        <div className="side-panel">
          {stats && (
            <div className="stats-card card">
              <h3>Your Stats</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Best Score</span>
                  <span className="stat-value">{Math.round(stats.best_score || 0)}{test.unit}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average</span>
                  <span className="stat-value">{Math.round(stats.average_score)}{test.unit}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Games Played</span>
                  <span className="stat-value">{stats.games_played}</span>
                </div>
              </div>
            </div>
          )}

          <div className="leaderboard-card card">
            <h3>{isDaily ? "Today's Leaderboard" : 'Global Leaderboard'}</h3>
            {rank && (
              <div className="your-rank">
                Your Rank: <strong>#{rank}</strong>
              </div>
            )}
            <div className="leaderboard-list">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, i) => (
                  <div 
                    key={i} 
                    className={`leaderboard-item ${entry.username === user?.username ? 'current-user' : ''}`}
                  >
                    <span className={`rank ${i < 3 ? `rank-${i + 1}` : ''}`}>
                      {i + 1}
                    </span>
                    <span className="name">{entry.username}</span>
                    <span className="entry-score">{Math.round(entry.score)}{test.unit}</span>
                  </div>
                ))
              ) : (
                <p className="no-scores">No scores yet. Be the first!</p>
              )}
            </div>
            <Link to="/leaderboard" className="view-all">
              View Full Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
