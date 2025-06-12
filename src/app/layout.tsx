import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ErrorBoundaryWithTranslation from '../components/ErrorBoundaryWithTranslation';
import ErrorNotification from '../components/ErrorNotification';
import ErrorStoreInitializer from '../components/ErrorStoreInitializer';
import I18nProvider from '../components/I18nProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Cyberpunk Tetris Game',
  description: 'Production-ready cyberpunk-themed Tetris game with advanced features',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <I18nProvider>
          <ErrorBoundaryWithTranslation level='page'>
            <ErrorStoreInitializer />
            {children}
            <ErrorNotification position='top-right' maxNotifications={3} />
          </ErrorBoundaryWithTranslation>
        </I18nProvider>
      </body>
    </html>
  );
}
