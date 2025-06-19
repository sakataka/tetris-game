import { useMobileDetection } from '@/hooks/useMobileDetection';

export interface DeviceSystemAPI {
  isMobile: boolean;
}

interface DeviceControllerProps {
  children: (api: DeviceSystemAPI) => React.ReactNode;
}

/**
 * DeviceController manages device detection and platform-specific optimizations.
 * Responsibilities:
 * - Mobile device detection
 * - Platform-specific feature detection
 * - Responsive behavior coordination
 */
export function DeviceController({ children }: DeviceControllerProps) {
  // Mobile device detection
  const { isMobile } = useMobileDetection();

  // Construct API object
  const deviceSystemAPI: DeviceSystemAPI = {
    isMobile,
  };

  return children(deviceSystemAPI);
}
