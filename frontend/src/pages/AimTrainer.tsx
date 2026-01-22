import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TESTS } from '../types';
import { useUser } from '../hooks/useUser';
import { submitScore, getDailyInfo, checkDailyPlayed } from '../utils/api';
import { generateAimPositions } from '../utils/seededRandom';
import './AimTrainer.css';

type GameState = 'instructions' | 'countdown' | 'playing' | 'finished';

const TARGETS = 30;
const TARGET_SIZE = 60;
const GAME_AREA = { width: 600, height: 400 };

interface Target {
  x: number;
  y: number;
}

function AimTrainer() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === 'true';
  
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [countdown, setCountdown] = useState(3);
  const [targetIndex, setTargetIndex] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [dailySeed, setDailySeed] = useState<string>('');
  const [dailyAlreadyPlayed, setDailyAlreadyPlayed] = useState(false);
  
  const startTimeRef = useRef<number>(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const test = TESTS.aim;

  // Generate or load targets
  useEffect(() => {
    if (isDaily && user) {
      getDailyInfo().then(info => {
        setDailySeed(info.seed);
        const positions = generateAimPositions(
          info.seed + '-aim',
          TARGETS,
          GAME_AREA.width,
          GAME_AREA.height,
          TARGET_SIZE
        );
        setTargets(positions);
        
        checkDailyPlayed(user.id, 'aim').then(status => {
          if (status.played) {
            setDailyAlreadyPlayed(true);
          }
        });
      });
    } else {
      // Random positions for non-daily
      const positions: Target[] = [];
      const padding = TARGET_SIZE;
      for (let i = 0; i < TARGETS; i++) {
        positions.push({
          x: padding + Math.random() * (GAME_AREA.width - 2 * padding),
          y: padding + Math.random() * (GAME_AREA.height - 2 * padding)
        });
      }
      setTargets(positions);
    }
  }, [isDaily, user]);

  const startGame = useCallback(() => {
    setGameState('countdown');
    setCountdown(3);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setGameState('playing');
          setTargetIndex(0);
          setTimes([]);
          startTimeRef.current = performance.now();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleTargetClick = useCallback(() => {
    const now = performance.now();
    const time = Math.round(now - startTimeRef.current);
    setTimes(prev => [...prev, time]);
    
    if (targetIndex + 1 >= TARGETS) {
      setGameState('finished');
    } else {
      setTargetIndex(prev => prev + 1);
      startTimeRef.current = performance.now();
    }
  }, [targetIndex]);

  const finishGame = async () => {
    if (!user || times.length === 0) return;
    
    const averageTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    
    try {
      await submitScore(user.id, 'aim', averageTime, isDaily);
      navigate(`/results/aim?score=${averageTime}&times=${times.join(',')}&daily=${isDaily}`);
    } catch (error) {
      console.error('Failed to submit score:', error);
      navigate(`/results/aim?score=${averageTime}&times=${times.join(',')}&daily=${isDaily}`);
    }
  };

  useEffect(() => {
    if (gameState === 'finished') {
      finishGame();
    }
  }, [gameState]);

  const currentTarget = targets[targetIndex];

  if (dailyAlreadyPlayed) {
    return (
      <div className="aim-trainer container">
        <div className="already-played card">
          <h2>Daily Challenge Already Completed</h2>
          <p>You've already played today's aim trainer challenge.</p>
          <p>Come back tomorrow for a new challenge!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="aim-trainer">
      {gameState === 'instructions' && (
        <div className="instructions-screen">
          <div className="instructions-content card">
            <div className="test-header">
              <div className="test-icon-wrapper" style={{ backgroundColor: `${test.color}20`, color: test.color }}>
                <span className={`icon icon-lg ${test.iconClass}`}></span>
              </div>
              <h1>{test.name}</h1>
              {isDaily && <span className="daily-badge">Daily Challenge</span>}
            </div>
            
            <div className="instructions-body">
              <h2>How to Play</h2>
              <ul>
                {test.instructions.map((instruction, i) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ul>
              
              <button onClick={startGame} className="btn btn-primary btn-large">
                Start Test
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'countdown' && (
        <div className="countdown-screen">
          <div className="countdown-number">{countdown}</div>
          <p>Get ready!</p>
        </div>
      )}

      {gameState === 'playing' && currentTarget && (
        <div className="game-wrapper">
          <div className="game-header">
            <div className="progress-info">
              <span>Target {targetIndex + 1} of {TARGETS}</span>
              {times.length > 0 && (
                <span>Avg: {Math.round(times.reduce((a, b) => a + b, 0) / times.length)}ms</span>
              )}
            </div>
          </div>
          
          <div 
            className="game-area" 
            ref={gameAreaRef}
            style={{ 
              width: GAME_AREA.width, 
              height: GAME_AREA.height 
            }}
          >
            <button
              className="target"
              onClick={handleTargetClick}
              style={{
                left: currentTarget.x - TARGET_SIZE / 2,
                top: currentTarget.y - TARGET_SIZE / 2,
                width: TARGET_SIZE,
                height: TARGET_SIZE
              }}
            >
              <div className="target-inner" />
              <div className="target-center" />
            </button>
          </div>
        </div>
      )}

      {gameState === 'finished' && (
        <div className="finished-screen">
          <div className="spinner"></div>
          <p>Saving results...</p>
        </div>
      )}
    </div>
  );
}

export default AimTrainer;
