# UI Improvement Tasks

## Overview
This document tracks the UI improvement implementation based on the design analysis. Each task will be completed and committed separately to ensure stability.

## Task List

### 1. Spacing System Unification (8-point Grid)
**Priority:** High - Immediate impact on visual consistency
**Status:** ✅ Completed

#### Subtasks:
- [x] Create spacing constants in a centralized location
- [x] Update CyberCard component padding
- [x] Update button components spacing
- [x] Update game panels (Score, Next Piece, Controls)
- [x] Update form controls spacing
- [x] Update mobile layouts
- [x] Verify responsive spacing scales properly

#### Implementation Details:
```typescript
// New spacing system (8-point grid)
const SPACING = {
  xs: '0.5rem',   // 8px
  sm: '1rem',     // 16px
  md: '1.5rem',   // 24px
  lg: '2rem',     // 32px
  xl: '3rem',     // 48px
} as const;
```

#### Files to Update:
- `/src/constants/layout.ts` - Add SPACING constants
- `/src/components/ui/CyberCard.tsx` - Standardize padding
- `/src/components/ui/button.tsx` - Consistent padding
- `/src/components/GameLayoutManager.tsx` - Panel spacing
- `/src/components/CombinedStatsNextPanel.tsx` - Internal spacing
- `/src/components/GameButtonsPanel.tsx` - Button spacing
- `/src/components/MobileGameInfo.tsx` - Mobile spacing

---

### 2. Visual Noise Reduction
**Priority:** High - Improves readability and focus
**Status:** ✅ Completed

#### Subtasks:
- [x] Reduce glow effects intensity
- [x] Simplify gradient usage (one per component max)
- [x] Remove unnecessary particle effects
- [x] Reduce shadow complexity
- [x] Increase background opacity for better contrast
- [x] Remove decorative elements without purpose

#### Implementation Details:
```css
/* Current -> Target */
glow: 0 0 16px -> 0 0 4px
bg-opacity: 5% -> 15%
multiple gradients -> single gradient
always-on particles -> event-triggered only
```

#### Files to Update:
- `/src/utils/ui/themePresets.ts` - Reduce effect intensities
- `/src/data/themePresets.json` - Update glow/shadow values
- `/src/components/ParticleCanvas.tsx` - Conditional rendering
- `/src/components/ui/CyberCard.tsx` - Simplify gradients
- `/src/app/globals.css` - Update transparency utilities

---

### 3. Component Usage Rules
**Priority:** Medium - Clarifies design system
**Status:** ✅ Completed

#### Subtasks:
- [x] Reduce button variants to 3 (primary, secondary, ghost)
- [x] Reduce CyberCard themes to 3 (primary, default, muted)
- [x] Create consistent hover/focus states
- [x] Standardize border radius (6px)
- [x] Unify transition timing (150ms)
- [x] Document usage guidelines in components

#### Implementation Details:
```typescript
// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'ghost';

// CyberCard themes  
type CardTheme = 'primary' | 'default' | 'muted';

// Consistent interactions
const TRANSITIONS = {
  duration: '150ms',
  easing: 'ease',
};
```

#### Files to Update:
- `/src/components/ui/button.tsx` - Reduce variants
- `/src/components/ui/CyberCard.tsx` - Reduce themes
- `/src/constants/` - Add DESIGN_TOKENS
- Component files using buttons/cards - Update usage

---

### 4. World View Unification
**Priority:** Low - Biggest impact but requires most work
**Status:** ⏳ Pending

#### Subtasks:
- [ ] Choose unified design direction
- [ ] Update typography system (2 fonts max)
- [ ] Align all visual effects with chosen aesthetic
- [ ] Update color usage for consistency
- [ ] Ensure mobile/desktop parity
- [ ] Remove conflicting design elements

#### Decision Required:
Choose one direction:
- **A. Neo-Retro**: Pixel aesthetic, minimal effects
- **B. Cyber-Modern**: Full cyberpunk, consistent neon
- **C. Clean Contemporary**: Minimal, focus on gameplay

---

## Progress Log

### 2024-06-18
- Created task documentation
- Starting with Task 1: Spacing System Unification

### Task 1 Progress:
- [x] Step 1: Create spacing constants (SPACING_SCALE, PADDING_SCALE, GAP_SCALE)
- [x] Step 2: Update components (CyberCard, Button, GameLayoutManager, MobileGameInfo, GameButtonsPanel, CombinedStatsNextPanel)
- [x] Step 3: Test and verify (TypeScript ✓, Build ✓, Lint warnings only)
- [x] Step 4: Commit changes

### Task 2 Progress:
- [x] Step 1: Reduce glow effects intensity (themePresets.json: reduced by ~50%)
- [x] Step 2: Simplify gradient usage (GameLayoutManager: single gradient)
- [x] Step 3: Remove unnecessary particle effects (ParticleCanvas: 100→50 particles)
- [x] Step 4: Increase background opacity (CyberCard: 5%→15%, borders 30%→40%)
- [x] Step 5: Simplify button effects (GameButtonsPanel: removed complex gradients/shadows)

### Task 3 Progress:
- [x] Step 1: Reduce button variants to 3 (primary, secondary, ghost)
- [x] Step 2: Reduce CyberCard themes to 3 (primary, default, muted)
- [x] Step 3: Standardize hover/focus states (150ms transitions)
- [x] Step 4: Document usage guidelines (Button and CyberCard components)
- [x] Step 5: Add design tokens (DESIGN_TOKENS in layout.ts)
- [x] Step 6: Update existing components to use new variants
- [x] Step 7: Fix all TypeScript errors from variant changes
- [x] Step 8: Verify build works correctly

### Task 4 Progress:
- [ ] Step 1: Choose unified design direction
- [ ] Step 2: Update typography system
- [ ] Step 3: Align visual effects with chosen aesthetic
- [ ] Step 4: Remove conflicting design elements

---

## Build Verification Checklist
Before each commit:
- [ ] Run `pnpm build` - no errors
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors  
- [ ] Run `pnpm lint` - no linting errors
- [ ] Visual inspection in browser - no broken layouts
- [ ] Mobile responsive check - layouts work

---

## Notes for Continuation
If work is interrupted, the next person should:
1. Check the last completed task in this document
2. Run `pnpm install` to ensure dependencies
3. Run `pnpm dev` to start development
4. Continue from the next unchecked subtask
5. Update this document as tasks complete
6. Commit after each major task with descriptive message

---

## Completed Tasks
_Tasks will be moved here as they are completed_