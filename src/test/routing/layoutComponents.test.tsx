import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import BackgroundEffects from '../../components/layout/BackgroundEffects';
import GameHeader from '../../components/layout/GameHeader';
import MainLayout from '../../components/layout/MainLayout';

/**
 * Layout Components Tests for React Router Migration
 *
 * These tests validate the reusable layout components that will form
 * the foundation of the React Router application structure.
 *
 * Key Test Areas:
 * - Component rendering and props handling
 * - Layout composition and flexibility
 * - Accessibility and semantic HTML
 * - React Router integration readiness
 */

// Mock i18next for testing
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        'app.title': 'TETRIS',
        'tabs.game': 'Game',
        'tabs.statistics': 'Statistics',
        'tabs.themes': 'Themes',
        'tabs.settings': 'Settings',
        'tabs.about': 'About',
      };
      return translations[key] || fallback || key;
    },
  }),
}));

// Mock cn utility
vi.mock('../../utils/ui/cn', () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(' '),
}));

describe('Layout Components (React Router Preparation)', () => {
  describe('MainLayout Component', () => {
    it('should render content without router dependencies', () => {
      render(
        <MemoryRouter>
          <MainLayout showHeader={false} showNavigation={false}>
            <div>Test Content</div>
          </MainLayout>
        </MemoryRouter>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should support different background variants', () => {
      const variants: Array<'default' | 'minimal' | 'intense'> = ['default', 'minimal', 'intense'];

      variants.forEach((variant) => {
        const { container } = render(
          <MemoryRouter>
            <MainLayout backgroundVariant={variant} showHeader={false} showNavigation={false}>
              <div>Background test</div>
            </MainLayout>
          </MemoryRouter>
        );

        // Background component should be rendered
        expect(container.querySelector('.absolute.inset-0')).toBeInTheDocument();
      });
    });

    it('should apply custom className', () => {
      const { container } = render(
        <MemoryRouter>
          <MainLayout className='custom-layout' showHeader={false} showNavigation={false}>
            <div>Content</div>
          </MainLayout>
        </MemoryRouter>
      );

      expect(container.firstChild).toHaveClass('custom-layout');
    });
  });

  describe('GameHeader Component', () => {
    it('should render title by default', () => {
      render(<GameHeader />);

      expect(screen.getByText('TETRIS')).toBeInTheDocument();
    });

    it('should hide title when showTitle is false', () => {
      render(<GameHeader showTitle={false} />);

      expect(screen.queryByText('TETRIS')).not.toBeInTheDocument();
    });

    it('should support different variants', () => {
      const variants: Array<'default' | 'minimal' | 'compact'> = ['default', 'minimal', 'compact'];

      variants.forEach((variant) => {
        const { container } = render(<GameHeader variant={variant} />);
        const header = container.querySelector('header');
        expect(header).toBeInTheDocument();
      });
    });

    it('should apply custom className', () => {
      const { container } = render(<GameHeader className='custom-header' />);

      const header = container.querySelector('header');
      expect(header).toHaveClass('custom-header');
    });

    it('should have proper heading structure', () => {
      render(<GameHeader />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('TETRIS');
    });
  });

  describe('BackgroundEffects Component', () => {
    it('should render with default variant', () => {
      const { container } = render(<BackgroundEffects />);

      const background = container.querySelector('.absolute.inset-0');
      expect(background).toBeInTheDocument();
    });

    it('should support different variants', () => {
      const variants: Array<'default' | 'minimal' | 'intense'> = ['default', 'minimal', 'intense'];

      variants.forEach((variant) => {
        const { container } = render(<BackgroundEffects variant={variant} />);
        const background = container.querySelector('.absolute.inset-0');
        expect(background).toBeInTheDocument();
      });
    });

    it('should apply custom className', () => {
      const { container } = render(<BackgroundEffects className='custom-bg' />);

      const background = container.querySelector('.absolute.inset-0');
      expect(background).toHaveClass('custom-bg');
    });

    it('should be non-interactive', () => {
      const { container } = render(<BackgroundEffects />);

      const background = container.querySelector('.pointer-events-none');
      expect(background).toBeInTheDocument();
    });

    it('should render different orb configurations based on variant', () => {
      const { container: defaultContainer } = render(<BackgroundEffects variant='default' />);
      const { container: minimalContainer } = render(<BackgroundEffects variant='minimal' />);
      const { container: intenseContainer } = render(<BackgroundEffects variant='intense' />);

      // Each variant should render different numbers of orbs
      expect(
        defaultContainer.querySelectorAll('[class*="bg-"][class*="rounded-full"]')
      ).toHaveLength(3);
      expect(
        minimalContainer.querySelectorAll('[class*="bg-"][class*="rounded-full"]')
      ).toHaveLength(2);
      expect(
        intenseContainer.querySelectorAll('[class*="bg-"][class*="rounded-full"]')
      ).toHaveLength(5);
    });
  });
});
