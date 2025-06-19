# Tetris Game Refactoring Plan

## Overview
This document outlines a comprehensive refactoring plan for the Tetris game codebase, focusing on reducing redundancy, improving extensibility, and maintaining clean, maintainable code.

## Refactoring Categories

### 🟡 Medium-Scale Refactoring

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

#### 3.2 Import Path Organization ✅ **COMPLETED**
**Purpose**: Clarify dependencies

**Current Issues**: ~~Resolved~~
- ~~Mixed use of @/ alias and relative imports~~ ✅ Standardized to @/ for cross-module imports
- ~~Some files use both patterns inconsistently~~ ✅ Consistent pattern applied across codebase
- ~~No clear rule for when to use which~~ ✅ Clear rules documented and implemented

**Checklist**:
- [x] Use @/ for cross-module imports
- [x] Use relative imports within same module (barrel exports only)
- [x] Update tsconfig paths if needed (already configured)
- [x] Document import conventions

**Implementation Summary**:
- ✅ **Store Files**: All 4 store files updated to use @/ for external imports
- ✅ **Route Files**: All 5 route files converted from relative to @/ imports  
- ✅ **Utility Files**: 15+ utility files updated to use @/ for cross-directory imports
- ✅ **Core Components**: Updated hooks, types, config files to use @/ prefix
- ✅ **Quality Verification**: Lint passed, build successful (gzip: 295.49 kB)
- ✅ **Convention**: @/ for cross-module, relative only for barrel exports

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

## Success Metrics

### 🎯 Target Metrics
- **Code Reduction**: Target 20% reduction in total lines
- **Test Coverage**: Maintain or improve current coverage
- **Performance**: No regression in game performance
- **Developer Experience**: Faster feature development

### 📊 Phase 3 Achievements (Configuration Comparison)
- ✅ **Code Quality**: Eliminated ~150 lines of repetitive comparison logic
- ✅ **Reusability**: Created 4 new reusable components/hooks
- ✅ **Test Coverage**: Added 19 new tests with 100% pass rate
- ✅ **Type Safety**: Strict TypeScript compliance maintained
- ✅ **Internationalization**: Complete EN/JA translation support
- ✅ **User Experience**: Enhanced AboutPage with detailed system insights
- ✅ **Architecture**: Established patterns for future comparison features

## Risk Mitigation
1. **Incremental Changes**: Each refactoring should be atomic
2. **Test First**: Update tests before refactoring
3. **Feature Flags**: Use flags for major architectural changes
4. **Rollback Plan**: Each phase should be reversible

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