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
    <CyberCard title={t('scoring.titleUpper', 'SCORING')} theme='primary' size={size}>
      <div className={`${SPACING.PANEL_INTERNAL} ${TYPOGRAPHY.BODY_TEXT}`}>
        <div className='flex justify-between items-center text-theme-foreground'>
          <span>{t('scoring.singleUpper')}</span>
          <span className='font-mono text-theme-primary'>100 × {t('scoring.level')}</span>
        </div>
        <div className='flex justify-between items-center text-theme-foreground'>
          <span>{t('scoring.doubleUpper')}</span>
          <span className='font-mono text-theme-primary'>200 × {t('scoring.level')}</span>
        </div>
        <div className='flex justify-between items-center text-theme-foreground'>
          <span>{t('scoring.tripleUpper')}</span>
          <span className='font-mono text-theme-primary'>300 × {t('scoring.level')}</span>
        </div>
        <div className='flex justify-between items-center text-theme-foreground'>
          <span>{t('scoring.tetrisUpper')}</span>
          <span className='font-mono text-theme-primary'>700 × {t('scoring.level')}</span>
        </div>
        <div className='flex justify-between items-center text-theme-foreground border-t border-theme-muted pt-2'>
          <span>{t('scoring.hardDropUpper')}</span>
          <span className='font-mono text-theme-primary'>{t('scoring.distance')} × 2</span>
        </div>
      </div>
    </CyberCard>
  );
});

export default ScoringPanel;
