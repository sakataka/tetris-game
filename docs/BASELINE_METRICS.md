# Codebase Baseline Metrics

**Measurement Date:** 2025-06-15  
**Purpose:** リファクタリング前の正確な数値記録

## 📊 File Structure Overview

```
src/
├── components/        64 files (React components)
├── store/            15 files (Zustand stores)
├── hooks/            22 files (Custom hooks)
├── utils/            41 files (Utility functions)
├── types/            12 files (TypeScript definitions)
├── routes/            5 files (React Router routes)
├── test/             24 files (Test files)
└── other/            31 files (Config, i18n, etc.)
```

**Total:** 214 TypeScript files in src/

## 📈 Lines of Code Distribution

| Category | Files | Lines | % of Total |
|----------|-------|-------|------------|
| **Total Source Code** | 214 | 32,236 | 100% |
| Utilities | 41 | ~8,500 | 26.4% |
| Components | 64 | ~5,700 | 17.7% |
| Stores | 15 | ~3,000 | 9.3% |
| Hooks | 22 | ~2,800 | 8.7% |
| Types | 12 | ~2,300 | 7.1% |
| Tests | 24 | ~1,100 | 3.4% |
| Routes | 5 | ~90 | 0.3% |
| Other | 31 | ~8,700 | 27.0% |

## 🎯 Large Files (>300 lines)

| Rank | File | Lines | Category |
|------|------|-------|----------|
| 1 | `utils/audio/audioFallback.ts` | 486 | Audio System |
| 2 | `store/sessionStore.ts` | 456 | State Management |
| 3 | `utils/data/errorHandler.ts` | 450 | Error Handling |
| 4 | `utils/ui/accessibilityUtils.ts` | 410 | Accessibility |
| 5 | `types/errors.ts` | 387 | Type Definitions |
| 6 | `hooks/useSettings.ts` | 379 | Settings Hook |
| 7 | `utils/ui/cn.ts` | 351 | CSS Utilities |
| 8 | `hooks/useTheme.ts` | 347 | Theme Hook |

**Total Large Files:** 8 files (3.7% of files, ~15% of code)

## 🏪 Zustand Stores Detail

| Store | Lines | Purpose |
|-------|-------|---------|
| sessionStore.ts | 456 | Session management |
| errorStore.ts | 287 | Error tracking |
| inputAccessibility.ts | 285 | Input accessibility |
| accessibilityStore.ts | 281 | General accessibility |
| cognitiveAccessibility.ts | 260 | Cognitive accessibility |
| gameStateStore.ts | 243 | Game logic |
| settingsStore.ts | 218 | User settings |
| visualAccessibility.ts | 217 | Visual accessibility |
| statisticsStore.ts | 178 | Statistics |
| localeStore.ts | 168 | Locale settings |
| audioStore.ts | 129 | Audio state |
| themeStore.ts | 120 | Theme management |
| index.ts | 92 | Store exports |
| languageStore.ts | 49 | Language selection |
| navigationStore.ts | 17 | Navigation state |

**Total:** 15 stores, ~3,000 lines

## 🎣 Custom Hooks Detail

| Hook | Lines | Purpose |
|------|-------|---------|
| useSettings.ts | 379 | Settings integration |
| useTheme.ts | 347 | Theme system |
| useAudioPreloader.ts | 308 | Audio preloading |
| useAudio.ts | 274 | Audio system |
| useAudioPlayer.ts | 228 | Audio playback |
| useAudioStrategy.ts | 182 | Audio strategies |
| useGameEndDetection.ts | 139 | Game over logic |
| useAudioState.ts | 124 | Audio state |
| useKeyboardInput.ts | 100 | Keyboard input |
| useGameControls.ts | 95 | Game controls |
| useHighScoreUtils.ts | 89 | High scores |
| useSession.ts | 87 | Session management |
| (10 other hooks) | ~592 | Various utilities |

**Total:** 22 hooks, ~2,845 lines

## 🧩 Component Complexity

### Large Components (>200 lines):
- `StatisticsDashboard.tsx`: 326 lines
- `ErrorBoundary.tsx`: 273 lines
- `AccessibilitySettings.tsx`: 252 lines
- `ThemeSettings.tsx`: 235 lines
- `ParticleEffect.tsx`: 232 lines
- `ColorPaletteEditor.tsx`: 220 lines
- `GameStateController.tsx`: 218 lines

### Component Categories:
- **Game Components:** 25 files (~40% of components)
- **UI Components:** 20 files (shadcn/ui)
- **Settings Components:** 8 files
- **Layout Components:** 6 files
- **Other Components:** 5 files

## 🔗 Import Complexity

### High Import Count Files:
- `ThemeSettings.tsx`: 13 imports
- `root.tsx`: 12 imports
- `main.tsx`: 11 imports
- `GameInfo.tsx`: 11 imports
- `StatisticsDashboard.tsx`: 9 imports

## 📦 Bundle Size Baseline

- **Production Build:** 322.02 kB
- **Gzipped Size:** 95.68 kB
- **Compression Ratio:** 70.3%

## 🎯 Refactoring Targets

### Primary Targets (>400 lines):
1. **audioFallback.ts (486 lines)** - Audio fallback system
2. **sessionStore.ts (456 lines)** - Session management
3. **errorHandler.ts (450 lines)** - Error handling
4. **accessibilityUtils.ts (410 lines)** - Accessibility utilities

### Secondary Targets (300-400 lines):
1. **errors.ts (387 lines)** - Error type definitions
2. **useSettings.ts (379 lines)** - Settings hook
3. **cn.ts (351 lines)** - CSS utilities
4. **useTheme.ts (347 lines)** - Theme hook

### Store Consolidation Targets:
1. **Language/Locale stores** - 2 stores → 1 store
2. **Accessibility stores** - 4 stores → 2 stores
3. **Audio-related stores** - Consider consolidation

## 📋 Success Metrics

### Quantitative Goals:
- **Files:** 214 → 200-210 (-2-7%)
- **LOC:** 32,236 → <30,000 (-7-10%)
- **Large Files:** 8 → 3-4 (-50-62%)
- **Stores:** 15 → 8-10 (-33-47%)

### Qualitative Goals:
- Reduced complexity in large files
- Clearer separation of concerns
- Improved maintainability
- Easier onboarding for new developers

---

**Note:** この数値は今後のリファクタリング作業の成果測定に使用されます。目標数値は理想的な削減を示しており、実際の作業でコードサイズが下がれば成功とします。