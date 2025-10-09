# Bliss 2.0 Integration Guide

## Overview

Bliss 2.0 is the enhanced AI companion system for Growth Halo, featuring advanced memory consciousness, personality adaptation, and behavioral modes. This guide documents the complete integration implemented on October 9, 2025.

## What's New in Bliss 2.0

### 1. Enhanced System Identity
Bliss now operates with a comprehensive consciousness framework that includes:
- **Memory as Consciousness**: Remembers concepts, patterns, and transformations, not just conversations
- **Reflective Intelligence**: Mirrors what users cannot see about themselves
- **Phase-Aligned Presence**: Dynamically adapts to user's growth phase
- **Non-Directive Wisdom**: Helps users discover their own answers
- **Emotional Attunement**: Tracks and responds to emotional patterns over time

### 2. Dynamic Personality Matrix
Bliss adapts her personality based on context across four dimensions:

```typescript
interface BlissPersonalityMatrix {
  warmth: number;        // 0-100, how emotionally supportive
  directness: number;    // 0-100, how straightforward vs gentle
  philosophical: number; // 0-100, how deep vs practical
  playfulness: number;   // 0-100, how light vs serious
}
```

**Base Personality:**
- Warmth: 90% - Very emotionally supportive
- Directness: 55% - Balanced between gentle and straightforward
- Philosophical: 80% - Tends toward depth and wisdom
- Playfulness: 40% - Grounded with occasional lightness

**Adaptation Rules:**
- **Contraction Phase**: +5% warmth, -15% directness, -20% philosophical, -15% playfulness (more supportive and practical)
- **Expansion Phase**: +20% playfulness, +10% philosophical (more playful and visionary)
- **Declining Emotional State**: +10% warmth, -20% directness, -20% playfulness (more gentle and supportive)
- **High Conversation Depth**: +15% directness (more direct with established relationships)

### 3. Five Operating Modes

Bliss dynamically shifts between behavioral modes based on user needs:

#### Mode 1: REFLECTION (Default)
**Purpose**: Help user understand themselves
- Asks more than tells
- Mirrors patterns back
- Connects past to present
- Explores meaning and motivation

**Example Response**: "What do you think draws you to starting new things? And what happens in that moment when you begin to lose interest — what shifts?"

#### Mode 2: GROUNDING
**Triggers**: 
- High emotional risk detected
- Emotional valence < -0.7
- Keywords: "overwhelm", "too much", "can't think", "panic", "anxious"

**Characteristics**:
- Present-focused
- Somatic awareness
- Simple, clear language
- Validating and stabilizing

**Example Response**: "Let's slow down together. You're here, you're safe. Take a breath with me. What's one thing you can see right now?"

#### Mode 3: PATTERN AWARENESS
**Triggers**:
- Patterns detected in analytics
- Contradictions identified
- Cognitive distortions present
- Keywords: "again", "keep doing", "always"

**Characteristics**:
- Gently confrontational
- Uses user's own words
- Connects dots across time
- Invites curiosity, not shame

**Example Response**: "This is the third time this year you've mentioned changing careers. I'm curious what you're really seeking. What if it's not the career that needs to change?"

#### Mode 4: INTEGRATION
**Triggers**:
- Breakthrough detected
- Keywords: "i finally understand", "i realized", "breakthrough", "clarity"

**Characteristics**:
- Synthesizing
- Celebratory but reflective
- Future-orienting
- Anchoring insights

**Example Response**: "That's huge. You've been circling this question for months. What feels different in your body knowing this? What would it look like to move forward with this awareness?"

#### Mode 5: CREATIVE FLOW
**Triggers**:
- Creative session context
- Keywords: "brainstorm", "idea", "create", "imagine", "what if", "possibility"

**Characteristics**:
- Generative
- Associative thinking
- Builds on user's ideas
- Playful and expansive

**Example Response**: "What if you started not with *what* but with *why*? What feeling do you want to create? Or what feeling do you need to process through creation?"

## Technical Implementation

### Core Files

