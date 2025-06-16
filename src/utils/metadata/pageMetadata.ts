import type { TabType } from '../../store/settingsStore';

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

/**
 * Page metadata configuration for all application pages
 *
 * This provides a centralized location for managing page metadata
 * that will be used when migrating to React Router's Meta API.
 */
export const pageMetadata: Record<TabType | string, PageMetadata> = {
  // Current tab-based pages (Phase 1)
  game: {
    title: 'Cyberpunk Tetris Game',
    description:
      'Production-ready cyberpunk-themed Tetris game with advanced features including particle effects, audio system, and accessibility support',
    keywords: ['tetris', 'game', 'cyberpunk', 'puzzle', 'react', 'javascript'],
    canonical: '/',
  },

  statistics: {
    title: 'Statistics | Cyberpunk Tetris',
    description:
      'View your Tetris game statistics, high scores, performance metrics, and detailed gameplay analytics',
    keywords: ['statistics', 'high score', 'tetris', 'metrics', 'analytics', 'leaderboard'],
    canonical: '/statistics',
  },

  theme: {
    title: 'Themes | Cyberpunk Tetris',
    description:
      'Customize your Tetris game appearance with cyberpunk themes, color palettes, and visual effects',
    keywords: ['themes', 'customization', 'cyberpunk', 'colors', 'appearance', 'ui'],
    canonical: '/themes',
  },

  settings: {
    title: 'Settings | Cyberpunk Tetris',
    description:
      'Configure your Tetris game settings including audio, controls, accessibility, and language preferences',
    keywords: ['settings', 'configuration', 'audio', 'controls', 'accessibility', 'language'],
    canonical: '/settings',
  },

  // Future pages (Phase 2+)
  about: {
    title: 'About | Cyberpunk Tetris',
    description:
      'Learn about the Cyberpunk Tetris game, its features, technology stack, and development story',
    keywords: ['about', 'tetris', 'game info', 'features', 'technology'],
    canonical: '/about',
  },

  tutorial: {
    title: 'Tutorial | Cyberpunk Tetris',
    description:
      'Learn how to play Tetris with interactive tutorials covering basic controls, advanced techniques, and strategies',
    keywords: ['tutorial', 'learn', 'how to play', 'tetris', 'guide', 'training'],
    canonical: '/tutorial',
  },

  multiplayer: {
    title: 'Multiplayer | Cyberpunk Tetris',
    description: 'Challenge other players in real-time multiplayer Tetris battles and tournaments',
    keywords: ['multiplayer', 'online', 'battle', 'tournament', 'competitive', 'tetris'],
    canonical: '/multiplayer',
  },
};

/**
 * Get metadata for a specific page
 */
export function getPageMetadata(pageKey: string): PageMetadata {
  const metadata = pageMetadata[pageKey];
  if (metadata) {
    return metadata;
  }
  const gameMetadata = pageMetadata['game'];
  if (!gameMetadata) {
    throw new Error('Game metadata is missing');
  }
  return gameMetadata;
}

/**
 * Generate meta tags for React Router Meta API
 * This function will be used when migrating to React Router v7
 */
export function generateMetaTags(pageKey: string): Array<{
  name?: string;
  property?: string;
  content?: string;
  title?: string;
  rel?: string;
  href?: string;
}> {
  const metadata = getPageMetadata(pageKey);

  const metaTags: Array<{
    name?: string;
    property?: string;
    content?: string;
    title?: string;
    rel?: string;
    href?: string;
  }> = [{ title: metadata.title }, { name: 'description', content: metadata.description }];

  // Keywords meta tag
  if (metadata.keywords && metadata.keywords.length > 0) {
    metaTags.push({
      name: 'keywords',
      content: metadata.keywords.join(', '),
    });
  }

  // Open Graph tags
  metaTags.push(
    { property: 'og:title', content: metadata.title },
    { property: 'og:description', content: metadata.description },
    { property: 'og:type', content: 'website' }
  );

  if (metadata.ogImage) {
    metaTags.push({ property: 'og:image', content: metadata.ogImage });
  }

  // Twitter Card tags
  metaTags.push(
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: metadata.title },
    { name: 'twitter:description', content: metadata.description }
  );

  if (metadata.ogImage) {
    metaTags.push({ name: 'twitter:image', content: metadata.ogImage });
  }

  // Canonical URL
  if (metadata.canonical) {
    metaTags.push({ rel: 'canonical', href: metadata.canonical });
  }

  return metaTags;
}

/**
 * Update document title and meta tags (for current React Router implementation)
 */
export function updateDocumentMetadata(pageKey: string): void {
  const metadata = getPageMetadata(pageKey);

  // Update document title
  if (typeof document !== 'undefined') {
    document.title = metadata.title;

    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', metadata.description);
    }
  }
}
