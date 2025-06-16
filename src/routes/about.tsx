import { useTranslation } from 'react-i18next';
import MainLayout from '../components/layout/MainLayout';
import CyberCard from '../components/ui/CyberCard';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className='space-y-6 max-w-4xl'>
        <CyberCard title={t('about.title')} theme='primary' size='lg'>
          <div className='space-y-6 text-center'>
            <div>
              <h2 className='text-3xl font-bold text-theme-primary mb-2'>{t('about.gameTitle')}</h2>
              <p className='text-gray-300 text-lg'>{t('about.description')}</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-cyber-cyan-10 p-4 rounded border border-cyber-cyan-30'>
                <h3 className='text-lg font-semibold text-theme-primary mb-3'>{t('about.features')}</h3>
                <ul className='space-y-2 text-sm text-gray-300'>
                  <li>• {t('about.feature1')}</li>
                  <li>• {t('about.feature2')}</li>
                  <li>• {t('about.feature3')}</li>
                  <li>• {t('about.feature4')}</li>
                </ul>
              </div>

              <div className='bg-cyber-cyan-10 p-4 rounded border border-cyber-cyan-30'>
                <h3 className='text-lg font-semibold text-theme-primary mb-3'>{t('about.version')}</h3>
                <div className='space-y-2 text-sm text-gray-300'>
                  <p>v1.0.0</p>
                  <p>{t('about.builtWith')}</p>
                </div>
              </div>
            </div>
          </div>
        </CyberCard>
      </div>
    </MainLayout>
  );
}
