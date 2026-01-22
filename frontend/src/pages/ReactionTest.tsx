import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TESTS } from '../types';
import { useUser } from '../hooks/useUser';
import { submitScore, getDailyInfo, checkDailyPlayed } from '../utils/api';
import { generateReactionDelays } from '../utils/seededRandom';
import './ReactionTest.css';

type GameState = 'instructions' | 'waiting' | 'ready' | 'too-early' | 'result' | 'finished';

const ROUNDS = 5;

function ReactionTest() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === 'true';
  
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [dailySeed, setDailySeed] = useState<string>('');
  const [dailyAlreadyPlayed, setDailyAlreadyPlayed] = useState(false);
  
  // Use refs for timing-critical values to avoid React state latency
  const startTimeRef = useRef<number>(0);
  const gameStateRef = useRef<GameState>('instructions');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delaysRef = useRef<number[]>([]);
  const roundRef = useRef(0);
  const timesRef = useRef<number[]>([]);

  const test = TESTS.reaction;

  // Keep ref in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Check daily status
  useEffect(() => {
    if (isDaily && user) {
      getDailyInfo().then(info => {
        setDailySeed(info.seed);
        delaysRef.current = generateReactionDelays(info.seed, ROUNDS);
        
        checkDailyPlayed(user.id, 'reaction').then(status => {
          if (status.played) {
            setDailyAlreadyPlayed(true);
          }
        });
      });
    } else {
      delaysRef.current = Array.from({ length: ROUNDS }, () => 1000 + Math.random() * 2000);
    }
  }, [isDaily, user]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRound = useCallback(() => {
    cleanup();
    setGameState('waiting');
    setCurrentTime(null);
    
    const delay = delaysRef.current[roundRef.current] || (1000 + Math.random() * 2000);
    
    timeoutRef.current = setTimeout(() => {
      // Set start time BEFORE state update to ensure accuracy
      startTimeRef.current = performance.now();
      gameStateRef.current = 'ready';
      setGameState('ready');
    }, delay);
  }, [cleanup]);

  // Use mousedown for faster response - fires immediately on press
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Capture time IMMEDIATELY - before any other operations
    const clickTime = performance.now();
    
    // Prevent text selection on rapid clicks
    e.preventDefault();
    
    // Use ref for immediate state check (no React state delay)
    const currentState = gameStateRef.current;
    
    if (currentState === 'instructions') {
      return;
    }
    
    if (currentState === 'waiting') {
      cleanup();
      gameStateRef.current = 'too-early';
      setGameState('too-early');
      return;
    }
    
    if (currentState === 'ready') {
      // Calculate reaction time using the captured click time
      const reactionTime = Math.round(clickTime - startTimeRef.current);
      timesRef.current = [...timesRef.current, reactionTime];
      setCurrentTime(reactionTime);
      setTimes(timesRef.current);
      gameStateRef.current = 'result';
      setGameState('result');
      return;
    }
    
    if (currentState === 'too-early' || currentState === 'result') {
      if (roundRef.current + 1 >= ROUNDS) {
        gameStateRef.current = 'finished';
        setGameState('finished');
      } else {
        roundRef.current += 1;
        setRound(roundRef.current);
        startRound();
      }
      return;
    }
  }, [cleanup, startRound]);

  const startGame = () => {
    roundRef.current = 0;
    timesRef.current = [];
    setRound(0);
    setTimes([]);
    setCurrentTime(null);
    startRound();
  };

  const finishGame = async () => {
    if (!user || timesRef.current.length === 0) return;
    
    const averageTime = Math.round(timesRef.current.reduce((a, b) => a + b, 0) / timesRef.current.length);
    
    try {
      await submitScore(user.id, 'reaction', averageTime, isDaily);
      navigate(`/results/reaction?score=${averageTime}&times=${timesRef.current.join(',')}&daily=${isDaily}`);
    } catch (error) {
      console.error('Failed to submit score:', error);
      navigate(`/results/reaction?score=${averageTime}&times=${timesRef.current.join(',')}&daily=${isDaily}`);
    }
  };

  useEffect(() => {
    if (gameState === 'finished') {
      finishGame();
    }
  }, [gameState]);

  const getAverageTime = () => {
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  };

  if (dailyAlreadyPlayed) {
    return (
      <div className="reaction-test container">
        <div className="already-played card">
          <h2>Daily Challenge Already Completed</h2>
          <p>You've already played today's reaction time challenge.</p>
          <p>Come back tomorrow for a new challenge!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reaction-test">
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

      {(gameState === 'waiting' || gameState === 'ready' || gameState === 'too-early' || gameState === 'result') && (
        <div
          className={`game-screen ${gameState}`}
          onMouseDown={handleMouseDown}
        >
          <div className="game-content">
            {gameState === 'waiting' && (
              <>
                <div className="game-indicator waiting-indicator"></div>
                <h2>Wait for green...</h2>
              </>
            )}
            
            {gameState === 'ready' && (
              <>
                <div className="game-indicator ready-indicator"></div>
                <h2>Click!</h2>
              </>
            )}
            
            {gameState === 'too-early' && (
              <>
                <div className="game-indicator early-indicator">
                  <span className="icon icon-x"></span>
                </div>
                <h2>Too soon!</h2>
                <p>Click to try again</p>
              </>
            )}
            
            {gameState === 'result' && (
              <>
                <div className="game-indicator result-indicator">
                  <span className="icon icon-timer"></span>
                </div>
                <h2>{currentTime}ms</h2>
                <p>Click to continue</p>
              </>
            )}
          </div>
          
          <div className="game-progress">
            <span>Round {round + 1} of {ROUNDS}</span>
            {times.length > 0 && (
              <span>Average: {getAverageTime()}ms</span>
            )}
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

export default ReactionTest;
