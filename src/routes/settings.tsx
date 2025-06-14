import SettingsTabContent from '../components/SettingsTabContent';
import MainLayout from '../components/layout/MainLayout';
import type { MetaFunction } from '../types/route';
import { getPageMetadata } from '../utils/metadata/pageMetadata';

export const meta: MetaFunction = () => {
  const metadata = getPageMetadata('settings');
  return [
    { title: metadata.title },
    { name: 'description', content: metadata.description || '' },
    { name: 'keywords', content: metadata.keywords?.join(', ') || '' },
  ];
};

export default function SettingsPage() {
  return (
    <MainLayout>
      <SettingsTabContent />
    </MainLayout>
  );
}
