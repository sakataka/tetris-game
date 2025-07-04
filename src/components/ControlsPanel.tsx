import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SPACING, TYPOGRAPHY } from '@/constants/layout';
import CyberCard from './ui/CyberCard';

interface ControlsPanelProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const ControlsPanel = memo(function ControlsPanel({ size = 'md' }: ControlsPanelProps) {
  const { t } = useTranslation();

  return (
    <CyberCard title={t('controls.titleUpper')} theme='primary' size={size}>
      <div className={`${SPACING.PANEL_INTERNAL} ${TYPOGRAPHY.BODY_TEXT}`}>
        <div className='flex justify-between items-center'>
          <span className='text-theme-foreground'>
            {t('controls.moveLeft')} / {t('controls.moveRight')}
          </span>
          <span className='font-mono bg-theme-primary/20 px-2 py-1 rounded text-theme-primary'>
            {t('controls.leftRightArrows')}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-theme-foreground'>{t('controls.moveDown')}</span>
          <span className='font-mono bg-theme-primary/20 px-2 py-1 rounded text-theme-primary'>
            {t('controls.downArrow')}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-theme-foreground'>{t('controls.rotate')}</span>
          <span className='font-mono bg-theme-primary/20 px-2 py-1 rounded text-theme-primary'>
            {t('controls.upArrow')}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-theme-foreground'>{t('controls.hardDrop')}</span>
          <span className='font-mono bg-theme-warning/20 px-2 py-1 rounded text-theme-warning'>
            {t('controls.spaceKey')}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-theme-foreground'>{t('controls.pause')}</span>
          <span className='font-mono bg-theme-secondary/20 px-2 py-1 rounded text-theme-secondary'>
            {t('controls.pKey')}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-theme-foreground'>{t('buttons.reset')}</span>
          <span className='font-mono bg-theme-error/20 px-2 py-1 rounded text-theme-error'>
            {t('controls.rKey')}
          </span>
        </div>
      </div>
    </CyberCard>
  );
});

export default ControlsPanel;
