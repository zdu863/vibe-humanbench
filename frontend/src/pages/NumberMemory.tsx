import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TESTS } from '../types';
import { useUser } from '../hooks/useUser';
import { submitScore, getDailyInfo, checkDailyPlayed } from '../utils/api';
import { createSeededRandom } from '../utils/seededRandom';
import './NumberMemory.css';

type GameState = 'instructions' | 'showing' | 'input' | 'correct' | 'wrong' | 'finished';

function NumberMemory() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === 'true';
  
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [level, setLevel] = useState(1);
  const [currentNumber, setCurrentNumber] = useState('');
  const [userInput, setUserInput] = useState('');
  const [showTimeRemaining, setShowTimeRemaining] = useState(100);
  const [dailySeed, setDailySeed] = useState<string>('');
  const [dailyAlreadyPlayed, setDailyAlreadyPlayed] = useState(false);
  
  const randomRef = useRef<(() => number) | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const test = TESTS['number-memory'];

  // Calculate display time based on level (longer numbers need more time)
  const getDisplayTime = (lvl: number) => {
    // Base time of 1000ms + 500ms per digit, with a minimum of 1000ms
    return Math.max(1000, 1000 + (lvl - 1) * 500);
  };

  // Generate a random number with the specified number of digits
  const generateNumber = useCallback((digits: number): string => {
    if (!randomRef.current) {
      randomRef.current = () => Math.random();
    }
    
    let result = '';
    // First digit can't be 0
    result += Math.floor(randomRef.current() * 9) + 1;
    
    for (let i = 1; i < digits; i++) {
      result += Math.floor(randomRef.current() * 10);
    }
    
    return result;
  }, []);

  // Check daily status
  useEffect(() => {
    if (isDaily && user) {
      getDailyInfo().then(info => {
        setDailySeed(info.seed);
        randomRef.current = createSeededRandom(info.seed + '-number');
        
        checkDailyPlayed(user.id, 'number-memory').then(status => {
          if (status.played) {
            setDailyAlreadyPlayed(true);
          }
        });
      });
    } else {
      randomRef.current = () => Math.random();
    }
  }, [isDaily, user]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startLevel = useCallback((lvl: number) => {
    cleanup();
    const number = generateNumber(lvl);
    setCurrentNumber(number);
    setUserInput('');
    setShowTimeRemaining(100);
    setGameState('showing');
    
    const displayTime = getDisplayTime(lvl);
    const intervalTime = 50; // Update every 50ms for smooth progress bar
    const steps = displayTime / intervalTime;
    let currentStep = 0;
    
    timerRef.current = setInterval(() => {
      currentStep++;
      const remaining = 100 - (currentStep / steps) * 100;
      setShowTimeRemaining(remaining);
      
      if (currentStep >= steps) {
        cleanup();
        setGameState('input');
      }
    }, intervalTime);
  }, [cleanup, generateNumber]);

  const startGame = () => {
    setLevel(1);
    startLevel(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userInput === currentNumber) {
      setGameState('correct');
    } else {
      setGameState('wrong');
    }
  };

  const continueGame = () => {
    if (gameState === 'correct') {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      startLevel(nextLevel);
    }
  };

  const finishGame = async () => {
    if (!user) return;
    
    // Score is the highest level reached (level - 1 if they got it wrong, or level if correct)
    const score = gameState === 'wrong' ? level - 1 : level;
    
    try {
      await submitScore(user.id, 'number-memory', score, isDaily);
      navigate(`/results/number-memory?score=${score}&daily=${isDaily}`);
    } catch (error) {
      console.error('Failed to submit score:', error);
      navigate(`/results/number-memory?score=${score}&daily=${isDaily}`);
    }
  };

  useEffect(() => {
    if (gameState === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'finished') {
      finishGame();
    }
  }, [gameState]);

  if (dailyAlreadyPlayed) {
    return (
      <div className="number-memory container">
        <div className="already-played card">
          <h2>Daily Challenge Already Completed</h2>
          <p>You've already played today's number memory challenge.</p>
          <p>Come back tomorrow for a new challenge!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="number-memory">
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

      {gameState === 'showing' && (
        <div className="game-screen showing">
          <div className="level-indicator">Level {level}</div>
          <div className="number-display">
            <span className="the-number">{currentNumber}</span>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              style={{ width: `${showTimeRemaining}%` }}
            />
          </div>
          <p className="hint">Memorize this number</p>
        </div>
      )}

      {gameState === 'input' && (
        <div className="game-screen input">
          <div className="level-indicator">Level {level}</div>
          <p className="prompt">What was the number?</p>
          <form onSubmit={handleSubmit} className="input-form">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value.replace(/\D/g, ''))}
              className="number-input"
              autoComplete="off"
              placeholder="Enter the number"
            />
            <button type="submit" className="btn btn-primary btn-large" disabled={!userInput}>
              Submit
            </button>
          </form>
        </div>
      )}

      {gameState === 'correct' && (
        <div className="game-screen correct">
          <div className="result-indicator success">
            <span className="icon icon-check"></span>
          </div>
          <h2>Correct!</h2>
          <div className="number-comparison">
            <span className="correct-number">{currentNumber}</span>
          </div>
          <p className="level-info">Level {level} complete</p>
          <button onClick={continueGame} className="btn btn-primary btn-large">
            Next Level
          </button>
        </div>
      )}

      {gameState === 'wrong' && (
        <div className="game-screen wrong">
          <div className="result-indicator error">
            <span className="icon icon-x"></span>
          </div>
          <h2>Incorrect</h2>
          <div className="number-comparison">
            <div className="comparison-row">
              <span className="label">Correct:</span>
              <span className="correct-number">{currentNumber}</span>
            </div>
            <div className="comparison-row">
              <span className="label">You entered:</span>
              <span className="wrong-number">{userInput || '(empty)'}</span>
            </div>
          </div>
          <p className="final-score">
            You reached level <strong>{level}</strong>
            {level > 1 && ` (${level - 1} digits memorized)`}
          </p>
          <button onClick={() => setGameState('finished')} className="btn btn-primary btn-large">
            See Results
          </button>
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

export default NumberMemory;