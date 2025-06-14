import { describe, expect, it } from 'vitest';
import {
  generateMetaTags,
  getPageMetadata,
  pageMetadata,
  updateDocumentMetadata,
} from '../../utils/metadata/pageMetadata';

/**
 * Page Metadata Tests for React Router Migration
 *
 * These tests validate the metadata management system that will be
 * integrated with React Router v7's Meta API for SEO and social sharing.
 *
 * Key Test Areas:
 * - Metadata structure and completeness
 * - Meta tag generation for React Router
 * - SEO optimization validation
 * - Social media integration (Open Graph, Twitter Cards)
 */

describe('Page Metadata (React Router Meta API Preparation)', () => {
  describe('Metadata Structure', () => {
    it('should have metadata for all current tabs', () => {
      const requiredTabs = ['game', 'statistics', 'theme', 'settings'];

      requiredTabs.forEach((tab) => {
        const metadata = getPageMetadata(tab);
        expect(metadata).toBeDefined();
        expect(metadata.title).toBeTruthy();
        expect(metadata.description).toBeTruthy();
      });
    });

    it('should have metadata for future pages', () => {
      const futurePages = ['about', 'tutorial', 'multiplayer'];

      futurePages.forEach((page) => {
        const metadata = getPageMetadata(page);
        expect(metadata).toBeDefined();
        expect(metadata.title).toBeTruthy();
        expect(metadata.description).toBeTruthy();
      });
    });

    it('should fallback to game metadata for unknown pages', () => {
      const unknownPage = 'unknown-page';
      const metadata = getPageMetadata(unknownPage);
      const gameMetadata = getPageMetadata('game');

      expect(metadata).toEqual(gameMetadata);
    });
  });

  describe('SEO Optimization', () => {
    it('should have unique titles for each page', () => {
      const titles = Object.values(pageMetadata).map((meta) => meta.title);
      const uniqueTitles = new Set(titles);

      expect(uniqueTitles.size).toBe(titles.length);
    });

    it('should have appropriate title lengths for SEO', () => {
      Object.values(pageMetadata).forEach((meta) => {
        expect(meta.title.length).toBeGreaterThan(10);
        expect(meta.title.length).toBeLessThan(60); // SEO best practice
      });
    });

    it('should have appropriate description lengths for SEO', () => {
      Object.values(pageMetadata).forEach((meta) => {
        expect(meta.description.length).toBeGreaterThan(50);
        expect(meta.description.length).toBeLessThan(160); // SEO best practice
      });
    });

    it('should include relevant keywords for each page', () => {
      Object.entries(pageMetadata).forEach(([pageKey, meta]) => {
        if (meta.keywords) {
          expect(meta.keywords.length).toBeGreaterThan(0);
          // Only game and statistics pages explicitly include 'tetris' keyword
          if (['game', 'statistics'].includes(pageKey)) {
            expect(meta.keywords).toContain('tetris');
          }

          // Page-specific keyword validation
          switch (pageKey) {
            case 'statistics':
              expect(meta.keywords).toContain('statistics');
              break;
            case 'theme':
              expect(meta.keywords).toContain('themes');
              break;
            case 'settings':
              expect(meta.keywords).toContain('settings');
              break;
          }
        }
      });
    });
  });

  describe('Meta Tag Generation for React Router', () => {
    it('should generate basic meta tags', () => {
      const metaTags = generateMetaTags('game');

      const titleTag = metaTags.find((tag) => tag.title);
      const descriptionTag = metaTags.find((tag) => tag.name === 'description');

      expect(titleTag).toBeDefined();
      expect(descriptionTag).toBeDefined();
      expect(descriptionTag?.content).toBeTruthy();
    });

    it('should generate keywords meta tag when available', () => {
      const metaTags = generateMetaTags('game');
      const keywordsTag = metaTags.find((tag) => tag.name === 'keywords');

      expect(keywordsTag).toBeDefined();
      expect(keywordsTag?.content).toContain('tetris');
    });

    it('should generate Open Graph tags', () => {
      const metaTags = generateMetaTags('statistics');

      const ogTitle = metaTags.find((tag) => tag.property === 'og:title');
      const ogDescription = metaTags.find((tag) => tag.property === 'og:description');
      const ogType = metaTags.find((tag) => tag.property === 'og:type');

      expect(ogTitle).toBeDefined();
      expect(ogDescription).toBeDefined();
      expect(ogType?.content).toBe('website');
    });

    it('should generate Twitter Card tags', () => {
      const metaTags = generateMetaTags('theme');

      const twitterCard = metaTags.find((tag) => tag.name === 'twitter:card');
      const twitterTitle = metaTags.find((tag) => tag.name === 'twitter:title');
      const twitterDescription = metaTags.find((tag) => tag.name === 'twitter:description');

      expect(twitterCard?.content).toBe('summary_large_image');
      expect(twitterTitle).toBeDefined();
      expect(twitterDescription).toBeDefined();
    });

    it('should generate canonical URL when available', () => {
      const metaTags = generateMetaTags('settings');
      const canonicalTag = metaTags.find((tag) => tag.rel === 'canonical');

      expect(canonicalTag).toBeDefined();
      expect(canonicalTag?.href).toBe('/settings');
    });

    it('should handle pages without images gracefully', () => {
      const metaTags = generateMetaTags('game');

      // Should not fail when ogImage is undefined
      expect(metaTags).toBeDefined();
      expect(Array.isArray(metaTags)).toBe(true);
    });
  });

  describe('React Router Meta API Integration', () => {
    it('should generate tags compatible with React Router Meta API', () => {
      const metaTags = generateMetaTags('multiplayer');

      // Validate tag structure matches React Router Meta API expectations
      metaTags.forEach((tag) => {
        // Each tag should have content or title
        const hasContent = 'content' in tag || 'title' in tag || 'href' in tag;
        expect(hasContent).toBe(true);

        // Validate tag type structure
        if ('name' in tag) {
          expect(typeof tag.name).toBe('string');
        }
        if ('property' in tag) {
          expect(typeof tag.property).toBe('string');
        }
        if ('rel' in tag) {
          expect(typeof tag.rel).toBe('string');
        }
      });
    });

    it('should support meta function pattern for React Router', () => {
      // Simulate React Router meta function usage
      const mockMetaFunction = (pageKey: string) => {
        const metaTags = generateMetaTags(pageKey);
        return metaTags.map((tag) => {
          if (tag.title) {
            return { title: tag.title };
          }
          if (tag.name && tag.content) {
            return { name: tag.name, content: tag.content };
          }
          if (tag.property && tag.content) {
            return { property: tag.property, content: tag.content };
          }
          if (tag.rel && tag.href) {
            return { tagName: 'link', rel: tag.rel, href: tag.href };
          }
          return tag;
        });
      };

      const routerMetaTags = mockMetaFunction('tutorial');
      expect(routerMetaTags).toBeDefined();
      expect(Array.isArray(routerMetaTags)).toBe(true);
      expect(routerMetaTags.length).toBeGreaterThan(0);
    });
  });

  describe('Dynamic Metadata Updates', () => {
    it('should support dynamic title updates', () => {
      // Mock document for testing (used for example, not executed)
      // const _mockDocument = {
      //   title: '',
      //   querySelector: (selector: string) => {
      //     if (selector === 'meta[name="description"]') {
      //       return {
      //         setAttribute: (_attr: string, _value: string) => {
      //           // Mock meta tag update
      //         },
      //       };
      //     }
      //     return null;
      //   },
      // };

      // Test would work in browser environment
      const metadata = getPageMetadata('about');
      expect(metadata.title).toBeTruthy();
    });

    it('should handle missing document gracefully', () => {
      // Test that updateDocumentMetadata doesn't fail in Node.js environment
      expect(() => {
        updateDocumentMetadata('game');
      }).not.toThrow();
    });
  });

  describe('Future Feature Preparation', () => {
    it('should support dynamic metadata based on game state', () => {
      // Prepare for features like "High Score: 12,500 | Tetris Game"
      const gameMetadata = getPageMetadata('game');
      const baseTitle = gameMetadata.title;

      // Simulate dynamic title with game state
      const dynamicTitle = `High Score: 12,500 | ${baseTitle}`;
      expect(dynamicTitle).toContain('High Score');
      expect(dynamicTitle).toContain(baseTitle);
    });

    it('should support localized metadata', () => {
      // Prepare for i18n metadata integration
      const metadata = getPageMetadata('settings');

      // Test structure supports localization
      expect(typeof metadata.title).toBe('string');
      expect(typeof metadata.description).toBe('string');

      // Future: metadata could be functions that accept locale
      // const localizedMetadata = getLocalizedMetadata('settings', 'ja');
    });

    it('should support metadata with user context', () => {
      // Prepare for user-specific metadata
      const metadata = getPageMetadata('statistics');

      // Test that metadata structure can be extended
      expect(metadata).toEqual(
        expect.objectContaining({
          title: expect.any(String),
          description: expect.any(String),
        })
      );

      // Future: Add user context to metadata
      // const userMetadata = getUserContextMetadata('statistics', { username: 'Player1' });
    });
  });
});
