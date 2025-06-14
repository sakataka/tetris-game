import TetrisGame from '../components/TetrisGame';
import type { MetaFunction } from '../types/route';
import { getPageMetadata } from '../utils/metadata/pageMetadata';

export const meta: MetaFunction = () => {
  const metadata = getPageMetadata('game');

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Cyberpunk Tetris',
    description:
      'A modern Tetris game with cyberpunk aesthetics, particle effects, and customizable themes',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1024',
    },
    author: {
      '@type': 'Organization',
      name: 'Cyberpunk Tetris Team',
    },
  };

  return [
    { title: metadata.title },
    { name: 'description', content: metadata.description || '' },
    { name: 'keywords', content: metadata.keywords?.join(', ') || '' },
    // Open Graph
    { property: 'og:title', content: 'Cyberpunk Tetris - Play Online' },
    { property: 'og:description', content: metadata.description || '' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://tetris.example.com/' },
    { property: 'og:image', content: 'https://tetris.example.com/og-image.png' },
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Cyberpunk Tetris' },
    { name: 'twitter:description', content: metadata.description || '' },
    { name: 'twitter:image', content: 'https://tetris.example.com/twitter-image.png' },
    // Additional SEO
    { name: 'robots', content: 'index, follow' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
    { 'script:ld+json': JSON.stringify(structuredData) },
  ];
};

export default function HomePage() {
  return <TetrisGame />;
}
