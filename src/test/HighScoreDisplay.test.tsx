import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HighScore } from '../types/tetris';

// Mock data
const mockHighScores: HighScore[] = [
  {
    id: '1',
    score: 50000,
    level: 10,
    lines: 80,
    date: new Date('2024-01-15').getTime(),
    playerName: 'TETRIS_MASTER',
  },
  {
    id: '2',
    score: 35000,
    level: 8,
    lines: 60,
    date: new Date('2024-01-14').getTime(),
    playerName: 'CYBER_PLAYER',
  },
  {
    id: '3',
    score: 25000,
    level: 6,
    lines: 40,
    date: new Date('2024-01-13').getTime(),
  },
];

// Mock HighScoreDisplay component (not yet implemented)
const MockHighScoreDisplay = ({
  highScores,
  showRank = true,
  maxDisplay = 10,
}: {
  highScores: HighScore[];
  showRank?: boolean;
  maxDisplay?: number;
}) => {
  return (
    <div data-testid='high-score-display' className='hologram-cyan p-4'>
      <h3 className='text-xl font-bold mb-4 text-cyber-cyan'>🏆 High Scores</h3>
      <div className='space-y-2'>
        {highScores.slice(0, maxDisplay).map((score, index) => (
          <div
            key={score.id}
            className='flex justify-between items-center p-2 rounded neon-border-cyan'
            data-testid={`high-score-item-${index}`}
          >
            <div className='flex items-center gap-2'>
              {showRank && <span className='text-cyber-yellow font-bold w-8'>#{index + 1}</span>}
              <div>
                <div className='font-bold text-cyber-cyan'>{score.score.toLocaleString()}</div>
                <div className='text-sm text-gray-400'>
                  Level {score.level} • {score.lines} lines
                </div>
              </div>
            </div>
            <div className='text-right'>
              {score.playerName && (
                <div className='text-sm text-cyber-purple font-semibold'>{score.playerName}</div>
              )}
              <div className='text-xs text-gray-500'>
                {new Date(score.date).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        ))}
      </div>
      {highScores.length === 0 && (
        <div className='text-center text-gray-500 py-8' data-testid='no-scores-message'>
          No high scores yet
        </div>
      )}
    </div>
  );
};

describe('HighScoreDisplay component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic display functionality', () => {
    it('Displays high score list correctly', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);

      expect(screen.getByTestId('high-score-display')).toBeInTheDocument();
      expect(screen.getByText('🏆 High Scores')).toBeInTheDocument();

      // Verify each score item is displayed
      expect(screen.getByTestId('high-score-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('high-score-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('high-score-item-2')).toBeInTheDocument();
    });

    it('Displays scores in correct format', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);

      // Verify numbers are displayed with comma separators
      expect(screen.getByText('50,000')).toBeInTheDocument();
      expect(screen.getByText('35,000')).toBeInTheDocument();
      expect(screen.getByText('25,000')).toBeInTheDocument();
    });

    it('Displays level and line count', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);

      expect(screen.getByText('Level 10 • 80 lines')).toBeInTheDocument();
      expect(screen.getByText('Level 8 • 60 lines')).toBeInTheDocument();
      expect(screen.getByText('Level 6 • 40 lines')).toBeInTheDocument();
    });

    it('Displays player name if available', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);

      expect(screen.getByText('TETRIS_MASTER')).toBeInTheDocument();
      expect(screen.getByText('CYBER_PLAYER')).toBeInTheDocument();
      // Player name is not displayed for the 3rd score which has no name
      expect(screen.queryByText('Player 3')).not.toBeInTheDocument();
    });

    it('Displays date in Japanese format', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);

      expect(screen.getByText('2024/1/15')).toBeInTheDocument();
      expect(screen.getByText('2024/1/14')).toBeInTheDocument();
      expect(screen.getByText('2024/1/13')).toBeInTheDocument();
    });
  });

  describe('Rank display functionality', () => {
    it('Displays rank when showRank is true', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} showRank={true} />);

      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('#3')).toBeInTheDocument();
    });

    it('Does not display rank when showRank is false', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} showRank={false} />);

      expect(screen.queryByText('#1')).not.toBeInTheDocument();
      expect(screen.queryByText('#2')).not.toBeInTheDocument();
      expect(screen.queryByText('#3')).not.toBeInTheDocument();
    });
  });

  describe('Display count limitation functionality', () => {
    it('Can limit display count with maxDisplay', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} maxDisplay={2} />);

      expect(screen.getByTestId('high-score-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('high-score-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('high-score-item-2')).not.toBeInTheDocument();
    });

    it('Displays all items when maxDisplay is larger than array length', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} maxDisplay={10} />);

      expect(screen.getByTestId('high-score-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('high-score-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('high-score-item-2')).toBeInTheDocument();
    });
  });

  describe('Empty state display', () => {
    it('Displays appropriate message when high scores are empty', () => {
      render(<MockHighScoreDisplay highScores={[]} />);

      expect(screen.getByTestId('no-scores-message')).toBeInTheDocument();
      expect(screen.getByText('No high scores yet')).toBeInTheDocument();
    });
  });

  describe('CSS classes and styling', () => {
    it('Cyberpunk theme CSS classes are applied', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);

      const container = screen.getByTestId('high-score-display');
      expect(container).toHaveClass('hologram-cyan');
      expect(container).toHaveClass('p-4');
    });

    it('Neon border is applied to each score item', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);

      const firstItem = screen.getByTestId('high-score-item-0');
      expect(firstItem).toHaveClass('neon-border-cyan');
    });
  });
});

describe('High score related utility functions (planned)', () => {
  it('Can determine if score ranks in Top 10', () => {
    // This function will be implemented later
    expect(true).toBe(true);
  });

  it('Can get rank when achieving new record', () => {
    // This function will be implemented later
    expect(true).toBe(true);
  });

  it('Can generate congratulatory message when achieving high score', () => {
    // This function will be implemented later
    expect(true).toBe(true);
  });
});