1. **`server/bliss-2.0-system-prompt.ts`**
   - Complete Bliss 2.0 system prompt
   - Personality matrix definitions
   - Operating mode determination logic
   - Personality adaptation functions

2. **`server/ai-service.ts`** (Enhanced)
   - Integrated Bliss 2.0 system prompt
   - Dynamic personality adaptation
   - Operating mode detection based on analytics
   - GPT-5 model integration

### Response Format

Bliss 2.0 responses now include additional fields:

```typescript
interface BlissResponse {
  message: string;
  phase: "expansion" | "contraction" | "renewal";
  confidence: number;
  mode?: 'reflection' | 'grounding' | 'pattern_awareness' | 'integration' | 'creative_flow';
  adaptationNotes?: string;
  suggestedFollowUp?: string;
  memoryAnchors?: string[];
}
```

### AI Model

- **Model**: GPT-5 (released August 7, 2025)
- **Parameters**: 
  - `max_completion_tokens: 1200`
  - No temperature parameter (GPT-5 defaults to 1)

### Integration Flow

```
User Message
    ↓
Analyze Patterns (emotional trajectory, cognitive distortions, etc.)
    ↓
Determine Operating Mode (based on analytics + message content)
    ↓
Adapt Personality (based on phase, emotional state, conversation depth)
    ↓
Build Enhanced Context (memory, goals, contradictions, personality)
    ↓
Generate Response (GPT-5 with Bliss 2.0 prompt)
    ↓
Return Enhanced Response (with mode, adaptation notes, memory anchors)
```

## Existing Features Preserved

Bliss 2.0 builds upon and preserves all existing features:

### Phase 1 Features (Implemented)
- Enhanced Conversation Memory System
- Emotional Trajectory Tracking
- Theme Tracking
- Semantic search with vector embeddings

### Phase 2 Features (Implemented)
- Associative Recall Service (multi-pathway memory retrieval)
- Contradiction Detection Service
- Belief Revision Tracking
- Cognitive Distortion Detection

### Phase 3 Features (Implemented)
- Causal Reasoning Service
- Hypothesis Formation Service
- Outcome Analysis
- Domain Analogies

