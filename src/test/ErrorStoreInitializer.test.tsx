/**
 * ErrorStoreInitializer component test
 *
 * Tests for simplified error store initialization component
 */

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ErrorStoreInitializer from '../components/ErrorStoreInitializer';

describe('ErrorStoreInitializer', () => {
  it('should render nothing', () => {
    const { container } = render(<ErrorStoreInitializer />);

    expect(container.firstChild).toBeNull();
  });

  it('should be a functional component without side effects', () => {
    // Since the error store integration is now handled automatically,
    // this component should be a simple null-rendering component
    const { container } = render(<ErrorStoreInitializer />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should handle mount and unmount without issues', () => {
    expect(() => {
      const { unmount } = render(<ErrorStoreInitializer />);
      unmount();
    }).not.toThrow();
  });

  it('should be stable across multiple renders', () => {
    const { rerender } = render(<ErrorStoreInitializer />);
    
    // Should handle multiple re-renders without issues
    expect(() => {
      rerender(<ErrorStoreInitializer />);
      rerender(<ErrorStoreInitializer />);
      rerender(<ErrorStoreInitializer />);
    }).not.toThrow();
  });
});
