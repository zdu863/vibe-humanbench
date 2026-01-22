import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TESTS } from '../types';
import { useUser } from '../hooks/useUser';
import { submitScore, getDailyInfo, checkDailyPlayed } from '../utils/api';
import { createSeededRandom } from '../utils/seededRandom';
import './VerbalMemory.css';

type GameState = 'instructions' | 'playing' | 'finished';

// Common English words for the test
const WORD_POOL = [
  'apple', 'house', 'water', 'music', 'light', 'dream', 'world', 'heart', 'stone', 'river',
  'forest', 'cloud', 'ocean', 'mountain', 'garden', 'bridge', 'window', 'mirror', 'candle', 'silver',
  'golden', 'winter', 'summer', 'spring', 'autumn', 'morning', 'evening', 'shadow', 'thunder', 'breeze',
  'flower', 'butterfly', 'rainbow', 'sunset', 'sunrise', 'moonlight', 'starlight', 'silence', 'whisper', 'melody',
  'harmony', 'rhythm', 'dance', 'journey', 'adventure', 'mystery', 'legend', 'ancient', 'modern', 'future',
  'memory', 'wisdom', 'courage', 'passion', 'spirit', 'nature', 'freedom', 'peace', 'hope', 'faith',
  'castle', 'village', 'kingdom', 'empire', 'island', 'desert', 'jungle', 'valley', 'canyon', 'glacier',
  'volcano', 'crystal', 'diamond', 'emerald', 'sapphire', 'ruby', 'pearl', 'velvet', 'satin', 'cotton',
  'marble', 'bronze', 'copper', 'iron', 'steel', 'timber', 'bamboo', 'willow', 'maple', 'cedar',
  'falcon', 'eagle', 'phoenix', 'dragon', 'tiger', 'panther', 'dolphin', 'whale', 'turtle', 'raven'
];

const MAX_LIVES = 3;

function VerbalMemory() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === 'true';
  
  const [gameState, setGameState] = useState<GameState>('instructions');
  const [currentWord, setCurrentWord] = useState('');
  const [seenWords, setSeenWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [wordIsNew, setWordIsNew] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [dailySeed, setDailySeed] = useState<string>('');
  const [dailyAlreadyPlayed, setDailyAlreadyPlayed] = useState(false);
  
  const randomRef = useRef<(() => number) | null>(null);
  const wordPoolRef = useRef<string[]>([...WORD_POOL]);
  const usedWordsRef = useRef<string[]>([]);

  const test = TESTS['verbal-memory'];

  // Shuffle array using seeded random
  const shuffleArray = useCallback((array: string[], random: () => number): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // Get the next word
  const getNextWord = useCallback((): { word: string; isNew: boolean } => {
    if (!randomRef.current) {
      randomRef.current = () => Math.random();
    }
    
    const random = randomRef.current;
    
    // Decide whether to show a new word or a seen word
    // Probability of showing a seen word increases as more words are seen
    const seenCount = usedWordsRef.current.length;
    const showSeenProbability = Math.min(0.5, seenCount * 0.05); // Max 50% chance
    
    if (seenCount > 0 && random() < showSeenProbability) {
      // Show a previously seen word
      const idx = Math.floor(random() * usedWordsRef.current.length);
      return { word: usedWordsRef.current[idx], isNew: false };
    } else {
      // Show a new word
      if (wordPoolRef.current.length === 0) {
        // Refill pool if empty (shouldn't happen in normal play)
        wordPoolRef.current = shuffleArray([...WORD_POOL], random);
      }
      const word = wordPoolRef.current.pop()!;
      return { word, isNew: true };
    }
  }, [shuffleArray]);

  // Check daily status
  useEffect(() => {
    if (isDaily && user) {
      getDailyInfo().then(info => {
        setDailySeed(info.seed);
        randomRef.current = createSeededRandom(info.seed + '-verbal');
        wordPoolRef.current = shuffleArray([...WORD_POOL], randomRef.current);
        
        checkDailyPlayed(user.id, 'verbal-memory').then(status => {
          if (status.played) {
            setDailyAlreadyPlayed(true);
          }
        });
      });
    } else {
      randomRef.current = () => Math.random();
      // Shuffle word pool
      wordPoolRef.current = shuffleArray([...WORD_POOL], randomRef.current);
    }
  }, [isDaily, user, shuffleArray]);

  const showNextWord = useCallback(() => {
    const { word, isNew } = getNextWord();
    setCurrentWord(word);
    setWordIsNew(isNew);
    setFeedback(null);
  }, [getNextWord]);

  const startGame = () => {
    setScore(0);
    setLives(MAX_LIVES);
    setSeenWords(new Set());
    usedWordsRef.current = [];
    wordPoolRef.current = shuffleArray([...WORD_POOL], randomRef.current || Math.random);
    setGameState('playing');
    showNextWord();
  };

  const handleAnswer = (answeredSeen: boolean) => {
    const isCorrect = answeredSeen === !wordIsNew;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback('correct');
    } else {
      setLives(prev => prev - 1);
      setFeedback('wrong');
      
      if (lives <= 1) {
        // Game over
        setTimeout(() => {
          setGameState('finished');
        }, 500);
        return;
      }
    }
    
    // If word was actually new, add it to seen words
    if (wordIsNew) {
      setSeenWords(prev => new Set(prev).add(currentWord));
      usedWordsRef.current.push(currentWord);
    }
    
    // Show next word after brief delay
    setTimeout(() => {
      showNextWord();
    }, 300);
  };

  const finishGame = async () => {
    if (!user) return;
    
    try {
      await submitScore(user.id, 'verbal-memory', score, isDaily);
      navigate(`/results/verbal-memory?score=${score}&daily=${isDaily}`);
    } catch (error) {
      console.error('Failed to submit score:', error);
      navigate(`/results/verbal-memory?score=${score}&daily=${isDaily}`);
    }
  };

  useEffect(() => {
    if (gameState === 'finished') {
      finishGame();
    }
  }, [gameState]);

  if (dailyAlreadyPlayed) {
    return (
      <div className="verbal-memory container">
        <div className="already-played card">
          <h2>Daily Challenge Already Completed</h2>
          <p>You've already played today's verbal memory challenge.</p>
          <p>Come back tomorrow for a new challenge!</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="verbal-memory">
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

      {gameState === 'playing' && (
        <div className="game-screen">
          <div className="game-status">
            <div className="status-item">
              <span className="status-label">Score</span>
              <span className="status-value">{score}</span>
            </div>
            <div className="status-item lives">
              <span className="status-label">Lives</span>
              <div className="lives-display">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <span 
                    key={i} 
                    className={`life ${i < lives ? 'active' : 'lost'}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className={`word-display ${feedback || ''}`}>
            <span className="current-word">{currentWord}</span>
          </div>
          
          <div className="answer-buttons">
            <button 
              className="btn btn-answer btn-seen"
              onClick={() => handleAnswer(true)}
            >
              SEEN
            </button>
            <button 
              className="btn btn-answer btn-new"
              onClick={() => handleAnswer(false)}
            >
              NEW
            </button>
          </div>
          
          <p className="hint">
            Have you seen this word before during this test?
          </p>
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

export default VerbalMemory;