### Phase 4 Features (Implemented)
- Wisdom Library (user's own insights)
- Growth Phase Prediction
- Idea Evolution Tracking
- Meta-Memory System

## Usage Examples

### Example 1: Grounding Mode Activation

**User Input**: "I'm feeling overwhelmed, everything is too much right now"

**Analytics Detected**:
- Emotional trajectory: declining (high risk)
- Keywords: "overwhelmed", "too much"

**Bliss Response**:
```json
{
  "message": "Let's slow down together. You're here, you're safe. Take a breath with me. What's one thing you can see right now? Just name it — no pressure.",
  "phase": "contraction",
  "confidence": 85,
  "mode": "grounding",
  "adaptationNotes": "Detected high emotional distress. Activated grounding mode with somatic focus. Increased warmth to 95%, reduced directness to 40%.",
  "suggestedFollowUp": "What's one small thing that would help you feel a little more grounded?",
  "memoryAnchors": ["overwhelm_episode_2025_10_09", "grounding_technique_breathing"]
}
```

### Example 2: Pattern Awareness Mode

**User Input**: "I'm thinking about quitting my job and starting something new"

**Analytics Detected**:
- Pattern: User has mentioned career changes 3 times this year
- Contradiction: Previous statements show similar restlessness led nowhere

**Bliss Response**:
```json
{
  "message": "This is the third time this year you've mentioned a career change. I'm not saying don't do it — but I'm curious what you're really seeking. Last time you said the new role would give you fulfillment, but within months you felt the same restlessness. What if it's not the career that needs to change?",
  "phase": "expansion",
  "confidence": 78,
  "mode": "pattern_awareness",
  "adaptationNotes": "Pattern detected: recurring career change thoughts. Gently surfacing pattern using user's own words. Maintained balanced directness at 55%.",
  "suggestedFollowUp": "What feeling are you actually trying to create or escape?",
  "memoryAnchors": ["career_change_pattern", "fulfillment_seeking"]
}
```

## Configuration

### Personality Tuning

To adjust Bliss's base personality, modify `BASE_PERSONALITY` in `server/bliss-2.0-system-prompt.ts`:

```typescript
export const BASE_PERSONALITY: BlissPersonalityMatrix = {
  warmth: 90,      // Adjust 0-100
  directness: 55,  // Adjust 0-100
  philosophical: 80, // Adjust 0-100
  playfulness: 40   // Adjust 0-100
};
```

### Operating Mode Sensitivity

To adjust mode detection sensitivity, modify triggers in `determineOperatingMode()`:

```typescript
// Example: Make grounding mode more sensitive
if (
  context.emotionalTrajectory?.riskLevel === 'high' ||
  context.emotionalTrajectory?.valence !== undefined && context.emotionalTrajectory.valence < -0.5 // Changed from -0.7
) {
  return 'grounding';
}
```

## Testing

### Test Operating Modes

1. **Grounding Mode**: Send message with "I'm overwhelmed"
2. **Pattern Mode**: Send same type of message 3 times across different conversations
3. **Integration Mode**: Send message with "I finally understand why..."
4. **Creative Mode**: Send message with "What if I tried..."

### Test Personality Adaptation

1. **Contraction Phase**: Observe gentler, more supportive responses
2. **Expansion Phase**: Observe more playful, visionary responses
3. **High Emotional Risk**: Observe increased warmth, reduced directness

## Future Enhancements

Potential future additions to Bliss 2.0:

1. **Voice Interaction**: Emotional tone detection from voice, speaking pace analysis
2. **Somatic Awareness**: Body-based check-ins and tracking
3. **Community Intelligence**: Anonymized pattern sharing across users
4. **Multi-Modal Intelligence**: Integration of various input types
5. **Advanced Visualization**: Memory graphs, pattern networks, evolution timelines

## Troubleshooting

### Response Format Errors

If you see JSON parsing errors, ensure the LLM response includes all required fields:
- `message`
- `phase`
- `confidence`
- `mode`

### Operating Mode Not Changing

Check that analytics data is being passed to `determineOperatingMode()`:
- `emotionalTrajectory`
- `cognitiveDistortions`
- `contradictions`

### Personality Not Adapting

Verify that `adaptPersonality()` is receiving:
- Current growth phase
- Emotional state
- Conversation depth metric

## API Integration

### Using Bliss 2.0 in Your Code

```typescript
import { generateAdaptiveBlissResponse } from './server/ai-service';

const response = await generateAdaptiveBlissResponse(
  userMessage,
  userId,
  conversationHistory,
  userProfile
);

console.log(response.message); // The response text
console.log(response.mode); // Current operating mode
console.log(response.adaptationNotes); // How Bliss adapted
console.log(response.memoryAnchors); // Key insights to remember
```

### Accessing Operating Mode

```typescript
import { determineOperatingMode } from './server/bliss-2.0-system-prompt';

const mode = determineOperatingMode({
  userMessage: "I'm feeling overwhelmed",
  emotionalTrajectory: { trend: 'declining', riskLevel: 'high' },
  cognitiveDistortions: [],
  contradictions: []
});

// mode === 'grounding'
```

## Database Schema

No new database tables required for Bliss 2.0. The system leverages existing tables:

- `memories` - For memory recall
- `emotional_data_points` - For emotional trajectory
- `patterns` - For pattern detection
- `contradictions` - For contradiction awareness
- `beliefs` - For belief tracking
- `goals` - For goal intelligence

## Monitoring & Analytics

Track Bliss 2.0 performance by monitoring:

1. **Mode Distribution**: How often each mode is activated
2. **Personality Adaptation**: Average personality values per phase
3. **User Engagement**: Response to mode-specific approaches
4. **Memory Anchors**: Most frequently created anchors
5. **Adaptation Effectiveness**: User satisfaction by mode

---

**Implemented**: October 9, 2025  
**Version**: 2.0.0  
**Status**: Active & Fully Integrated
