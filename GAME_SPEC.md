# Suica Game Specification

## Overview
A physics-based puzzle game where players drop fruits that merge when identical fruits touch, inspired by the popular "Suica Game" (Watermelon Game).

## Core Mechanics

### Fruit Evolution Chain
1. Cherry (smallest) → 2. Strawberry → 3. Grape → 4. Orange → 5. Persimmon → 6. Apple → 7. Pear → 8. Peach → 9. Pineapple → 10. Melon → 11. Watermelon (largest)

### Gameplay Rules
- Player drops fruits from the top of the container
- When two identical fruits touch, they merge into the next fruit in the evolution chain
- Game ends when fruits stack above the danger line at the top
- Score increases with each merge (higher-tier fruits give more points)

### Physics
- Realistic gravity and collision detection
- Fruits roll and settle naturally
- Container has solid walls and floor

## Technical Requirements

### Platform
- Web-based game using HTML5 Canvas
- JavaScript for game logic
- No external dependencies for core functionality

### Game Container
- Fixed rectangular container (800x600 pixels)
- Danger line at 90% height
- Visual boundaries

### Controls
- Mouse/touch to position drop point
- Click/tap to drop fruit
- Preview of next fruit to drop

### Visual Elements
- Colorful fruit sprites with distinct shapes
- Particle effects for merging
- Score display
- Game over screen
- Simple, clean UI

### Audio (Optional)
- Sound effects for drops and merges
- Background music

## Scoring System
- Cherry merge: 10 points
- Strawberry merge: 20 points
- Grape merge: 40 points
- Orange merge: 80 points
- Persimmon merge: 160 points
- Apple merge: 320 points
- Pear merge: 640 points
- Peach merge: 1280 points
- Pineapple merge: 2560 points
- Melon merge: 5120 points
- Watermelon merge: 10240 points

## Win Condition
- Create a watermelon (highest achievement)
- High score tracking

## Technical Implementation Plan

### Phase 1: Basic Structure
- HTML canvas setup
- Game loop implementation
- Basic physics engine

### Phase 2: Core Mechanics
- Fruit dropping mechanism
- Collision detection
- Merge logic

### Phase 3: Visual Polish
- Fruit sprites/graphics
- Animations and effects
- UI elements

### Phase 4: Game Flow
- Game states (menu, playing, game over)
- Score system
- Restart functionality