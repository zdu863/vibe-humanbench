export interface User {
  id: string;
  username: string;
  created_at: string;
}

export interface Score {
  id: number;
  user_id: string;
  test_type: TestType;
  score: number;
  is_daily: boolean;
  daily_seed: string | null;
  created_at: string;
}

export interface UserStats {
  user_id: string;
  test_type: TestType;
  best_score: number | null;
  games_played: number;
  average_score: number;
  last_played: string | null;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  created_at: string;
}

export type TestType = 'reaction' | 'aim' | 'number-memory' | 'verbal-memory' | 'sequence-memory';

export interface TestInfo {
  id: TestType;
  name: string;
  description: string;
  iconClass: string;
  color: string;
  unit: string;
  instructions: string[];
  scoreBetterWhen: 'lower' | 'higher';
}

export const TESTS: Record<TestType, TestInfo> = {
  reaction: {
    id: 'reaction',
    name: 'Reaction Time',
    description: 'Test your reflexes. Click as fast as you can when the screen turns green.',
    iconClass: 'icon-bolt',
    color: '#4ade80',
    unit: 'ms',
    instructions: [
      'Wait for the screen to turn green',
      'Click as quickly as possible when it changes',
      'Your reaction time will be measured in milliseconds',
      'Complete 5 rounds - your average will be calculated'
    ],
    scoreBetterWhen: 'lower'
  },
  aim: {
    id: 'aim',
    name: 'Aim Trainer',
    description: 'Test your precision. Click on targets as quickly and accurately as possible.',
    iconClass: 'icon-target',
    color: '#f87171',
    unit: 'ms',
    instructions: [
      'Click on the targets as they appear',
      'Each target must be clicked before the next appears',
      'Your time per target is measured',
      'Complete 30 targets - your average time will be calculated'
    ],
    scoreBetterWhen: 'lower'
  },
  'number-memory': {
    id: 'number-memory',
    name: 'Number Memory',
    description: 'Remember the longest number you can. Each level adds one more digit.',
    iconClass: 'icon-number',
    color: '#a78bfa',
    unit: ' levels',
    instructions: [
      'A number will briefly appear on screen',
      'Memorize the number before it disappears',
      'Type the number you saw and submit',
      'Each level adds one more digit',
      'The game ends when you enter the wrong number'
    ],
    scoreBetterWhen: 'higher'
  },
  'verbal-memory': {
    id: 'verbal-memory',
    name: 'Verbal Memory',
    description: 'Keep as many words in short-term memory as possible.',
    iconClass: 'icon-text',
    color: '#fbbf24',
    unit: ' words',
    instructions: [
      'You will see words shown one at a time',
      'If you have seen the word during this test, click SEEN',
      'If it is a new word, click NEW',
      'You have 3 lives - the game ends after 3 mistakes',
      'Your score is the number of correct answers'
    ],
    scoreBetterWhen: 'higher'
  },
  'sequence-memory': {
    id: 'sequence-memory',
    name: 'Sequence Memory',
    description: 'Remember an increasingly long pattern of button presses.',
    iconClass: 'icon-grid',
    color: '#14b8a6',
    unit: ' levels',
    instructions: [
      'Watch the sequence of tiles that light up',
      'Repeat the sequence by clicking the tiles in order',
      'Each level adds one more tile to the sequence',
      'The game ends when you click the wrong tile',
      'Your score is the highest level reached'
    ],
    scoreBetterWhen: 'higher'
  }
};
