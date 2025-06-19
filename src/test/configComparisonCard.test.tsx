/**
 * ConfigComparisonCard Tests
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ConfigComparisonCard } from '../components/shared/ConfigComparisonCard';

// Mock i18next
const mockT = (key: string, options?: { count?: number }) => {
  switch (key) {
    case 'comparison.notReady':
      return 'Comparison not available';
    case 'comparison.identical':
      return 'Identical';
    case 'comparison.differencesFound':
      return `${options?.count || 0} difference found`;
    default:
      return key;
  }
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

describe('ConfigComparisonCard', () => {
  const sampleConfig1 = {
    performance: {
      maxParticles: 200,
      targetFps: 60,
    },
    features: {
      audioEnabled: true,
      particlesEnabled: true,
    },
  };

  const sampleConfig2 = {
    performance: {
      maxParticles: 100,
      targetFps: 60,
    },
    features: {
      audioEnabled: false,
      particlesEnabled: true,
    },
  };

  const identicalConfig = {
    performance: {
      maxParticles: 100,
      targetFps: 60,
    },
    features: {
      audioEnabled: false,
      particlesEnabled: true,
    },
  };

  it('should render basic comparison', () => {
    render(
      <ConfigComparisonCard
        title="Test Comparison"
        object1={sampleConfig1}
        object2={sampleConfig2}
      />
    );

    expect(screen.getByText('Test Comparison')).toBeInTheDocument();
    expect(screen.getByText('2 difference found')).toBeInTheDocument();
  });

  it('should show identical status', () => {
    render(
      <ConfigComparisonCard
        title="Identical Test"
        object1={identicalConfig}
        object2={sampleConfig2}
      />
    );

    expect(screen.getByText('Identical')).toBeInTheDocument();
  });

  it('should hide when identical and showWhenIdentical is false', () => {
    const { container } = render(
      <ConfigComparisonCard
        title="Hidden Test"
        object1={identicalConfig}
        object2={sampleConfig2}
        showWhenIdentical={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should handle null objects', () => {
    render(
      <ConfigComparisonCard
        title="Null Test"
        object1={null}
        object2={null}
      />
    );

    expect(screen.getByText('Comparison not available')).toBeInTheDocument();
  });

  it('should limit differences when maxDifferences is set', () => {
    render(
      <ConfigComparisonCard
        title="Limited Test"
        object1={sampleConfig1}
        object2={sampleConfig2}
        maxDifferences={1}
      />
    );

    expect(screen.getByText('... and 1 more differences')).toBeInTheDocument();
  });

  it('should show categories when enabled', () => {
    render(
      <ConfigComparisonCard
        title="Categorized Test"
        object1={sampleConfig1}
        object2={sampleConfig2}
        showCategories={true}
      />
    );

    expect(screen.getByText('performance')).toBeInTheDocument();
    expect(screen.getByText('features')).toBeInTheDocument();
  });

  it('should use custom labels', () => {
    render(
      <ConfigComparisonCard
        title="Custom Labels Test"
        object1={identicalConfig}
        object2={sampleConfig2}
        labels={{
          object1: 'Current Config',
          object2: 'Default Config',
        }}
      />
    );

    expect(screen.getByText(/Current Config and Default Config are identical/)).toBeInTheDocument();
  });
});