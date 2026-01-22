import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TESTS } from '../types';
import { useUser } from '../hooks/useUser';
import { submitScore, getDailyInfo, checkDailyPlayed } from '../utils/api';
import { createSeededRandom } from '../utils/seededRandom';
import './ChimpTest.css';

type GameState = 'instructions' | 'showing' | 'playing' | 'correct' | 'wrong' | 'finished';

interface NumberPosition {
  number: number;
  x: number;
  y: number;
  clicked: boolean;
}

const STARTING_NUMBERS = 4;
const MAX_STRIKES = 3;
const GRID_SIZE = 8; // 8x8 grid for positioning

function ChimpTest() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === 'true';
  
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [level, setLevel] = useState(STARTING_NUMBERS);
  const [strikes, setStrikes] = useState(0);
  const [numbers, setNumbers] = useState<NumberPosition[]>([]);
  const [nextExpected, setNextExpected] = useState(1);
  const [highestLevel, setHighestLevel] = useState(STARTING_NUMBERS);
  const [dailySeed, setDailySeed] = useState<string>('');
  const [dailyAlreadyPlayed, setDailyAlreadyPlayed] = useState(false);
  
  const randomRef = useRef<(() => number) | null>(null);
  const levelCountRef = useRef(0);

  const test = TESTS.chimp;

  // Check daily status
  useEffect(() => {
    if (isDaily && user) {
      getDailyInfo().then(info => {
        setDailySeed(info.seed);
        randomRef.current = createSeededRandom(info.seed + '-chimp');
        
        checkDailyPlayed(user.id, 'chimp').then(status => {
          if (status.played) {
            setDailyAlreadyPlayed(true);
          }
        });
      });
    } else {
      randomRef.current = () => Math.random();
    }
  }, [isDaily, user]);

  // Generate random positions for numbers
  const generateNumbers = useCallback((count: number): NumberPosition[] => {
    const random = randomRef.current || (() => Math.random());
    const positions: NumberPosition[] = [];
    const usedPositions = new Set<string>();
    
    for (let i = 1; i <= count; i++) {
      let x: number, y: number, key: string;
      
      // Find a unique position
      do {
        x = Math.floor(random() * GRID_SIZE);
        y = Math.floor(random() * GRID_SIZE);
        key = `${x},${y}`;
      } while (usedPositions.has(key));
      
      usedPositions.add(key);
      positions.push({ number: i, x, y, clicked: false });
    }
    
    return positions;
  }, []);

  const startLevel = useCallback((numCount: number) => {
    levelCountRef.current++;
    const newNumbers = generateNumbers(numCount);
    setNumbers(newNumbers);
    setNextExpected(1);
    setGameState('showing');
  }, [generateNumbers]);

  const startGame = () => {
    setLevel(STARTING_NUMBERS);
    setStrikes(0);
    setHighestLevel(STARTING_NUMBERS);
    levelCountRef.current = 0;
    
    // Reset random for daily consistency
    if (isDaily && dailySeed) {
      randomRef.current = createSeededRandom(dailySeed + '-chimp');
    }
    
    startLevel(STARTING_NUMBERS);
  };

  const handleSquareClick = (clickedNumber: number) => {
    if (gameState !== 'playing') return;
    
    if (clickedNumber === nextExpected) {
      // Correct click
      const updatedNumbers = numbers.map(n => 
        n.number === clickedNumber ? { ...n, clicked: true } : n
      );
      setNumbers(updatedNumbers);
      
      if (clickedNumber === numbers.length) {
        // Completed the level
        const newLevel = level + 1;
        setHighestLevel(Math.max(highestLevel, newLevel));
        setLevel(newLevel);
        setGameState('correct');
      } else {
        setNextExpected(clickedNumber + 1);
      }
    } else {
      // Wrong click
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      
      if (newStrikes >= MAX_STRIKES) {
        setGameState('finished');
      } else {
        setGameState('wrong');
      }
    }
  };

  const handleFirstClick = (clickedNumber: number) => {
    if (gameState === 'showing') {
      // Hide numbers and start playing
      setGameState('playing');
      
      // Also process this click - if they clicked on 1, it counts!
      if (clickedNumber === 1) {
        const updatedNumbers = numbers.map(n => 
          n.number === 1 ? { ...n, clicked: true } : n
        );
        setNumbers(updatedNumbers);
        
        if (numbers.length === 1) {
          // Only one number, level complete
          const newLevel = level + 1;
          setHighestLevel(Math.max(highestLevel, newLevel));
          setLevel(newLevel);
          setGameState('correct');
        } else {
          setNextExpected(2);
        }
      }
      // If they didn't click on 1, that's fine - they just need to find 1 now
    }
  };

  const continueGame = () => {
    if (gameState === 'correct') {
      startLevel(level);
    } else if (gameState === 'wrong') {
      // Retry same level
      startLevel(level);
    }
  };

  const finishGame = async () => {
    if (!user) return;
    
    // Score is the highest number of items successfully remembered
    const score = highestLevel - 1; // Subtract 1 because highestLevel is the level they were attempting
    
    try {
      await submitScore(user.id, 'chimp', score, isDaily);
      navigate(`/results/chimp?score=${score}&strikes=${strikes}&daily=${isDaily}`);
    } catch (error) {
      console.error('Failed to submit score:', error);
      navigate(`/results/chimp?score=${score}&strikes=${strikes}&daily=${isDaily}`);
    }
  };

  useEffect(() => {
    if (gameState === 'finished') {
      finishGame();
    }
  }, [gameState]);

  if (dailyAlreadyPlayed) {
    return (
      <div className="chimp-test container">
        <div className="already-played card">
          <h2>Daily Challenge Already Completed</h2>
          <p>You've already played today's chimp test challenge.</p>
          <p>Come back tomorrow for a new challenge!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chimp-test">
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
              
              <div className="chimp-info">
                <p>This test is based on a study that showed chimpanzees can outperform humans at this task!</p>
              </div>
              
              <button onClick={startGame} className="btn btn-primary btn-large">
                Start Test
              </button>
            </div>
          </div>
        </div>
      )}

      {(gameState === 'showing' || gameState === 'playing') && (
        <div className="game-screen">
          <div className="game-header">
            <div className="level-info">
              <span className="level-label">Numbers</span>
              <span className="level-value">{level}</span>
            </div>
            <div className="strikes-info">
              <span className="strikes-label">Strikes</span>
              <div className="strikes-display">
                {[...Array(MAX_STRIKES)].map((_, i) => (
                  <span 
                    key={i} 
                    className={`strike-marker ${i < strikes ? 'used' : ''}`}
                  >
                    ✕
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div 
            className="number-grid"
            onClick={gameState === 'showing' ? () => handleFirstClick(0) : undefined}
          >
            {numbers.map((num) => (
              <button
                key={num.number}
                className={`number-square ${num.clicked ? 'clicked' : ''} ${gameState === 'showing' ? 'showing' : 'hidden'}`}
                style={{
                  left: `${(num.x / GRID_SIZE) * 100}%`,
                  top: `${(num.y / GRID_SIZE) * 100}%`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (gameState === 'showing') {
                    handleFirstClick(num.number);
                  } else if (!num.clicked) {
                    handleSquareClick(num.number);
                  }
                }}
                disabled={num.clicked}
              >
                {(gameState === 'showing' || num.clicked) ? num.number : ''}
              </button>
            ))}
          </div>

          {gameState === 'showing' && (
            <p className="game-hint">Click any square to start</p>
          )}
          
          {gameState === 'playing' && (
            <p className="game-hint">Click the numbers in order: find {nextExpected}</p>
          )}
        </div>
      )}

      {gameState === 'correct' && (
        <div className="result-screen">
          <div className="result-content card">
            <div className="result-indicator success">
              <span className="icon icon-check"></span>
            </div>
            <h2>Level Complete!</h2>
            <p className="level-complete-info">
              You remembered <strong>{level - 1}</strong> numbers
            </p>
            <p className="next-level-info">
              Next: <strong>{level}</strong> numbers
            </p>
            <button onClick={continueGame} className="btn btn-primary btn-large">
              Continue
            </button>
          </div>
        </div>
      )}

      {gameState === 'wrong' && (
        <div className="result-screen">
          <div className="result-content card">
            <div className="result-indicator error">
              <span className="icon icon-x"></span>
            </div>
            <h2>Wrong!</h2>
            <p className="strikes-remaining">
              {MAX_STRIKES - strikes} strike{MAX_STRIKES - strikes !== 1 ? 's' : ''} remaining
            </p>
            <div className="correct-order">
              <p>The correct order was:</p>
              <div className="order-display">
                {numbers.sort((a, b) => a.number - b.number).map(n => (
                  <span key={n.number} className={`order-number ${n.clicked ? 'correct' : n.number === nextExpected ? 'missed' : ''}`}>
                    {n.number}
                  </span>
                ))}
              </div>
            </div>
            <button onClick={continueGame} className="btn btn-primary btn-large">
              Try Again ({level} numbers)
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

export default ChimpTest;