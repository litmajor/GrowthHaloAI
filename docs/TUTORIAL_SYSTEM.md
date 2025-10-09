
# Interactive Tutorial System

## Tutorial Component Architecture

```typescript
interface Tutorial {
  id: string;
  title: string;
  category: 'getting-started' | 'feature' | 'advanced';
  steps: TutorialStep[];
  estimatedTime: number; // minutes
  prerequisites?: string[];
}

interface TutorialStep {
  title: string;
  content: string;
  element?: string; // CSS selector to highlight
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    type: 'click' | 'input' | 'navigate';
    target: string;
    validation?: () => boolean;
  };
  video?: string; // Optional video URL
}
```

## Core Tutorials

### 1. Getting Started (5 min)
- Platform philosophy
- First chat with Bliss
- Understanding your halo phase
- Navigation basics

### 2. Values Discovery (8 min)
- Why values matter
- Compass assessment
- Using values for decisions
- Values evolution over time

### 3. Daily Practice (6 min)
- Daily check-ins
- Energy tracking
- Journaling effectively
- Building consistency

### 4. Advanced Features (12 min)
- Pattern recognition
- Contradiction detection
- Hypothesis formation
- Wisdom library

### 5. Community Connection (7 min)
- Finding your circle
- Meaningful contribution
- Privacy & boundaries
- Getting support

## Tutorial Delivery Mechanisms

### Spotlight Mode
- Dims everything except highlighted element
- Uses backdrop-blur for visual focus
- Smooth transitions between steps

### Step-by-Step Overlay
- Floating card with instructions
- Positioned relative to target element
- Responsive to screen size

### Practice Mode
- Safe environment to try features
- No permanent changes
- Real-time validation

### Progress Tracking
- Resume where you left off
- Saves to localStorage
- Cross-session persistence

### Achievement Badges
- Celebrate tutorial completion
- Visual feedback and encouragement
- Share progress (optional)

## Implementation Notes

- Use Framer Motion for animations
- Implement keyboard navigation (arrow keys, Esc)
- Ensure WCAG AA accessibility
- Mobile-responsive design
- Support for reduced motion preferences
