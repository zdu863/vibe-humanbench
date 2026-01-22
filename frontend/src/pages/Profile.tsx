import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TESTS, TestType, UserStats, Score } from '../types';
import { useUser } from '../hooks/useUser';
import { getUserStats, getUserScores } from '../utils/api';
import './Profile.css';

function Profile() {
  const { user, logout } = useUser();
  const [stats, setStats] = useState<Record<TestType, UserStats | null>>({
    reaction: null,
    aim: null,
    'number-memory': null,
    'verbal-memory': null,
    'sequence-memory': null
  });
  const [recentScores, setRecentScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    Promise.all([
      getUserStats(user.id),
      getUserScores(user.id, undefined, 20)
    ]).then(([statsData, scoresData]) => {
      if (Array.isArray(statsData)) {
        const statsMap: Record<TestType, UserStats | null> = { 
          reaction: null, 
          aim: null, 
          'number-memory': null,
          'verbal-memory': null,
          'sequence-memory': null
        };
        statsData.forEach(s => {
          statsMap[s.test_type as TestType] = s;
        });
        setStats(statsMap);
      }
      setRecentScores(scoresData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [user]);

  if (!user) return null;

  const totalGames = Object.values(stats).reduce((sum, s) => sum + (s?.games_played || 0), 0);

  return (
    <div className="profile-page container">
      <header className="profile-header card">
        <div className="avatar">
          <span className="icon icon-user"></span>
        </div>
        <div className="profile-info">
          <h1>{user.username}</h1>
          <p>Member since {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        <button onClick={logout} className="btn btn-secondary">
          Sign out
        </button>
      </header>

      <div className="profile-content">
        <section className="stats-overview">
          <h2>Statistics Overview</h2>
          
          <div className="overview-cards">
            <div className="overview-card card">
              <div className="overview-icon-wrapper">
                <span className="icon icon-chart"></span>
              </div>
              <span className="overview-value">{totalGames}</span>
              <span className="overview-label">Total Games</span>
            </div>
            
            {Object.entries(TESTS).map(([key, test]) => {
              const testStats = stats[key as TestType];
              return (
                <div key={key} className="overview-card card">
                  <div className="overview-icon-wrapper" style={{ backgroundColor: `${test.color}15`, color: test.color }}>
                    <span className={`icon ${test.iconClass}`}></span>
                  </div>
                  <span className="overview-value">
                    {testStats?.best_score 
                      ? `${Math.round(testStats.best_score)}${test.unit}`
                      : '-'
                    }
                  </span>
                  <span className="overview-label">{test.name} Best</span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="profile-grid">
          <section className="detailed-stats">
            <h2>Per-Test Statistics</h2>
            
            {Object.entries(TESTS).map(([key, test]) => {
              const testStats = stats[key as TestType];
              return (
                <div key={key} className="test-stats-card card">
                  <div className="test-stats-header">
                    <div className="test-icon-wrapper" style={{ backgroundColor: `${test.color}20`, color: test.color }}>
                      <span className={`icon ${test.iconClass}`}></span>
                    </div>
                    <h3>{test.name}</h3>
                  </div>
                  
                  {testStats && testStats.games_played > 0 ? (
                    <div className="test-stats-body">
                      <div className="stat-row">
                        <span className="stat-label">Best Score</span>
                        <span className="stat-value best">
                          {Math.round(testStats.best_score || 0)}{test.unit}
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Average</span>
                        <span className="stat-value">
                          {Math.round(testStats.average_score)}{test.unit}
                        </span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Games Played</span>
                        <span className="stat-value">{testStats.games_played}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Last Played</span>
                        <span className="stat-value">
                          {testStats.last_played 
                            ? new Date(testStats.last_played).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      
                      <Link to={`/test/${key}`} className="btn btn-primary play-btn">
                        Play Again
                      </Link>
                    </div>
                  ) : (
                    <div className="test-stats-empty">
                      <p>No games played yet</p>
                      <Link to={`/test/${key}`} className="btn btn-primary">
                        Play Now
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <section className="recent-activity">
            <h2>Recent Activity</h2>
            
            {loading ? (
              <div className="loading card">
                <div className="spinner"></div>
              </div>
            ) : recentScores.length > 0 ? (
              <div className="activity-list card">
                {recentScores.map(score => {
                  const test = TESTS[score.test_type];
                  return (
                    <div key={score.id} className="activity-item">
                      <div className="activity-icon-wrapper" style={{ backgroundColor: `${test?.color}15`, color: test?.color }}>
                        <span className={`icon ${test?.iconClass}`}></span>
                      </div>
                      <div className="activity-details">
                        <span className="activity-test">{test?.name}</span>
                        <span className="activity-date">
                          {new Date(score.created_at).toLocaleString()}
                        </span>
                      </div>
                      <span className="activity-score">
                        {Math.round(score.score)}{test?.unit}
                        {score.is_daily && (
                          <span className="daily-indicator" title="Daily Challenge">D</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-activity card">
                <p>No recent activity</p>
                <Link to="/" className="btn btn-primary">
                  Start Playing
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;
