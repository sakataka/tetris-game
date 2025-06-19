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
        'about.configComparison': 'Configuration Comparison',
        'about.currentConfig': 'Current Configuration',
        'about.defaultConfig': 'Default Configuration',
        'about.envComparison': 'Environment Comparison',
        'about.devVsProduction': 'Development vs Production',
        'about.technicalDetails': 'Technical Details',
        'about.architecture': 'Architecture',
        'about.performance': 'Performance',
        'comparison.identical': 'Identical',
        'comparison.differencesFound': '{{count}} differences found',
      };
      return translations[key] || key;
    },
  }),
}));

vi.mock('../components/layout/MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));

vi.mock('../store/settingsStore', () => ({
  useSettingsStore: () => ({
    audioEnabled: true,
    volume: 0.7,
    showGhost: true,
    showParticles: false,
    theme: 'cyberpunk',
    keyBindings: {
      moveLeft: ['ArrowLeft', 'a'],
      moveRight: ['ArrowRight', 'd'],
      rotate: ['ArrowUp', 'w'],
      hardDrop: [' '],
    },
  }),
}));

vi.mock('../config', () => ({
  createGameConfig: (env: string) => ({
    environment: env,
    performance: {
      maxParticles: env === 'development' ? 200 : 100,
      targetFps: 60,
      debugPerformance: env === 'development',
    },
    features: {
      audioEnabled: env === 'development',
      particlesEnabled: env === 'development',
      touchControlsEnabled: true,
    },
    ui: {
      defaultVolume: 0.5,
      showFPS: env === 'development',
      showDebugInfo: env === 'development',
      effectIntensity: 1.0,
    },
    gameplay: {
      defaultLevel: 1,
      previewPieces: 3,
    },
  }),
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

  it('should render configuration comparison', () => {
    render(<AboutPage />);

    expect(screen.getByText('Configuration Comparison')).toBeInTheDocument();
    // Check for differences badge - expect multiple comparison cards
    const differences = screen.getAllByText(/differences/);
    expect(differences.length).toBeGreaterThan(0);
  });

  it('should render environment comparison', () => {
    render(<AboutPage />);

    expect(screen.getByText('Environment Comparison')).toBeInTheDocument();
  });

  it('should render technical details', () => {
    render(<AboutPage />);

    expect(screen.getByText('Technical Details')).toBeInTheDocument();
    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('• React 19.1 + React Router 7')).toBeInTheDocument();
    expect(screen.getByText('• TypeScript ES2024')).toBeInTheDocument();
    expect(screen.getByText('• React Compiler Optimization')).toBeInTheDocument();
    expect(screen.getByText('• Bundle: 322KB (95KB gzipped)')).toBeInTheDocument();
  });

  it('should be wrapped in MainLayout', () => {
    render(<AboutPage />);

    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
  });
});