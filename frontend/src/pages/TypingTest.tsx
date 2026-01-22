import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TESTS } from '../types';
import { useUser } from '../hooks/useUser';
import { submitScore, getDailyInfo, checkDailyPlayed } from '../utils/api';
import { getRandomParagraph, calculateWPM, calculateAccuracy, TypingMode } from '../utils/typingParagraphs';
import './TypingTest.css';

type GameState = 'instructions' | 'ready' | 'typing' | 'finished' | 'saving';

const MODE_INFO: Record<TypingMode, { name: string; description: string }> = {
  short: { name: 'Short', description: 'A quick sentence' },
  medium: { name: 'Medium', description: 'A paragraph' },
  long: { name: 'Long', description: 'Multiple paragraphs' }
};

function TypingTest() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === 'true';
  
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [mode, setMode] = useState<TypingMode>('medium');
  const [paragraph, setParagraph] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [dailySeed, setDailySeed] = useState<string>('');
  const [dailyAlreadyPlayed, setDailyAlreadyPlayed] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paragraphRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  const test = TESTS.typing;

  // Check daily status
  useEffect(() => {
    if (isDaily && user) {
      getDailyInfo().then(info => {
        setDailySeed(info.seed);
        setParagraph(getRandomParagraph(info.seed, mode));
        
        checkDailyPlayed(user.id, 'typing').then(status => {
          if (status.played) {
            setDailyAlreadyPlayed(true);
          }
        });
      });
    } else {
      setParagraph(getRandomParagraph(undefined, mode));
    }
  }, [isDaily, user, mode]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Real-time timer update
  useEffect(() => {
    if (gameState === 'typing' && startTime) {
      timerRef.current = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, startTime]);

  // Auto-scroll to keep current character visible (especially for long mode)
  useEffect(() => {
    if (currentCharRef.current && paragraphRef.current) {
      const container = paragraphRef.current;
      const currentChar = currentCharRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const charRect = currentChar.getBoundingClientRect();
      
      // Check if the current character is below the visible area
      const charRelativeTop = charRect.top - containerRect.top;
      const containerHeight = container.clientHeight;
      
      if (charRelativeTop > containerHeight - 60) {
        // Scroll to keep the current line in the middle of the container
        container.scrollTop += charRelativeTop - containerHeight / 2;
      }
    }
  }, [typedText.length]);

  // Calculate stats
  const stats = useMemo(() => {
    const correctChars = typedText.split('').filter((char, idx) => char === paragraph[idx]).length;
    const totalTyped = typedText.length;
    const timeElapsed = startTime ? (endTime || Date.now()) - startTime : 0;
    const timeInSeconds = timeElapsed / 1000;
    
    return {
      correctChars,
      totalTyped,
      wpm: calculateWPM(correctChars, timeInSeconds),
      accuracy: calculateAccuracy(correctChars, totalTyped),
      timeElapsed: timeInSeconds,
      progress: (typedText.length / paragraph.length) * 100,
      isComplete: typedText.length >= paragraph.length
    };
  }, [typedText, paragraph, startTime, endTime]);

  const startGame = () => {
    if (!paragraph) {
      setParagraph(getRandomParagraph(isDaily ? dailySeed : undefined, mode));
    }
    setTypedText('');
    setStartTime(null);
    setEndTime(null);
    setCurrentTime(0);
    setGameState('ready');
    
    // Focus input after state updates
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Start timer on first keystroke
    if (!startTime && value.length > 0) {
      setStartTime(Date.now());
      setGameState('typing');
    }
    
    // Don't allow typing past the paragraph length
    if (value.length > paragraph.length) {
      return;
    }
    
    setTypedText(value);
    
    // Check if finished
    if (value.length === paragraph.length) {
      setEndTime(Date.now());
      setGameState('finished');
      cleanup();
    }
  }, [startTime, paragraph.length, cleanup]);

  const handleInputFocus = () => {
    if (gameState === 'ready') {
      // Ready to start typing
    }
  };

  const finishGame = async () => {
    if (!user) return;
    
    setGameState('saving');
    
    // Calculate final WPM
    const timeInSeconds = (endTime! - startTime!) / 1000;
    const correctChars = typedText.split('').filter((char, idx) => char === paragraph[idx]).length;
    const finalWPM = calculateWPM(correctChars, timeInSeconds);
    const finalAccuracy = calculateAccuracy(correctChars, typedText.length);
    
    try {
      await submitScore(user.id, 'typing', finalWPM, isDaily);
      navigate(`/results/typing?score=${finalWPM}&accuracy=${finalAccuracy}&time=${Math.round(timeInSeconds)}&daily=${isDaily}`);
    } catch (error) {
      console.error('Failed to submit score:', error);
      navigate(`/results/typing?score=${finalWPM}&accuracy=${finalAccuracy}&time=${Math.round(timeInSeconds)}&daily=${isDaily}`);
    }
  };

  const restartGame = () => {
    setParagraph(getRandomParagraph(isDaily ? dailySeed : undefined, mode));
    setTypedText('');
    setStartTime(null);
    setEndTime(null);
    setCurrentTime(0);
    setGameState('ready');
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  // Render the paragraph with character highlighting, grouped by words for proper wrapping
  const renderParagraph = () => {
    const elements: React.ReactNode[] = [];
    let wordStart = 0;
    
    for (let i = 0; i <= paragraph.length; i++) {
      const char = paragraph[i];
      
      // At space, newline, or end of paragraph, render the word
      if (i === paragraph.length || char === ' ' || char === '\n') {
        // Render the word (characters from wordStart to i-1)
        if (i > wordStart) {
          const wordChars = [];
          for (let j = wordStart; j < i; j++) {
            let className = 'char';
            const isCurrent = j === typedText.length;
            if (j < typedText.length) {
              className += typedText[j] === paragraph[j] ? ' correct' : ' incorrect';
            } else if (isCurrent) {
              className += ' current';
            }
            wordChars.push(
              <span 
                key={j} 
                className={className}
                ref={isCurrent ? currentCharRef : undefined}
              >
                {paragraph[j]}
              </span>
            );
          }
          elements.push(
            <span key={`word-${wordStart}`} className="word">
              {wordChars}
            </span>
          );
        }
        
        // Render the space or newline (if not at end)
        if (i < paragraph.length) {
          if (char === '\n') {
            // Render newline as a line break
            let className = 'char newline';
            const isCurrent = i === typedText.length;
            if (i < typedText.length) {
              className += typedText[i] === '\n' ? ' correct' : ' incorrect';
            } else if (isCurrent) {
              className += ' current';
            }
            elements.push(
              <span key={i} className={className} ref={isCurrent ? currentCharRef : undefined}>
                {' '}
              </span>
            );
            elements.push(<br key={`br-${i}`} />);
            wordStart = i + 1;
          } else if (char === ' ') {
            let className = 'char space';
            const isCurrent = i === typedText.length;
            if (i < typedText.length) {
              className += typedText[i] === ' ' ? ' correct' : ' incorrect';
            } else if (isCurrent) {
              className += ' current';
            }
            elements.push(
              <span key={i} className={className} ref={isCurrent ? currentCharRef : undefined}>
                {' '}
              </span>
            );
            wordStart = i + 1;
          }
        }
      }
    }
    
    return elements;
  };

  if (dailyAlreadyPlayed) {
    return (
      <div className="typing-test container">
        <div className="already-played card">
          <h2>Daily Challenge Already Completed</h2>
          <p>You've already played today's typing challenge.</p>
          <p>Come back tomorrow for a new challenge!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="typing-test">
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
              
              <div className="mode-selector">
                <h3>Select Length</h3>
                <div className="mode-options">
                  {(Object.keys(MODE_INFO) as TypingMode[]).map((m) => (
                    <button
                      key={m}
                      className={`mode-option ${mode === m ? 'active' : ''}`}
                      onClick={() => setMode(m)}
                    >
                      <span className="mode-name">{MODE_INFO[m].name}</span>
                      <span className="mode-desc">{MODE_INFO[m].description}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <button onClick={startGame} className="btn btn-primary btn-large">
                Start Test
              </button>
            </div>
          </div>
        </div>
      )}

      {(gameState === 'ready' || gameState === 'typing') && (
        <div className="game-screen">
          <div className="typing-stats">
            <div className="stat-box">
              <span className="stat-label">WPM</span>
              <span className="stat-value">{stats.wpm}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{stats.accuracy}%</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Time</span>
              <span className="stat-value">{formatTime(currentTime)}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Progress</span>
              <span className="stat-value">{Math.round(stats.progress)}%</span>
            </div>
          </div>

          <div className={`typing-container card ${mode === 'long' ? 'long-mode' : ''}`}>
            <div className={`paragraph-display ${mode}`} ref={paragraphRef}>
              {renderParagraph()}
            </div>
            
            <textarea
              ref={inputRef}
              value={typedText}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="typing-input"
              placeholder={gameState === 'ready' ? 'Click here and start typing...' : ''}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>

          <div className="progress-container">
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar" 
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          {gameState === 'ready' && (
            <p className="typing-hint">Start typing to begin the timer</p>
          )}
        </div>
      )}

      {gameState === 'finished' && (
        <div className="results-screen">
          <div className="results-content card">
            <div className="result-indicator success">
              <span className="icon icon-check"></span>
            </div>
            <h2>Test Complete!</h2>
            
            <div className="final-stats">
              <div className="final-stat main">
                <span className="stat-value">{stats.wpm}</span>
                <span className="stat-label">Words Per Minute</span>
              </div>
              <div className="final-stats-row">
                <div className="final-stat">
                  <span className="stat-value">{stats.accuracy}%</span>
                  <span className="stat-label">Accuracy</span>
                </div>
                <div className="final-stat">
                  <span className="stat-value">{formatTime(Math.round(stats.timeElapsed))}</span>
                  <span className="stat-label">Time</span>
                </div>
                <div className="final-stat">
                  <span className="stat-value">{stats.correctChars}</span>
                  <span className="stat-label">Correct Chars</span>
                </div>
              </div>
            </div>
            
            <div className="result-actions">
              <button onClick={finishGame} className="btn btn-primary btn-large">
                Save & View Results
              </button>
              <button onClick={restartGame} className="btn btn-secondary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'saving' && (
        <div className="finished-screen">
          <div className="spinner"></div>
          <p>Saving results...</p>
        </div>
      )}
    </div>
  );
}

export default TypingTest;