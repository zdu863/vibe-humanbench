import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TESTS } from '../types';
import { useUser } from '../hooks/useUser';
import { submitScore, getDailyInfo, checkDailyPlayed } from '../utils/api';
import { createSeededRandom } from '../utils/seededRandom';
import './SequenceMemory.css';

type GameState = 'instructions' | 'showing' | 'input' | 'wrong' | 'finished';

const GRID_SIZE = 9; // 3x3 grid
const FLASH_DURATION = 500; // ms per tile flash
const FLASH_GAP = 200; // ms between flashes

function SequenceMemory() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === 'true';
  
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [dailySeed, setDailySeed] = useState<string>('');
  const [dailyAlreadyPlayed, setDailyAlreadyPlayed] = useState(false);
  
  const randomRef = useRef<(() => number) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const test = TESTS['sequence-memory'];

  // Generate next tile in sequence
  const getNextTile = useCallback((): number => {
    if (!randomRef.current) {
      randomRef.current = () => Math.random();
    }
    return Math.floor(randomRef.current() * GRID_SIZE);
  }, []);

  // Check daily status
  useEffect(() => {
    if (isDaily && user) {
      getDailyInfo().then(info => {
        setDailySeed(info.seed);
        randomRef.current = createSeededRandom(info.seed + '-sequence');
        
        checkDailyPlayed(user.id, 'sequence-memory').then(status => {
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Play the sequence animation
  const playSequence = useCallback((seq: number[]) => {
    setGameState('showing');
    setActiveTile(null);
    
    let i = 0;
    const playNext = () => {
      if (i < seq.length) {
        setActiveTile(seq[i]);
        timeoutRef.current = setTimeout(() => {
          setActiveTile(null);
          timeoutRef.current = setTimeout(() => {
            i++;
            playNext();
          }, FLASH_GAP);
        }, FLASH_DURATION);
      } else {
        // Sequence finished, wait for user input
        setGameState('input');
        setUserInput([]);
      }
    };
    
    // Small delay before starting
    timeoutRef.current = setTimeout(playNext, 500);
  }, []);

  const startLevel = useCallback((lvl: number, currentSequence: number[] = []) => {
    cleanup();
    
    // Add one more tile to sequence
    const newTile = getNextTile();
    const newSequence = [...currentSequence, newTile];
    setSequence(newSequence);
    setLevel(lvl);
    setWrongTile(null);
    
    // Play the sequence
    playSequence(newSequence);
  }, [cleanup, getNextTile, playSequence]);

  const startGame = () => {
    // Reset random generator for consistent daily play
    if (isDaily && dailySeed) {
      randomRef.current = createSeededRandom(dailySeed + '-sequence');
    }
    
    setSequence([]);
    setUserInput([]);
    setLevel(1);
    startLevel(1, []);
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'input') return;
    
    const expectedTile = sequence[userInput.length];
    
    if (index === expectedTile) {
      // Correct tile
      const newUserInput = [...userInput, index];
      setUserInput(newUserInput);
      setActiveTile(index);
      
      setTimeout(() => {
        setActiveTile(null);
      }, 150);
      
      // Check if sequence is complete
      if (newUserInput.length === sequence.length) {
        // Level complete, start next level
        setTimeout(() => {
          startLevel(level + 1, sequence);
        }, 500);
      }
    } else {
      // Wrong tile
      setWrongTile(index);
      setGameState('wrong');
    }
  };

  const finishGame = async () => {
    if (!user) return;
    
    // Score is the level reached minus 1 (since they failed on current level)
    const finalScore = level - 1;
    
    try {
      await submitScore(user.id, 'sequence-memory', finalScore, isDaily);
      navigate(`/results/sequence-memory?score=${finalScore}&daily=${isDaily}`);
    } catch (error) {
      console.error('Failed to submit score:', error);
      navigate(`/results/sequence-memory?score=${finalScore}&daily=${isDaily}`);
    }
  };

  useEffect(() => {
    if (gameState === 'finished') {
      finishGame();
    }
  }, [gameState]);

  if (dailyAlreadyPlayed) {
    return (
      <div className="sequence-memory container">
        <div className="already-played card">
          <h2>Daily Challenge Already Completed</h2>
          <p>You've already played today's sequence memory challenge.</p>
          <p>Come back tomorrow for a new challenge!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sequence-memory">
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

      {(gameState === 'showing' || gameState === 'input') && (
        <div className="game-screen">
          <div className="game-status">
            <span className="level-display">Level {level}</span>
            {gameState === 'showing' && (
              <span className="status-text">Watch the sequence...</span>
            )}
            {gameState === 'input' && (
              <span className="status-text">
                Your turn ({userInput.length}/{sequence.length})
              </span>
            )}
          </div>
          
          <div className="tile-grid">
            {Array.from({ length: GRID_SIZE }).map((_, index) => (
              <button
                key={index}
                className={`tile ${activeTile === index ? 'active' : ''}`}
                onClick={() => handleTileClick(index)}
                disabled={gameState !== 'input'}
              />
            ))}
          </div>
        </div>
      )}

      {gameState === 'wrong' && (
        <div className="game-screen wrong-screen">
          <div className="result-indicator error">
            <span className="icon icon-x"></span>
          </div>
          <h2>Wrong tile!</h2>
          
          <div className="tile-grid">
            {Array.from({ length: GRID_SIZE }).map((_, index) => (
              <div
                key={index}
                className={`tile ${
                  index === sequence[userInput.length] ? 'correct-tile' : ''
                } ${index === wrongTile ? 'wrong-tile' : ''}`}
              />
            ))}
          </div>
          
          <p className="final-score">
            You reached level <strong>{level}</strong>
          </p>
          <button 
            onClick={() => setGameState('finished')} 
            className="btn btn-primary btn-large"
          >
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

export default SequenceMemory;