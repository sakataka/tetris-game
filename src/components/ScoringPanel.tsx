import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SPACING, TYPOGRAPHY } from '../constants/layout';
import CyberCard from './ui/CyberCard';

interface ScoringPanelProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const ScoringPanel = memo(function ScoringPanel({ size = 'md' }: ScoringPanelProps) {
  const { t } = useTranslation();

  return (
    <CyberCard title={t('scoring.title', 'SCORING').toUpperCase()} theme='yellow' size={size}>
      <div className={`${SPACING.PANEL_INTERNAL} ${TYPOGRAPHY.BODY_TEXT}`}>
        <div className='flex justify-between items-center text-gray-300'>
          <span>{t('scoring.single').toUpperCase()}</span>
          <span className='font-mono text-blue-400'>100 × {t('scoring.level')}</span>
        </div>
        <div className='flex justify-between items-center text-gray-300'>
          <span>{t('scoring.double').toUpperCase()}</span>
          <span className='font-mono text-green-400'>200 × {t('scoring.level')}</span>
        </div>
        <div className='flex justify-between items-center text-gray-300'>
          <span>{t('scoring.triple').toUpperCase()}</span>
          <span className='font-mono text-yellow-400'>300 × {t('scoring.level')}</span>
        </div>
        <div className='flex justify-between items-center text-gray-300'>
          <span>{t('scoring.tetris').toUpperCase()}</span>
          <span className='font-mono text-red-400 font-bold'>700 × {t('scoring.level')}</span>
        </div>
        <div className='flex justify-between items-center text-gray-300 border-t border-gray-600 pt-2'>
          <span>{t('scoring.hardDrop').toUpperCase()}</span>
          <span className='font-mono text-purple-400'>{t('scoring.distance')} × 2</span>
        </div>
      </div>
    </CyberCard>
  );
});

export default ScoringPanel;
