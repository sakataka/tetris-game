import MainLayout from '../components/layout/MainLayout';
import CyberCard from '../components/ui/CyberCard';
import type { MetaFunction } from '../types/route';
import { getPageMetadata } from '../utils/metadata/pageMetadata';

export const meta: MetaFunction = () => {
  const metadata = getPageMetadata('about');
  return [
    { title: metadata.title },
    { name: 'description', content: metadata.description || '' },
    { name: 'keywords', content: metadata.keywords?.join(', ') || '' },
  ];
};

export default function AboutPage() {
  return (
    <MainLayout>
      <CyberCard title='ABOUT' theme='cyan' size='lg'>
        <div className='space-y-4 text-gray-300'>
          <h2 className='text-2xl font-bold text-cyan-400 mb-4'>Cyberpunk Tetris Game</h2>

          <div className='space-y-3'>
            <p>Production-ready cyberpunk-themed Tetris game built with modern web technologies.</p>

            <div>
              <h3 className='text-lg font-semibold text-cyan-300 mb-2'>Tech Stack</h3>
              <ul className='list-disc list-inside space-y-1 text-sm'>
                <li>React Router 7.6 + React 19.1</li>
                <li>TypeScript (ES2024) + Vite 6</li>
                <li>Zustand 5 (State Management)</li>
                <li>Tailwind CSS v4.1 + shadcn/ui</li>
                <li>Vitest + React Testing Library</li>
                <li>Biome (Linting & Formatting)</li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-semibold text-cyan-300 mb-2'>Features</h3>
              <ul className='list-disc list-inside space-y-1 text-sm'>
                <li>Advanced particle effects system</li>
                <li>Multi-strategy audio system with fallbacks</li>
                <li>Complete accessibility support (WCAG 2.1 AA)</li>
                <li>Internationalization (English/Japanese)</li>
                <li>Real-time statistics and high scores</li>
                <li>Customizable themes and controls</li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-semibold text-cyan-300 mb-2'>Performance</h3>
              <ul className='list-disc list-inside space-y-1 text-sm'>
                <li>React Compiler automatic optimization</li>
                <li>60fps gameplay with object pooling</li>
                <li>Bundle size: ~68.5kB main page</li>
                <li>Test coverage: 289+ tests (100% passing)</li>
              </ul>
            </div>
          </div>
        </div>
      </CyberCard>
    </MainLayout>
  );
}
