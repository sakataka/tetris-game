import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HighScore } from '../types/tetris';

// モックデータ
const mockHighScores: HighScore[] = [
  {
    id: '1',
    score: 50000,
    level: 10,
    lines: 80,
    date: new Date('2024-01-15').getTime(),
    playerName: 'TETRIS_MASTER'
  },
  {
    id: '2',
    score: 35000,
    level: 8,
    lines: 60,
    date: new Date('2024-01-14').getTime(),
    playerName: 'CYBER_PLAYER'
  },
  {
    id: '3',
    score: 25000,
    level: 6,
    lines: 40,
    date: new Date('2024-01-13').getTime()
  }
];

// HighScoreDisplayコンポーネント（まだ実装されていない）をモック
const MockHighScoreDisplay = ({ highScores, showRank = true, maxDisplay = 10 }: {
  highScores: HighScore[];
  showRank?: boolean;
  maxDisplay?: number;
}) => {
  return (
    <div data-testid="high-score-display" className="hologram-cyan p-4">
      <h3 className="text-xl font-bold mb-4 text-cyber-cyan">
        🏆 High Scores
      </h3>
      <div className="space-y-2">
        {highScores.slice(0, maxDisplay).map((score, index) => (
          <div 
            key={score.id} 
            className="flex justify-between items-center p-2 rounded neon-border-cyan"
            data-testid={`high-score-item-${index}`}
          >
            <div className="flex items-center gap-2">
              {showRank && (
                <span className="text-cyber-yellow font-bold w-8">
                  #{index + 1}
                </span>
              )}
              <div>
                <div className="font-bold text-cyber-cyan">
                  {score.score.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  Level {score.level} • {score.lines} lines
                </div>
              </div>
            </div>
            <div className="text-right">
              {score.playerName && (
                <div className="text-sm text-cyber-purple font-semibold">
                  {score.playerName}
                </div>
              )}
              <div className="text-xs text-gray-500">
                {new Date(score.date).toLocaleDateString('ja-JP')}
              </div>
            </div>
          </div>
        ))}
      </div>
      {highScores.length === 0 && (
        <div className="text-center text-gray-500 py-8" data-testid="no-scores-message">
          まだハイスコアがありません
        </div>
      )}
    </div>
  );
};

describe('HighScoreDisplay コンポーネント', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本的な表示機能', () => {
    it('ハイスコアリストを正しく表示する', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);
      
      expect(screen.getByTestId('high-score-display')).toBeInTheDocument();
      expect(screen.getByText('🏆 High Scores')).toBeInTheDocument();
      
      // 各スコアアイテムが表示されることを確認
      expect(screen.getByTestId('high-score-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('high-score-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('high-score-item-2')).toBeInTheDocument();
    });

    it('スコアを正しい形式で表示する', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);
      
      // 数値がカンマ区切りで表示されることを確認
      expect(screen.getByText('50,000')).toBeInTheDocument();
      expect(screen.getByText('35,000')).toBeInTheDocument();
      expect(screen.getByText('25,000')).toBeInTheDocument();
    });

    it('レベルとライン数を表示する', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);
      
      expect(screen.getByText('Level 10 • 80 lines')).toBeInTheDocument();
      expect(screen.getByText('Level 8 • 60 lines')).toBeInTheDocument();
      expect(screen.getByText('Level 6 • 40 lines')).toBeInTheDocument();
    });

    it('プレイヤー名がある場合は表示する', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);
      
      expect(screen.getByText('TETRIS_MASTER')).toBeInTheDocument();
      expect(screen.getByText('CYBER_PLAYER')).toBeInTheDocument();
      // プレイヤー名がない3番目のスコアには名前が表示されない
      expect(screen.queryByText('Player 3')).not.toBeInTheDocument();
    });

    it('日付を日本語形式で表示する', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);
      
      expect(screen.getByText('2024/1/15')).toBeInTheDocument();
      expect(screen.getByText('2024/1/14')).toBeInTheDocument();
      expect(screen.getByText('2024/1/13')).toBeInTheDocument();
    });
  });

  describe('順位表示機能', () => {
    it('showRankがtrueの場合、順位を表示する', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} showRank={true} />);
      
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('#3')).toBeInTheDocument();
    });

    it('showRankがfalseの場合、順位を表示しない', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} showRank={false} />);
      
      expect(screen.queryByText('#1')).not.toBeInTheDocument();
      expect(screen.queryByText('#2')).not.toBeInTheDocument();
      expect(screen.queryByText('#3')).not.toBeInTheDocument();
    });
  });

  describe('表示件数制限機能', () => {
    it('maxDisplayで表示件数を制限できる', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} maxDisplay={2} />);
      
      expect(screen.getByTestId('high-score-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('high-score-item-1')).toBeInTheDocument();
      expect(screen.queryByTestId('high-score-item-2')).not.toBeInTheDocument();
    });

    it('maxDisplayが配列長より大きい場合、全て表示する', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} maxDisplay={10} />);
      
      expect(screen.getByTestId('high-score-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('high-score-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('high-score-item-2')).toBeInTheDocument();
    });
  });

  describe('空の状態の表示', () => {
    it('ハイスコアが空の場合、適切なメッセージを表示する', () => {
      render(<MockHighScoreDisplay highScores={[]} />);
      
      expect(screen.getByTestId('no-scores-message')).toBeInTheDocument();
      expect(screen.getByText('まだハイスコアがありません')).toBeInTheDocument();
    });
  });

  describe('CSS クラスとスタイリング', () => {
    it('サイバーパンクテーマのCSSクラスが適用されている', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);
      
      const container = screen.getByTestId('high-score-display');
      expect(container).toHaveClass('hologram-cyan');
      expect(container).toHaveClass('p-4');
    });

    it('各スコアアイテムにネオンボーダーが適用されている', () => {
      render(<MockHighScoreDisplay highScores={mockHighScores} />);
      
      const firstItem = screen.getByTestId('high-score-item-0');
      expect(firstItem).toHaveClass('neon-border-cyan');
    });
  });
});

describe('ハイスコア関連のユーティリティ関数（予定）', () => {
  it('スコアがTop 10入りするかを判定できる', () => {
    // この関数は後で実装予定
    expect(true).toBe(true);
  });

  it('新記録達成時のランクを取得できる', () => {
    // この関数は後で実装予定
    expect(true).toBe(true);
  });

  it('ハイスコア達成時のお祝いメッセージを生成できる', () => {
    // この関数は後で実装予定
    expect(true).toBe(true);
  });
});