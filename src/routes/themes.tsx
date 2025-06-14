import ThemeTabContent from '../components/ThemeTabContent';
import MainLayout from '../components/layout/MainLayout';
import type { MetaFunction } from '../types/route';
import { getPageMetadata } from '../utils/metadata/pageMetadata';

export const meta: MetaFunction = () => {
  const metadata = getPageMetadata('theme');
  return [
    { title: metadata.title },
    { name: 'description', content: metadata.description || '' },
    { name: 'keywords', content: metadata.keywords?.join(', ') || '' },
  ];
};

export default function ThemesPage() {
  return (
    <MainLayout>
      <ThemeTabContent />
    </MainLayout>
  );
}
