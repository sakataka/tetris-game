# Tetris Game Refactoring Plan

## Overview
This document outlines a comprehensive refactoring plan for the Tetris game codebase, focusing on reducing redundancy, improving extensibility, and maintaining clean, maintainable code.

## Refactoring Categories

### 🔴 Large-Scale Refactoring

#### 1.1 Zustand Store Pattern Unification and Optimization
**Purpose**: Reduce redundant methods and improve store consistency

**Current Issues**:
- `accessibilityStore.ts` has 862 lines with many repetitive toggle/update methods
- Similar patterns repeated across all stores (gameStateStore, settingsStore, etc.)
- Each store implements its own version of toggle and update methods

**Proposed Solution**:
- [x] ✅ Create a generic store factory with common patterns
- [x] ✅ Implement a unified toggle method: `toggle<K extends keyof State>(key: K)`
- [x] ✅ Create a generic update method: `update<K extends keyof State>(key: K, value: State[K])`
- [x] ✅ Reduce accessibilityStore from 862 lines to 340 lines (60% reduction)

**Example Implementation**:
```typescript
// Before: Multiple toggle methods
toggleLargeText: () => set(state => ({ visual: { ...state.visual, largeText: !state.visual.largeText } }))
toggleReducedMotion: () => set(state => ({ reducedMotion: !state.reducedMotion }))

// After: Single generic toggle
toggle: (path: string) => set(state => updateNestedValue(state, path, !getNestedValue(state, path)))
```

#### 1.2 Singleton Pattern Unification
**Purpose**: Eliminate duplicate code and ensure consistent instance management

**Current Issues**:
- AudioManagerV2, AnimationManager, TimeoutManager all implement similar singleton patterns
- Each has its own getInstance() implementation
- No shared interface or base implementation

**Proposed Solution**:
- [ ] Create a `SingletonMixin` or base class
- [ ] Standardize getInstance() implementation
- [ ] Add lifecycle management (reset, destroy methods)
- [ ] Implement proper TypeScript typing for singleton pattern

#### 1.3 Configuration Comparison Logic Generalization
**Purpose**: Eliminate redundancy in compareConfigurations function

**Current Issues**:
- `src/config/utils.ts` repeats comparison logic for each config section
- 300 lines of mostly duplicate code
- Hard to maintain when adding new configuration sections

**Proposed Solution**:
- [ ] Create generic deep comparison function
- [ ] Use object traversal instead of manual property checking
- [ ] Implement path-based difference reporting
- [ ] Reduce from 300 lines to ~50 lines

### 🟡 Medium-Scale Refactoring

#### 2.1 Error Handling Pattern Unification
**Purpose**: Improve error creation and handling consistency

**Current Issues**:
- Multiple createXError functions (createAudioError, createGameError, createUIError)
- Inconsistent error handling across different modules
- Duplicate error formatting logic

**Proposed Solution**:
- [ ] Create unified ErrorFactory class
- [ ] Implement error type enum instead of multiple functions
- [ ] Standardize error metadata structure
- [ ] Create centralized error handler with category-based routing

#### 2.2 Audio Strategy Initialization Logic Improvement
**Purpose**: Reduce duplicate initialization patterns

**Current Issues**:
- WebAudioStrategy and HTMLAudioStrategy have similar initialization code
- Fallback logic duplicated in AudioManagerV2
- Error handling repeated in each strategy

**Proposed Solution**:
- [ ] Move common initialization to BaseAudioStrategy
- [ ] Abstract fallback mechanism
- [ ] Create initialization lifecycle hooks
- [ ] Implement proper async/await patterns throughout

#### 2.3 Animation Management Optimization
**Purpose**: Improve performance and simplify management

**Current Issues**:
- Complex priority management logic
- FPS limiting code scattered across multiple methods
- Performance monitoring duplicated

**Proposed Solution**:
- [ ] Create AnimationQueue with built-in priority
- [ ] Centralize FPS limiting logic
- [ ] Implement animation pooling for particle effects
- [ ] Add performance budgeting system

### 🟢 Small-Scale Refactoring

#### 3.1 Variable Naming Consistency
**Purpose**: Improve code readability

**Issues Found**:
- Inconsistent use of Manager/manager, Mgr/mgr
- Some variables use abbreviations unnecessarily
- Mixed camelCase and PascalCase for similar concepts

**Checklist**:
- [ ] Rename all `mgr` variables to `manager`
- [ ] Standardize on `Manager` suffix for classes
- [ ] Use `manager` (lowercase) for instances
- [ ] Update all references in tests

#### 3.2 Import Path Organization
**Purpose**: Clarify dependencies

**Current Issues**:
- Mixed use of @/ alias and relative imports
- Some files use both patterns inconsistently
- No clear rule for when to use which

