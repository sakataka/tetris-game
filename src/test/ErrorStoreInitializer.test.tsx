/**
 * ErrorStoreInitializer component test
 *
 * Tests for error store initialization component functionality
 */

import { render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the integration function before importing
vi.mock('../store/errorStore', () => ({
  initializeErrorStoreIntegration: vi.fn(),
}));

// Import the component and mocked function
import ErrorStoreInitializer from '../components/ErrorStoreInitializer';
import { initializeErrorStoreIntegration } from '../store/errorStore';

const mockInitializeErrorStoreIntegration = initializeErrorStoreIntegration as ReturnType<
  typeof vi.fn
>;

describe('ErrorStoreInitializer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call initializeErrorStoreIntegration on mount', () => {
    render(<ErrorStoreInitializer />);

    expect(mockInitializeErrorStoreIntegration).toHaveBeenCalledTimes(1);
  });

  it('should render nothing', () => {
    const { container } = render(<ErrorStoreInitializer />);

    expect(container.firstChild).toBeNull();
  });

  it('should not reinitialize on unmount', () => {
    const { unmount } = render(<ErrorStoreInitializer />);

    expect(mockInitializeErrorStoreIntegration).toHaveBeenCalledTimes(1);

    unmount();

    // No additional calls after unmount
    expect(mockInitializeErrorStoreIntegration).toHaveBeenCalledTimes(1);
  });

  it('should initialize only once on re-render', () => {
    const { rerender } = render(<ErrorStoreInitializer />);

    expect(mockInitializeErrorStoreIntegration).toHaveBeenCalledTimes(1);

    // Re-render
    rerender(<ErrorStoreInitializer />);

    // Still called only once
    expect(mockInitializeErrorStoreIntegration).toHaveBeenCalledTimes(1);
  });
});
