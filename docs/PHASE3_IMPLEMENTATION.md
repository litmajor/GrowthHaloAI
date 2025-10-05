
# Phase 3 Implementation Guide
## Causal Reasoning & Hypothesis Formation

**Status**: 🚧 In Progress  
**Timeline**: Months 7-10  
**Started**: January 2025

---

## Overview

Phase 3 introduces advanced causal reasoning capabilities that enable Bliss to:
1. **Identify cause-and-effect relationships** in user's life patterns
2. **Suggest actions based on past successes** 
3. **Find cross-domain analogies** to transfer solutions between life areas

---

## Architecture

### Database Schema

#### Causal Relationships Table
Tracks identified cause-and-effect patterns.

```typescript
- id: Primary key
- userId: Foreign key to users
- cause: The action/condition
- effect: The result/outcome
- confidence: 0-1 score (increases with observations)
- domain: work | relationships | health | creativity | wellbeing
- evidence: Array of conversation IDs
- firstObserved: When first detected
- lastConfirmed: Last time pattern was reaffirmed
- observationCount: Number of times observed
- contextFactors: Conditions under which pattern holds
```

#### Outcome Analyses Table
Records situations, approaches, and outcomes.

```typescript
- id: Primary key
- userId: Foreign key to users
- situation: Description of the situation
- approach: What the user did
- outcome: What happened
- outcomeQuality: positive | negative | mixed | neutral
- contributingFactors: Other factors involved
- timestamp: When it occurred
- growthPhase: User's phase at the time
- domain: Life area category
```

#### Domain Analogies Table
Stores cross-domain pattern transfers.

```typescript
- id: Primary key
- userId: Foreign key to users
- sourceId: Reference to original outcome
- sourceDomain: Original life area
- sourceSituation: Original situation
- sourceSolution: What worked
- targetDomain: New life area
- targetSituation: Current challenge
- analogyStrength: 0-1 similarity score
- transferability: 0-1 applicability score
- reasoning: Why they're similar
```

---

## Services

### Causal Reasoning Service

**Pattern Extraction**
- Analyzes conversations for cause-and-effect statements
- Builds confidence through repeated observations
- Requires 2+ observations before considering confirmed

**Action Suggestions**
- Finds past successes similar to current situation
- Recommends approaches that worked before
- Provides reasoning and confidence scores

**Analogical Thinking**
- Identifies structural similarities across domains
- Transfers solutions from one life area to another
- Example: Wedding planning strategies → Project management

---

## User Experience

### Pattern Discovery
Users can view their causal patterns at `/patterns`:
- "When you X, you tend to Y"
- Confidence levels and observation counts
- Categorized by life domain

### Smart Suggestions
Bliss can proactively suggest actions:
```
"I've noticed a pattern: When you prepare presentations 2-3 days in advance 
and do a practice run, you feel more confident and they go better. Maybe 
try that for tomorrow's presentation?"
```

### Cross-Domain Wisdom
```
"This work challenge reminds me of how you handled wedding planning—you 
created a 'non-negotiables' list and stayed flexible on everything else. 
Could that work here?"
```

---

## Integration Points

### Chat Enhancement
- Extract causal relationships from every conversation
- Detect when user describes outcomes
- Offer relevant past patterns when appropriate

### API Endpoints
```
GET /api/causal-patterns/:userId - Get user's patterns
POST /api/causal-patterns/suggest-actions - Get action suggestions
GET /api/causal-patterns/analogies/:userId - Find cross-domain wisdom
```

---

## Success Metrics

### Pattern Detection
- ✅ Extraction accuracy: >75%
- 🎯 Confidence calibration: Well-calibrated predictions
- 🎯 Pattern utility: >60% of patterns deemed helpful

### Action Suggestions
- 🎯 Relevance: >70% rated as applicable
- 🎯 Success rate: Track if suggested actions work
- 🎯 User adoption: >40% try suggested approaches

### Cross-Domain Transfer
- 🎯 Analogy quality: >65% found insightful
- 🎯 Transferability: >50% of analogies actionable
- 🎯 Novel insights: Users discover new perspectives

---

## Implementation Status

### ✅ Completed
- Database schema for causal relationships
- Causal reasoning service
- Pattern visualization component
- Basic API endpoints

### 🚧 In Progress
- Integration with chat interface
- Outcome tracking from conversations
- Analogical reasoning refinement

### 📋 Planned
- Approach effectiveness analysis
- Predictive pattern suggestions
- Pattern evolution dashboard

---

## Next Steps

1. Run database migration: `npm run db:push`
2. Test pattern extraction in conversations
3. Validate action suggestions with beta users
4. Refine analogical reasoning algorithm
5. Build outcome tracking UI

---

## Future Enhancements (Phase 4)

- Hypothesis testing framework
- Experimental action tracking
- Multi-user pattern insights
- Predictive modeling for outcomes
- Intervention timing optimization



## Phase 3.3: Hypothesis Formation

### Overview
The Hypothesis Formation system builds predictive models of user preferences, patterns, and growth styles. It generates testable hypotheses from accumulated data and refines them through ongoing conversations.

### Features Implemented

#### 1. Hypothesis Generation
- Analyzes user data (memories, outcomes, emotions, themes)
- Generates testable hypotheses across 5 categories:
  - Preferences: What users value, enjoy, avoid
  - Triggers: What energizes or depletes them
  - Strengths: Natural abilities and tendencies
  - Growth Style: How they learn and change
  - Communication: How they process and express

#### 2. Hypothesis Testing
- Tests hypotheses against new evidence
- Updates confidence levels based on supporting/contradicting data
- Marks hypotheses as confirmed when confidence > 80%

#### 3. Personality Insights
- Synthesizes confirmed hypotheses into actionable personality profiles
- Provides dimension-based insights:
  - Decision-making style
  - Stress response patterns
  - Growth orientation
  - Relationship dynamics
  - Communication preferences

#### 4. Predictive Outcomes
- Predicts likely outcomes based on past patterns
- Identifies potential pitfalls
- Suggests preventative actions
- Recommends alternative approaches that worked before

### API Endpoints

```
POST /api/hypotheses/generate/:userId - Generate new hypotheses
GET /api/hypotheses/:userId - Get user's hypotheses
POST /api/hypotheses/:hypothesisId/test - Test hypothesis with new evidence
GET /api/personality-insights/:userId - Get personality insights
POST /api/predict-outcome/:userId - Predict outcome of planned action
```

### UI Components

1. **PersonalityInsights** - Displays synthesized personality profile
2. **PredictiveOutcome** - Interactive outcome prediction tool
3. **Updated PatternsPage** - Tabbed interface for patterns, insights, and predictions

### Database Schema

- `user_hypotheses` - Stores testable hypotheses with evidence
- `personality_insights` - Stores synthesized personality dimensions
- `predictive_insights` - Stores outcome predictions

### Usage Example

```typescript
// Generate hypotheses for a user
const hypotheses = await hypothesisFormationService.generateHypotheses(userId);

// Test a hypothesis with new evidence
const result = await hypothesisFormationService.testHypothesis(
  hypothesisId,
  "User mentioned feeling energized after morning workout"
);

// Get personality insights
const insights = await hypothesisFormationService.getPersonalityInsights(userId);

// Predict outcome
const prediction = await hypothesisFormationService.predictOutcome(
  userId,
  "Work through the weekend",
  "Behind on project deadline"
);
```

### Next Steps

- Integrate hypothesis testing into main chat flow
- Add automatic hypothesis generation triggers
- Build dashboard showing hypothesis evolution over time
- Implement A/B testing for prediction accuracy
