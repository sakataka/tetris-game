# Tetris Game

Production-ready cyberpunk-themed Tetris game built with React Router 7, React 19, TypeScript, and comprehensive configuration management.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (required package manager)

### Installation

1. Clone the repository
2. Copy environment file: `cp .env.example .env.local`
3. Install dependencies: `pnpm install`
4. Start development server: `pnpm dev`

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Configuration System

The game features a comprehensive configuration management system with environment-based overrides and runtime configuration.

### Environment Variables

Copy `.env.example` to `.env.local` and customize settings:

```bash
# Feature Flags
VITE_AUDIO_ENABLED=true
VITE_PARTICLES_ENABLED=true
VITE_DEBUG_PERFORMANCE=false

# Performance Settings
VITE_MAX_PARTICLES=200
VITE_TARGET_FPS=60

# Game Settings
VITE_DEFAULT_LEVEL=1
VITE_GHOST_PIECE_ENABLED=true
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

To learn more about the technologies used in this project:

- [React Router Documentation](https://reactrouter.com/) - learn about React Router features and API.
- [React 19 Documentation](https://react.dev/) - learn about the latest React features.
- [Vite Documentation](https://vitejs.dev/) - learn about the build tool and development server.

## Deploy on Vercel

The easiest way to deploy your React Router app is to use the [Vercel Platform](https://vercel.com/new). The project is configured for static site generation (SPA mode) and includes proper routing configuration.

Check out the [Vercel deployment documentation](https://vercel.com/docs) for more details.
