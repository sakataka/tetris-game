import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';
import ConfigComparisonCard from '@/components/shared/ConfigComparisonCard';
import CyberCard from '@/components/ui/CyberCard';
import { createGameConfig } from '@/config';
import { useSettingsStore } from '@/store/settingsStore';

export default function AboutPage() {
  const { t } = useTranslation();
  const settings = useSettingsStore();

  // Generate configuration comparisons
  const currentConfig = useMemo(() => createGameConfig('development'), []);
  const defaultConfig = useMemo(() => createGameConfig('production'), []);

  // Create a simplified config object from current settings for comparison
  const settingsConfig = useMemo(
    () => ({
      audio: {
        enabled: settings.audioEnabled,
        volume: settings.volume,
      },
      visual: {
        showGhost: settings.showGhost,
        showParticles: settings.showParticles,
        theme: settings.theme,
      },
      controls: {
        moveLeft: settings.keyBindings.moveLeft,
        moveRight: settings.keyBindings.moveRight,
        rotate: settings.keyBindings.rotate,
        hardDrop: settings.keyBindings.hardDrop,
      },
    }),
    [settings]
  );

  const defaultSettingsConfig = useMemo(
    () => ({
      audio: {
        enabled: false,
        volume: 0.5,
      },
      visual: {
        showGhost: true,
        showParticles: true,
        theme: 'cyberpunk',
      },
      controls: {
        moveLeft: ['ArrowLeft', 'a'],
        moveRight: ['ArrowRight', 'd'],
        rotate: ['ArrowUp', 'w'],
        hardDrop: [' '],
      },
    }),
    []
  );

  return (
    <MainLayout>
      <div className='space-y-6 max-w-4xl'>
        {/* Main About Card */}
        <CyberCard title={t('about.title')} theme='primary' size='lg'>
          <div className='space-y-6 text-center'>
            <div>
              <h2 className='text-3xl font-bold text-theme-primary mb-2'>{t('about.gameTitle')}</h2>
              <p className='text-theme-foreground text-lg'>{t('about.description')}</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-theme-primary/10 p-4 rounded border border-theme-primary/30'>
                <h3 className='text-lg font-semibold text-theme-primary mb-3'>
                  {t('about.features')}
                </h3>
                <ul className='space-y-2 text-sm text-theme-foreground'>
                  <li>• {t('about.feature1')}</li>
                  <li>• {t('about.feature2')}</li>
                  <li>• {t('about.feature3')}</li>
                  <li>• {t('about.feature4')}</li>
                </ul>
              </div>

              <div className='bg-theme-primary/10 p-4 rounded border border-theme-primary/30'>
                <h3 className='text-lg font-semibold text-theme-primary mb-3'>
                  {t('about.version')}
                </h3>
                <div className='space-y-2 text-sm text-theme-foreground'>
                  <p>v1.0.0</p>
                  <p>{t('about.builtWith')}</p>
                </div>
              </div>
            </div>
          </div>
        </CyberCard>

        {/* Configuration Comparison */}
        <ConfigComparisonCard
          title={t('about.configComparison')}
          object1={settingsConfig}
          object2={defaultSettingsConfig}
          labels={{
            object1: t('about.currentConfig'),
            object2: t('about.defaultConfig'),
          }}
          theme='default'
          size='md'
          showCategories={true}
          maxDifferences={8}
        />

        {/* Environment Configuration Comparison */}
        <ConfigComparisonCard
          title={t('about.envComparison')}
          object1={currentConfig as unknown as Record<string, unknown>}
          object2={defaultConfig as unknown as Record<string, unknown>}
          labels={{
            object1: 'Development',
            object2: 'Production',
          }}
          theme='muted'
          size='md'
          showCategories={true}
          maxDifferences={5}
        />

        {/* Technical Details */}
        <CyberCard title={t('about.technicalDetails')} theme='default' size='md'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
            <div className='space-y-3'>
              <div>
                <h4 className='font-semibold text-theme-foreground mb-2'>
                  {t('about.architecture')}
                </h4>
                <ul className='space-y-1 text-theme-foreground/80'>
                  <li>• React 19.1 + React Router 7</li>
                  <li>• TypeScript ES2024</li>
                  <li>• Zustand State Management</li>
                  <li>• Vite 6.3 Build System</li>
                </ul>
              </div>
            </div>

            <div className='space-y-3'>
              <div>
                <h4 className='font-semibold text-theme-foreground mb-2'>
                  {t('about.performance')}
                </h4>
                <ul className='space-y-1 text-theme-foreground/80'>
                  <li>• React Compiler Optimization</li>
                  <li>• Bundle: 322KB (95KB gzipped)</li>
                  <li>• 60 Components, 15 Stores</li>
                  <li>• 349 Tests (Vitest)</li>
                </ul>
              </div>
            </div>
          </div>
        </CyberCard>
      </div>
    </MainLayout>
  );
}
