# Theme Color System Redesign

## Current Problems

### 1. Insufficient Theme Differentiation
- **Cyberpunk, Retro, Neon**: All use dark backgrounds (#0a0a0f, #2d1b69, #000000)
- **Classic, Minimal**: Use light backgrounds that make UI elements hard to see
- Limited color palette (only 3-4 main colors per theme)
- Colors are not systematically applied across UI components

### 2. Lack of World View Expression
Each theme should express a distinct aesthetic:
- **Cyberpunk**: High-tech dystopian future
- **Retro**: 80s arcade nostalgia
- **Classic**: Traditional Tetris feel
- **Minimal**: Clean modern design
- **Neon**: Electric nightlife vibes

## Proposed Color System

### Design Principles
1. Each theme uses 6 core colors that work harmoniously
2. These colors are systematically applied across all UI elements
3. Background/surface colors provide proper contrast
4. Each theme has a unique visual identity

### New Color Palettes

#### 1. Cyberpunk Theme
**World View**: High-tech dystopian future with neon-lit cityscapes
```
- Background: #0f0f1e (Deep midnight blue)
- Surface: #1a1a2e (Dark blue-purple)
- Primary: #00ffff (Cyan neon)
- Secondary: #ff00ff (Magenta neon)
- Accent: #ffff00 (Yellow warning)
- Neutral: #4a4a6a (Blue-grey)
```

#### 2. Retro Theme
**World View**: 80s arcade cabinet with CRT glow
```
- Background: #2a1a3e (Deep purple)
- Surface: #ff6b35 (Warm orange)
- Primary: #ffd23f (Golden yellow)
- Secondary: #ee4266 (Hot pink)
- Accent: #2ed573 (Mint green)
- Neutral: #f7931e (Burnt orange)
```

#### 3. Classic Theme
**World View**: Original Tetris on grey Game Boy
```
- Background: #9bbc0f (Game Boy green)
- Surface: #8bac0f (Darker green)
- Primary: #306230 (Deep green)
- Secondary: #0f380f (Darkest green)
- Accent: #9bbc0f (Bright green)
- Neutral: #657e05 (Olive green)
```

#### 4. Minimal Theme
**World View**: Zen-like simplicity with careful color accents
```
- Background: #fafafa (Off-white)
- Surface: #e0e0e0 (Light grey)
- Primary: #212121 (Near black)
- Secondary: #757575 (Medium grey)
- Accent: #ff5252 (Material red)
- Neutral: #bdbdbd (Soft grey)
```

#### 5. Neon Theme
**World View**: Underground rave with UV lights
```
- Background: #0a0014 (Deep purple-black)
- Surface: #1a0033 (Purple-black)
- Primary: #ff0080 (Hot pink)
- Secondary: #00ff80 (Lime green)
- Accent: #8000ff (Electric purple)
- Neutral: #ff8000 (Neon orange)
```

## Implementation Strategy

### 1. Color Usage Rules
```typescript
interface ThemeColorUsage {
  // Layout
  pageBackground: 'background';
  panelBackground: 'surface';
  cardBackground: 'surface + opacity';
  
  // Text
  headingText: 'primary';
  bodyText: 'foreground';
  mutedText: 'neutral';
  
  // Interactive
  primaryButton: 'primary';
  secondaryButton: 'secondary';
  dangerButton: 'accent';
  
  // Game Elements
  activeTetromino: 'primary';
  ghostPiece: 'primary + 30% opacity';
  gridLines: 'neutral + 20% opacity';
  scoreHighlight: 'accent';
}
```

### 2. Component Mapping
Each component should use colors from the palette systematically:
- Game board: background + surface + gridlines
- Score panel: surface + primary text + accent highlights
- Settings: surface cards + primary/secondary buttons
- Dialogs: surface background + appropriate button colors

### 3. Visual Hierarchy
1. **Primary**: Main interactive elements, important text
2. **Secondary**: Supporting UI elements, secondary actions
3. **Accent**: Highlights, warnings, special states
4. **Neutral**: Borders, dividers, muted elements
5. **Background/Surface**: Layout structure

## Expected Outcomes

1. **Clear Theme Identity**: Each theme will have a distinct visual personality
2. **Better Contrast**: Proper background/foreground relationships
3. **Consistent Experience**: Colors used systematically across all screens
4. **Enhanced Immersion**: Players feel the theme's world view
5. **Improved Usability**: Better visual hierarchy and readability

## Migration Path

1. Update themePresets.json with new color palettes
2. Add 'neutral' color to existing color definitions
3. Update CSS to use the 6-color system
4. Test each theme for contrast and readability
5. Adjust component styles to follow color usage rules