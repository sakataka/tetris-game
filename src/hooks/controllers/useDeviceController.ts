/**
 * Device Controller Hook
 * 
 * Converts DeviceController render prop pattern to hook composition.
 * Manages device detection and platform-specific optimizations.
 */

import { useMobileDetection } from '../useMobileDetection';

export interface DeviceSystemAPI {
  isMobile: boolean;
}

/**
 * Hook that provides device system management functionality
 * Replaces DeviceController render prop pattern
 */
export function useDeviceController(): DeviceSystemAPI {
  // Mobile device detection
  const { isMobile } = useMobileDetection();

  // Return API object
  return {
    isMobile,
  };
}