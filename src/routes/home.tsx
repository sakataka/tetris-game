import TetrisGame from '../components/TetrisGame';
import type { MetaFunction } from '../types/route';
import { getPageMetadata } from '../utils/metadata/pageMetadata';

export const meta: MetaFunction = () => {
  const metadata = getPageMetadata('game');
  return [
    { title: metadata.title },
    { name: 'description', content: metadata.description || '' },
    { name: 'keywords', content: metadata.keywords?.join(', ') || '' },
  ];
};

export default function HomePage() {
  return <TetrisGame />;
}
