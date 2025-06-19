/**
 * AboutPage Tests
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AboutPage from '../routes/about';

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'about.title': 'About',
        'about.gameTitle': 'Cyberpunk Tetris',
        'about.description': 'A modern Tetris game with cyberpunk aesthetics',
        'about.features': 'Features',
        'about.feature1': 'Smooth 60fps gameplay',
        'about.feature2': 'Beautiful particle effects',
        'about.feature3': 'Multiple themes and languages',
        'about.feature4': 'Statistics and high scores',
        'about.version': 'Version',
        'about.builtWith': 'Built with React and TypeScript',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('../components/layout/MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='main-layout'>{children}</div>
  ),
}));


describe('AboutPage', () => {
  it('should render main about information', () => {
    render(<AboutPage />);

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Cyberpunk Tetris')).toBeInTheDocument();
    expect(screen.getByText('A modern Tetris game with cyberpunk aesthetics')).toBeInTheDocument();
  });

  it('should render features list', () => {
    render(<AboutPage />);

    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('• Smooth 60fps gameplay')).toBeInTheDocument();
    expect(screen.getByText('• Beautiful particle effects')).toBeInTheDocument();
    expect(screen.getByText('• Multiple themes and languages')).toBeInTheDocument();
    expect(screen.getByText('• Statistics and high scores')).toBeInTheDocument();
  });

  it('should render version information', () => {
    render(<AboutPage />);

    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('Built with React and TypeScript')).toBeInTheDocument();
  });


  it('should be wrapped in MainLayout', () => {
    render(<AboutPage />);

    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });
});
