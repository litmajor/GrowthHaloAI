
# Phase 4.5: Wisdom Library (Synthesized Insights Repository)

## Overview
The Wisdom Library automatically extracts, organizes, and surfaces the user's hard-won insights and realizations from conversations, creating a living repository of personal wisdom.

## Features

### 1. Automatic Wisdom Extraction
- AI detects breakthrough moments and insights in conversations
- Identifies different types of wisdom (self-knowledge, relationship wisdom, life philosophy, etc.)
- Filters out casual observations to focus on meaningful realizations
- Assigns significance levels (minor, moderate, major)

### 2. Wisdom Organization
- Groups related insights into thematic collections
- Tracks how wisdom themes evolve over time
- Links related wisdom entries automatically
- Categorizes by domain (self-knowledge, relationships, practical strategies, etc.)

### 3. Contextual Retrieval
- Surfaces relevant wisdom when user faces similar situations
- References user's own insights during conversations
- Tracks how often each wisdom is referenced (validates importance)
- Shows applicable contexts for each insight

### 4. Confidence Tracking
- Monitors how deeply user believes each insight (grows over time)
- Reflects evolving understanding through confidence meters
- Highlights most trusted wisdom

## Data Model

### Wisdom Entry
```typescript
{
  id: number,
  userId: string | number,
  insight: string,
  category: string,
  dateRealized: Date,
  sourceConversationId: string,
  contextWhenLearned: string,
  timesReferenced: number,
  applicability: string[],
  relatedWisdom: number[],
  confidence: number,
  significance: string
}
```

### Wisdom Collection
```typescript
{
  theme: string,
  entries: WisdomEntry[],
  evolution: string
}
```

## API Endpoints

```
GET  /api/wisdom/library/:userId - Get complete wisdom library
POST /api/wisdom/extract - Extract wisdom from a message
POST /api/wisdom/applicable - Find applicable wisdom for current situation
```

## UI Components

**WisdomLibrary** - Main interface showing:
- Total wisdom count
- Most referenced insights
- Recent breakthroughs
- Thematic collections with expansion
- Confidence meters for each insight
- Context and applicability information

## Integration Points

### With Chat Service
- Automatically extracts wisdom from user messages
- Surfaces relevant wisdom during conversations
- References user's own insights in responses

### With Growth Phase
- Wisdom extraction adapts to current phase
- Phase-specific wisdom highlighted

### With Memory System
- Wisdom entries linked to conversation context
- Cross-references with other memory features

## Usage Examples

### Automatic Extraction
When user says: "I'm realizing that my resentment is always a sign I need to speak up"
- System extracts as wisdom about boundaries/communication
- Categorizes under "self-knowledge"
- Stores with context and applicability

### Contextual Surfacing
When user says: "I don't know if I should confront my coworker"
- System finds relevant wisdom about conflict and boundaries
- Presents user's own insights from past experiences
- References how many times this wisdom has helped before

## Success Metrics

- 70%+ of users find Wisdom Library personally meaningful
- 50%+ reference their own wisdom regularly
- Average of 10+ wisdom entries per active user per month
- High re-reference rate (wisdom used multiple times)

## Implementation Notes

- Wisdom extraction runs on every user message
- Collections rebuilt periodically as new wisdom accumulates
- Confidence scores update based on how often wisdom is referenced
- Related wisdom linked using semantic similarity

## Future Enhancements

- Wisdom sharing with community (optional)
- Wisdom evolution tracking over years
- Audio/visual wisdom capture
- Wisdom reminder notifications
- Export wisdom as personal philosophy document
