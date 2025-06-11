import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants/layout';

interface MobileDetectionResult {
  isMobile: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
}

export function useMobileDetection(): MobileDetectionResult {
  const [detection, setDetection] = useState<MobileDetectionResult>({
    isMobile: false,
    isTouchDevice: false,
    screenWidth: 0,
    screenHeight: 0,
  });

  useEffect(() => {
    const updateDetection = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isMobile = screenWidth <= BREAKPOINTS.MOBILE_WIDTH || isTouchDevice;

      setDetection({
        isMobile,
        isTouchDevice,
        screenWidth,
        screenHeight,
      });
    };

    // Initial setup
    updateDetection();

    // Resize event listener
    window.addEventListener('resize', updateDetection);
    window.addEventListener('orientationchange', updateDetection);

    return () => {
      window.removeEventListener('resize', updateDetection);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, []);

  return detection;
}
