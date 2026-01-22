import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TESTS, TestType, UserStats } from '../types';
import { useUser } from '../hooks/useUser';
import { getUserStats, getDailyInfo, checkDailyPlayed } from '../utils/api';
import './Home.css';

interface DailyStatus {
  reaction: boolean;
  aim: boolean;
  'number-memory': boolean;
  'verbal-memory': boolean;
  'sequence-memory': boolean;
}

function Home() {
  const { user } = useUser();
  const [stats, setStats] = useState<Record<TestType, UserStats | null>>({
    reaction: null,
    aim: null,
    'number-memory': null,
    'verbal-memory': null,
    'sequence-memory': null
  });
  const [dailySeed, setDailySeed] = useState<string>('');
  const [dailyPlayed, setDailyPlayed] = useState<DailyStatus>({ 
    reaction: false, 
    aim: false, 
    'number-memory': false,
    'verbal-memory': false,
    'sequence-memory': false
  });

  useEffect(() => {
    if (user) {
      // Fetch user stats
      getUserStats(user.id).then((data) => {
        if (Array.isArray(data)) {
          const statsMap: Record<TestType, UserStats | null> = { 
            reaction: null, 
            aim: null, 
            'number-memory': null,
            'verbal-memory': null,
            'sequence-memory': null
          };
          data.forEach(s => {
            statsMap[s.test_type as TestType] = s;
          });
          setStats(statsMap);
        }
      }).catch(console.error);

      // Fetch daily info
      getDailyInfo().then(info => {
        setDailySeed(info.seed);
        
        // Check if daily challenges are played
        Promise.all([
          checkDailyPlayed(user.id, 'reaction'),
          checkDailyPlayed(user.id, 'aim'),
          checkDailyPlayed(user.id, 'number-memory'),
          checkDailyPlayed(user.id, 'verbal-memory'),
          checkDailyPlayed(user.id, 'sequence-memory')
        ]).then(([reactionStatus, aimStatus, numberMemoryStatus, verbalMemoryStatus, sequenceMemoryStatus]) => {
          setDailyPlayed({
            reaction: reactionStatus.played,
            aim: aimStatus.played,
            'number-memory': numberMemoryStatus.played,
            'verbal-memory': verbalMemoryStatus.played,
            'sequence-memory': sequenceMemoryStatus.played
          });
        });
      }).catch(console.error);
    }
  }, [user]);

  return (
    <div className="home container">
      <section className="hero">
        <h1>Test Your Cognitive Abilities</h1>
        <p>Measure your mental performance with scientifically designed tests</p>
      </section>

      {dailySeed && (
        <section className="daily-challenge">
          <div className="daily-header">
            <h2>Daily Challenge</h2>
            <span className="daily-seed">{dailySeed}</span>
          </div>
          <p>Everyone gets the same challenge today. Compare your scores!</p>
          <div className="daily-tests">
            {Object.values(TESTS).map(test => (
              <Link
                key={`daily-${test.id}`}
                to={`/test/${test.id}?daily=true`}
                className={`daily-test-card ${dailyPlayed[test.id] ? 'played' : ''}`}
              >
                <span className={`test-icon icon ${test.iconClass}`} style={{ color: test.color }}></span>
                <span className="test-name">{test.name}</span>
                {dailyPlayed[test.id] ? (
                  <span className="played-badge">
                    <span className="icon icon-check"></span>
                    Completed
                  </span>
                ) : (
                  <span className="play-badge">Play</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="tests-section">
        <h2>Available Tests</h2>
        <div className="tests-grid">
          {Object.values(TESTS).map(test => (
            <TestCard
              key={test.id}
              test={test}
              stats={stats[test.id]}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface TestCardProps {
  test: typeof TESTS.reaction;
  stats: UserStats | null;
}

function TestCard({ test, stats }: TestCardProps) {
  return (
    <Link to={`/test/${test.id}`} className="test-card card card-hover">
      <div className="test-card-header">
        <div className="test-icon-wrapper" style={{ backgroundColor: `${test.color}20`, color: test.color }}>
          <span className={`icon icon-lg ${test.iconClass}`}></span>
        </div>
      </div>
      <div className="test-card-body">
        <h3>{test.name}</h3>
        <p>{test.description}</p>
        
        {stats && stats.games_played > 0 ? (
          <div className="test-stats">
            <div className="stat">
              <span className="stat-label">Best</span>
              <span className="stat-value">{Math.round(stats.best_score || 0)}{test.unit}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Average</span>
              <span className="stat-value">{Math.round(stats.average_score)}{test.unit}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Games</span>
              <span className="stat-value">{stats.games_played}</span>
            </div>
          </div>
        ) : (
          <div className="test-no-stats">
            <span>Not played yet</span>
          </div>
        )}
        
        <div className="test-card-action">
          <span className="play-text">Start Test</span>
          <span className="arrow">→</span>
        </div>
      </div>
    </Link>
  );
}

export default Home;