**Checklist**:
- [ ] Use @/ for cross-module imports
- [ ] Use relative imports within same module
- [ ] Update tsconfig paths if needed
- [ ] Document import conventions

#### 3.3 Type Definition Consolidation
**Purpose**: Improve type reusability

**Current Issues**:
- Similar toggle action types defined separately
- Update action types duplicated across stores
- Generic patterns not utilized

**Checklist**:
- [ ] Create generic Action types
- [ ] Consolidate Toggle/Update/Set action types
- [ ] Use TypeScript utility types more effectively
- [ ] Create shared store type definitions

#### 3.4 Constant Management Improvement
**Purpose**: Eliminate magic numbers and centralize constants

**Current Issues**:
- Some timeout values hardcoded
- Animation durations scattered
- Related constants in different files

**Checklist**:
- [ ] Move all timing constants to timing.ts
- [ ] Group related constants together
- [ ] Name all magic numbers
- [ ] Create constant documentation

### 🔵 Architecture Improvements

#### 4.1 Feature-Based Directory Structure Consideration
**Purpose**: Improve development efficiency by feature

**Current Structure**:
```
src/
  components/
  hooks/
  store/
  utils/
```

**Proposed Structure**:
```
src/
  features/
    game/
      components/
      hooks/
      store/
      utils/
    settings/
    statistics/
  shared/
```

**Checklist**:
- [ ] Evaluate migration cost vs benefit
- [ ] Create migration plan if approved
- [ ] Update import paths
- [ ] Update documentation

#### 4.2 Dependency Injection Pattern Introduction
**Purpose**: Improve testability and extensibility

**Current Issues**:
- Direct singleton access makes testing difficult
- Hard to mock managers in tests
- Tight coupling between components and services

**Proposed Solution**:
- [ ] Create DI container or context providers
- [ ] Make managers injectable
- [ ] Use React Context for service injection
- [ ] Update tests to use injected mocks

## Implementation Plan

### Phase 1: Quick Wins (Week 1)
1. Variable naming consistency (3.1)
2. Import path organization (3.2)
3. Constant management (3.4)

### Phase 2: Core Improvements (Week 2-3) ✅ COMPLETED
1. ✅ Zustand store pattern unification (1.1)
2. ✅ Error handling unification (2.1)
3. ✅ Type definition consolidation (3.3)

**Phase 2 Results:**
- **Generic Store Factory**: Created `storeFactory.ts` with common patterns for toggle/update/batch operations
- **AccessibilityStore Simplified**: Reduced from 862 to 244 lines (71% reduction) using new factory patterns
- **SettingsStore Enhanced**: Converted to use generic factory with backward compatibility maintained
- **Error Handling Unified**: Single `ErrorFactory` replaces multiple `createXError` functions
- **Type System Improved**: Generic action types and reusable store patterns in `storeActions.ts`
- **All Tests Passing**: 341 tests maintained, full backward compatibility preserved
- **Code Quality**: Biome formatting applied, TypeScript strict compliance

### Phase 3: Architecture (Week 4-5)
1. Singleton pattern unification (1.2)
2. Configuration comparison generalization (1.3)
3. Audio strategy improvements (2.2)

### Phase 4: Future Considerations (Month 2+)
1. Feature-based directory structure (4.1)
2. Dependency injection pattern (4.2)
3. Animation management optimization (2.3)

## Success Metrics
- **Code Reduction**: Target 20% reduction in total lines
- **Test Coverage**: Maintain or improve current coverage
- **Performance**: No regression in game performance
- **Developer Experience**: Faster feature development

## Risk Mitigation
1. **Incremental Changes**: Each refactoring should be atomic
2. **Test First**: Update tests before refactoring
3. **Feature Flags**: Use flags for major architectural changes
4. **Rollback Plan**: Each phase should be reversible

## Next Steps
1. Review and approve this plan
2. Create feature branches for each phase
3. Begin with Phase 1 quick wins
4. Weekly progress reviews

## Additional Considerations

### Testing Strategy
- [ ] Update tests alongside refactoring
- [ ] Add integration tests for refactored modules
- [ ] Ensure no test coverage regression

### Documentation Updates
- [ ] Update CLAUDE.md with new patterns
- [ ] Create migration guides for developers
- [ ] Update component documentation

### Performance Monitoring
- [ ] Benchmark before and after each major refactoring
- [ ] Monitor bundle size changes
- [ ] Track runtime performance metrics

## Questions for Discussion

1. **Feature-based structure**: Should we migrate to feature-based organization now or wait?
2. **Breaking changes**: Are we willing to make breaking changes for better architecture?
3. **Timeline**: Is the proposed timeline realistic given other priorities?
4. **Tooling**: Should we introduce additional tooling (e.g., madge for dependency analysis)?

---

*This document is a living plan and will be updated as refactoring progresses.*