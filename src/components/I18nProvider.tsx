import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

/**
 * I18nProvider wraps the application with i18next context
 * This enables all child components to use useTranslation hook
 */
export default function I18nProvider({ children }: I18nProviderProps) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
