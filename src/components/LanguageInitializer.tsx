'use client';

import { useEffect } from 'react';
import { useLanguageActions } from '../store/languageStore';

/**
 * Component to initialize language settings on app startup
 * Ensures language store is synchronized with i18next
 */
export default function LanguageInitializer() {
  const { initializeLanguage } = useLanguageActions();

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  return null; // This component renders nothing
}
