import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SPACING, TYPOGRAPHY } from '../constants/layout';
import CyberCard from './ui/CyberCard';

interface ControlsPanelProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const ControlsPanel = memo(function ControlsPanel({ size = 'md' }: ControlsPanelProps) {
  const { t } = useTranslation();

  return (
    <CyberCard title={t('controls.titleUpper')} theme='green' size={size}>
      <div className={`${SPACING.PANEL_INTERNAL} ${TYPOGRAPHY.BODY_TEXT}`}>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>
            {t('controls.moveLeft')} / {t('controls.moveRight')}
          </span>
          <span className='font-mono bg-cyan-400/20 px-2 py-1 rounded text-cyan-400'>
            {t('controls.leftRightArrows')}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>{t('controls.moveDown')}</span>
          <span className='font-mono bg-cyan-400/20 px-2 py-1 rounded text-cyan-400'>
            {t('controls.downArrow')}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>{t('controls.rotate')}</span>
          <span className='font-mono bg-cyan-400/20 px-2 py-1 rounded text-cyan-400'>
            {t('controls.upArrow')}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>{t('controls.hardDrop')}</span>
          <span className='font-mono bg-yellow-400/20 px-2 py-1 rounded text-yellow-400'>
            {t('controls.spaceKey')}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>{t('controls.pause')}</span>
          <span className='font-mono bg-purple-400/20 px-2 py-1 rounded text-purple-400'>
            {t('controls.pKey')}
          </span>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-gray-300'>{t('buttons.reset')}</span>
          <span className='font-mono bg-red-400/20 px-2 py-1 rounded text-red-400'>
            {t('controls.rKey')}
          </span>
        </div>
      </div>
    </CyberCard>
  );
});

export default ControlsPanel;
