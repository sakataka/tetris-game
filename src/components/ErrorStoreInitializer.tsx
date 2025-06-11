'use client';

import { useEffect } from 'react';
import { initializeErrorStoreIntegration } from '../store/errorStore';

export default function ErrorStoreInitializer() {
  useEffect(() => {
    // Initialize integration between error store and error handlers
    initializeErrorStoreIntegration();
  }, []);

  return null; // Does not render UI
}
