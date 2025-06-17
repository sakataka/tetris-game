/**
 * Statistics Calculation Hook
 * Handles complex statistics calculations and caching
 */

import type { GameStatistics, HighScore } from '../types/tetris';
import { StatisticsService } from '../utils/data/StatisticsService';
import type { EnhancedStatistics, GameSession } from '../utils/data/statisticsUtils';

interface UseStatisticsCalculationProps {
  baseStatistics: GameStatistics;
  sessions?: GameSession[];
  highScores: readonly HighScore[];
  selectedPeriod: string;
  showDetailedView?: boolean;
}

export const useStatisticsCalculation = ({
  baseStatistics,
  sessions = [],
  highScores,
  selectedPeriod,
  showDetailedView = true,
}: UseStatisticsCalculationProps) => {
  // Validate and normalize the period
  const period = StatisticsService.validatePeriod(selectedPeriod);

  // Calculate enhanced statistics using StatisticsService
  // React Compiler will optimize this calculation
  const statistics: EnhancedStatistics = StatisticsService.calculatePeriodStatistics(
    baseStatistics,
    sessions,
    highScores,
    period
  );

  // Calculate advanced metrics for detailed view
  // React Compiler will optimize this conditional calculation
  const advancedMetrics = showDetailedView
    ? StatisticsService.calculateAdvancedMetrics(sessions, period)
    : null;

  return {
    statistics,
    advancedMetrics,
    period,
  };
};
