import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LanguageSelector from '../components/LanguageSelector';

// Simple mocks to avoid complex dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../store/i18nStore', () => ({
  useCurrentLanguage: () => 'en',
  useSetLanguage: () => vi.fn(),
}));

vi.mock('../i18n', () => ({
  supportedLanguages: ['en', 'ja'],
  languageNames: {
    en: 'English',
    ja: '日本語',
  },
}));

vi.mock('../utils/ui/cn', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('../components/ui/select', () => ({
  Select: ({ children }: any) => <div data-testid='select'>{children}</div>,
  SelectTrigger: ({ children }: any) => <div data-testid='select-trigger'>{children}</div>,
  SelectValue: () => <span>Current Value</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}));

describe('LanguageSelector - Basic Tests', () => {
  it('should render without crashing', () => {
    expect(() => {
      render(<LanguageSelector />);
    }).not.toThrow();
  });

  it('should render select component', () => {
    const { getByTestId } = render(<LanguageSelector />);

    expect(getByTestId('select')).toBeInTheDocument();
    expect(getByTestId('select-trigger')).toBeInTheDocument();
  });

  it('should render with showLabel false', () => {
    expect(() => {
      render(<LanguageSelector showLabel={false} />);
    }).not.toThrow();
  });

  it('should render with custom className', () => {
    expect(() => {
      render(<LanguageSelector className='custom-class' />);
    }).not.toThrow();
  });
});
