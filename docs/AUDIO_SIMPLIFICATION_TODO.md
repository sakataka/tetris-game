# Audio System Simplification TODO

## 📋 Overview
Complete simplification of the audio system by removing complex Strategy Pattern, Singleton Manager, and multiple hooks in favor of a single, simple `useSimpleAudio` hook.

## 🎯 Goals
- Reduce audio-related code from ~2000 lines to ~150 lines
- Use only HTMLAudio (remove WebAudio complexity)
- Single hook for all audio operations
- Remove complex error handling and fallback systems
- Maintain basic audio functionality: play, stop, volume, mute

## ✅ Completed Tasks
- [x] Create this TODO document
- [x] Implement new `useSimpleAudio` hook
- [x] Update AudioPanel component
- [x] Update TetrisGame component (via useAudioController)
- [x] Remove old audio files
- [x] Simplify audioStore
- [x] Update test files

## 🔧 Implementation Tasks

### Phase 1: Create New Simple Audio Hook ✅
- [x] Create `src/hooks/useSimpleAudio.ts`
  - [x] Basic HTMLAudio implementation
  - [x] Volume control (0-1)
  - [x] Mute/unmute functionality
  - [x] Play/stop sound methods
  - [x] Error handling (minimal)
  - [x] Sound definitions (6 game sounds)

### Phase 2: Update Components ✅
- [x] Update `src/components/AudioPanel.tsx`
  - [x] Replace complex audio status with simple state
  - [x] Remove preload progress display
  - [x] Simplify audio controls
- [x] Update `src/components/TetrisGame.tsx`
  - [x] Replace useAudio with useSimpleAudio (via useAudioController)
  - [x] Update sound playing calls

### Phase 3: Remove Old Audio System ✅
- [x] Delete audio strategy files:
  - [x] `src/utils/audio/strategies/` (entire directory)
  - [x] `src/utils/audio/audioManager.ts`
  - [x] `src/utils/audio/audioPreloader.ts`
- [x] Delete old hooks:
  - [x] `src/hooks/useAudio.ts`
  - [x] `src/hooks/useAudioPlayer.ts`
  - [x] `src/hooks/useAudioPreloader.ts`
  - [x] `src/hooks/useAudioState.ts`
  - [x] `src/hooks/useAudioStrategy.ts`
  - [x] Updated `src/hooks/controllers/useAudioController.ts` (simplified)
- [x] Delete components:
  - [x] `src/components/controllers/AudioController.tsx`

### Phase 4: Simplify Store ✅
- [x] Simplify `src/store/audioStore.ts`
  - [x] Remove strategy-related state
  - [x] Remove preload progress state
  - [x] Keep only: volume, isMuted, setVolume, setMuted
  - [x] Remove complex selectors

### Phase 5: Update Tests ✅
- [x] Create `src/test/useSimpleAudio.test.ts`
- [x] Remove old `src/test/useAudio.test.ts`
- [x] Remove audio-related test mocks

### Phase 6: Clean Up Imports ✅
- [x] Update `src/utils/audio/index.ts` (simplified)
- [x] Remove old audio file references

## 🎵 Sound Requirements
Keep these 6 essential game sounds:
- `lineClear`: Line clearing sound
- `pieceLand`: Piece landing sound  
- `pieceRotate`: Piece rotation sound
- `tetris`: Tetris (4-line clear) sound
- `gameOver`: Game over sound
- `hardDrop`: Hard drop sound

## 🔄 API Design
New `useSimpleAudio` hook should provide:
```typescript
const {
  volume,          // number (0-1)
  isMuted,         // boolean
  setVolume,       // (volume: number) => void
  setMuted,        // (muted: boolean) => void
  toggleMute,      // () => void
  playSound,       // (soundKey: SoundKey) => void
  stopAllSounds,   // () => void
} = useSimpleAudio();
```

## 📝 Notes
- No WebAudio API complexity
- No Strategy Pattern
- No Singleton Manager
- No complex error suppression
- No preloading progress tracking
- Minimal error handling (just console.warn)
- Direct HTMLAudio element manipulation

## 🚀 Success Criteria ✅
- [x] Audio system works with basic functionality
- [x] Volume control and mute work correctly
- [x] All 6 game sounds play when triggered
- [x] Code is under 150 lines total (useSimpleAudio: ~130 lines)
- [x] No complex abstractions or patterns
- [x] Tests pass with simplified implementation

## 📊 Results
**Before Simplification:**
- ~2000 lines of audio-related code
- 5+ files in strategies/ directory
- 5+ complex hooks
- Singleton AudioManager (370 lines)
- Complex error handling and fallback systems

**After Simplification:**
- ~130 lines total (useSimpleAudio hook)
- Single hook handles all audio functionality
- Direct HTMLAudio implementation
- Minimal error handling
- No Strategy Pattern or Singleton complexity

**Reduction:** ~93% code reduction while maintaining core functionality!