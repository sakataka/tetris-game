# Tetris Game

Production-ready cyberpunk-themed Tetris game built with Next.js 15, TypeScript, and comprehensive configuration management.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (required package manager)

### Installation

1. Clone the repository
2. Copy environment file: `cp .env.example .env.local`
3. Install dependencies: `pnpm install`
4. Start development server: `pnpm dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuration System

The game features a comprehensive configuration management system with environment-based overrides and runtime configuration.

### Environment Variables

Copy `.env.example` to `.env.local` and customize settings:

```bash
# Feature Flags
NEXT_PUBLIC_AUDIO_ENABLED=true
NEXT_PUBLIC_PARTICLES_ENABLED=true
NEXT_PUBLIC_DEBUG_PERFORMANCE=false

# Performance Settings
NEXT_PUBLIC_MAX_PARTICLES=200
NEXT_PUBLIC_TARGET_FPS=60

# Game Settings
NEXT_PUBLIC_DEFAULT_LEVEL=1
NEXT_PUBLIC_GHOST_PIECE_ENABLED=true
```

### Using Configuration in Components

```typescript
import { useFeatureFlags, usePerformanceConfig } from '@/config';

function MyComponent() {
  const { particlesEnabled, audioEnabled } = useFeatureFlags();
  const { maxParticles, targetFps } = usePerformanceConfig();

  // Use configuration values...
}
```

### Configuration Store

Runtime configuration updates with persistence:

```typescript
import { useConfigActions } from '@/config';

function SettingsPanel() {
  const { updateConfig, toggleFeature } = useConfigActions();

  const handleToggleParticles = () => {
    toggleFeature('particlesEnabled');
  };

  const handleUpdatePerformance = () => {
    updateConfig({
      performance: { maxParticles: 150 },
    });
  };
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
