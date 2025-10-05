
# Phase 4.2: Dormant Concept Reactivation

## Overview
Dormant Concept Reactivation identifies forgotten interests, skills, and values that haven't been mentioned in conversations for a while, then resurfaces them when they become relevant again.

## Features

### 1. Dormant Concept Identification
- Automatically identifies topics mentioned 3+ times but not in 60+ days
- Categorizes concepts: value, interest, skill, dream, insight, approach
- Tracks emotional valence and context

### 2. Relevance Detection
- Uses AI to determine when a dormant concept becomes relevant
- Scores relevance (0-1) based on current situation
- Provides natural reactivation prompts

### 3. Creative Concept Bridging
- Connects distant, unrelated concepts from user's life
- Generates novel insights through synthesis
- Provides practical applications for challenges

## API Endpoints

```
GET /api/dormant-concepts/:userId - Get user's dormant concepts
POST /api/dormant-concepts/check-relevance - Check if concepts are relevant now
POST /api/creative-insights/:userId - Generate creative concept bridges
```

## UI Components

1. **DormantConcepts** - Display forgotten interests with context
2. **CreativeInsights** - Generate and display concept bridges
3. **IdeasPage** - Unified interface with tabs for all idea features

## Usage Examples

### Dormant Concept Reactivation
```typescript
// When user expresses a challenge
const dormant = await dormantConceptService.identifyDormantConcepts(userId);
const relevant = await dormantConceptService.checkRelevance(
  dormant,
  currentMessage,
  currentContext
);

if (relevant.length > 0) {
  const message = dormantConceptService.formatReactivation(relevant[0]);
  // Include in AI response
}
```

### Creative Concept Bridging
```typescript
// Generate novel insights
const bridges = await dormantConceptService.bridgeDistantConcepts(
  userId,
  "I'm trying to make meetings more engaging"
);

// Returns combinations like:
// - "improv comedy" + "tea ceremony" = structured spontaneity
```

## Implementation Notes

- Uses OpenAI embeddings to measure concept distance
- Cosine similarity threshold of 0.7 for "distant" concepts
- Reactivation happens automatically during conversations
- Manual exploration available via UI

## Next Steps

- Integrate with main chat flow for automatic reactivation
- Add user feedback on reactivation helpfulness
- Build reactivation history tracking
- Implement concept evolution over time
