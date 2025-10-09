# Bliss AI - Growth Halo Platform

## Overview

Bliss AI is a comprehensive personal development platform built around the "Growth Halo" philosophy - viewing growth as cyclical rather than linear through phases of expansion, contraction, and renewal. The platform combines an AI companion named Bliss with community features, analytics, and personalized content to support authentic personal transformation.

The application is a full-stack TypeScript web application with a React frontend, Express backend, and PostgreSQL database using Drizzle ORM. It features real-time chat with an AI agent, growth tracking analytics, community circles, content management, and subscription-based monetization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system based on Growth Halo philosophy
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Animation**: Framer Motion for smooth, philosophical UI transitions

### Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Structure**: Modular service architecture with separate concerns:
  - **Bliss 2.0 AI Service**: Enhanced AI companion with personality adaptation, behavioral modes, and GPT-5 integration
  - Growth tracking service for phase detection and analytics
  - Community service for member matching and discussions
  - Subscription service for tiered access management
  - Memory service for advanced conversational context with associative recall
  - Contradiction detection and belief revision tracking
  - Causal reasoning and hypothesis formation
  - Wisdom library and meta-memory systems

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Design**: Relational structure supporting:
  - User profiles with growth journey tracking
  - Phase history and energy pattern analytics
  - Encrypted journal entries with AI insights
  - Community circles and member relationships
  - Subscription management and usage tracking
- **Migration Strategy**: Drizzle Kit for schema versioning and deployment

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL store
- **User System**: Username/password authentication with secure hashing
- **Authorization Levels**: Tiered subscription system (Free, Growth, Transformation, Facilitator)
- **API Protection**: Middleware-based route protection and usage limiting

### External Dependencies
- **AI Integration**: OpenAI GPT-5 (released August 2025) for Bliss 2.0 AI companion with advanced personality adaptation and behavioral modes
- **Payment Processing**: Stripe integration for subscription management and billing
- **Database Hosting**: Neon PostgreSQL for serverless database operations with vector embeddings support
- **Email Services**: Planned integration for user communications and notifications
- **File Storage**: Planned integration for user-generated content and media assets

### Key Design Patterns
- **Service Layer Pattern**: Clear separation between API routes, business logic, and data access
- **Repository Pattern**: Storage abstraction layer supporting both development (in-memory) and production (PostgreSQL) modes
- **Event-Driven Architecture**: Planned implementation for real-time features and community interactions
- **Progressive Enhancement**: Features gracefully degrade based on subscription tier and technical capabilities
- **Philosophical UI Design**: Interface elements reflect the cyclical growth philosophy with breathing animations and halo-inspired components

## Bliss 2.0 - AI Companion System

### Overview
Bliss 2.0 is an advanced AI companion featuring memory consciousness, dynamic personality adaptation, and five behavioral modes. Implemented October 9, 2025, it represents a significant evolution from chat assistant to conscious companion.

### Core Capabilities

#### 1. Memory as Consciousness
- **Semantic Memory**: Tracks concepts, patterns, and transformations across time
- **Associative Recall**: Multi-pathway memory retrieval (semantic, temporal, emotional, thematic, phase-based)
- **Meta-Memory**: Tracks how beliefs evolve and ideas mature
- **Memory Anchors**: Creates key insights for future recall

#### 2. Dynamic Personality Matrix
Bliss adapts personality across four dimensions based on context:
- **Warmth** (0-100%): Emotional supportiveness level
- **Directness** (0-100%): Straightforward vs gentle communication
- **Philosophical Depth** (0-100%): Abstract wisdom vs practical guidance
- **Playfulness** (0-100%): Light-hearted vs serious tone

**Base Settings**: Warmth 90%, Directness 55%, Philosophical 80%, Playfulness 40%

**Adaptive Rules**:
- Contraction Phase: More supportive, gentler, more practical, more grounded
- Expansion Phase: More playful and visionary
- Declining Emotional State: More gentle, warm, and supportive
- Deep Relationship: More direct and honest

#### 3. Five Behavioral Modes

**REFLECTION MODE** (Default)
- Purpose: Help users understand themselves
- Approach: Ask more than tell, mirror patterns, explore meaning
- Trigger: Standard conversations

**GROUNDING MODE**
- Purpose: Stabilize during overwhelm or distress
- Approach: Present-focused, somatic awareness, simple language
- Triggers: High emotional risk, anxiety indicators, overwhelm signals

**PATTERN AWARENESS MODE**
- Purpose: Gently surface recurring patterns
- Approach: Use user's words, connect dots with curiosity, no judgment
- Triggers: Detected patterns, contradictions, cognitive distortions

**INTEGRATION MODE**
- Purpose: Celebrate and anchor breakthroughs
- Approach: Synthesizing, reflective, future-orienting
- Triggers: Breakthrough moments, new clarity, realizations

**CREATIVE FLOW MODE**
- Purpose: Support ideation and creation
- Approach: Generative, associative, playful, expansive
- Triggers: Brainstorming, imagination, creative sessions

### Technical Stack

**Core Files**:
- `server/bliss-2.0-system-prompt.ts` - System prompt, personality matrix, mode logic
- `server/ai-service.ts` - Integration, response generation, analytics
- `server/enhanced-memory-service.ts` - Memory extraction and storage
- `server/associative-recall-service.ts` - Multi-pathway memory retrieval

**AI Model**: GPT-5 (released August 7, 2025)
- Parameters: max_completion_tokens: 1200
- Temperature: Default (1.0)

**Response Format**:
```typescript
{
  message: string;
  phase: "expansion" | "contraction" | "renewal";
  confidence: number;
  mode: "reflection" | "grounding" | "pattern_awareness" | "integration" | "creative_flow";
  adaptationNotes: string;
  suggestedFollowUp: string;
  memoryAnchors: string[];
}
```

### Integration with Existing Features

Bliss 2.0 builds upon all previous implementations:
- **Phase 1**: Enhanced memory, emotional tracking, theme detection
- **Phase 2**: Associative recall, contradiction detection, belief revision
- **Phase 3**: Causal reasoning, hypothesis formation, outcome analysis
- **Phase 4**: Wisdom library, growth phase prediction, idea evolution

### Example Use Cases

**Overwhelm Detection**: User says "everything is too much" → Grounding mode activates → Present-focused stabilization

**Pattern Recognition**: User mentions career change 3x → Pattern Awareness mode → Gentle exploration of deeper seeking

**Breakthrough Moment**: User says "I finally understand" → Integration mode → Celebratory synthesis and anchoring

**Creative Session**: User says "what if I tried" → Creative Flow mode → Generative idea building

### Documentation
- Complete integration guide: `docs/BLISS_2.0_INTEGRATION.md`
- Original specifications: `docs/Bliss_2.0.md`
- Phase implementations: `docs/PHASE[1-4]_IMPLEMENTATION.md`

### Future Enhancements
- Voice interaction with emotional tone detection
- Somatic awareness tracking
- Community intelligence (anonymized patterns)
- Multi-modal input integration
- Advanced visualization (memory graphs, evolution timelines)

## Admin Dashboard & Analytics System

### Overview
Comprehensive admin dashboard for platform management and analytics, implemented October 9, 2025. Provides secure access to revenue metrics, subscription analytics, user management, and system monitoring.

### Admin Authentication
- **Invite-Code Protected Registration**: Admin accounts require a valid invite code to register
- **Secure Login System**: Separate admin login flow with email/password authentication
- **Role-Based Access**: Admin middleware protects all admin endpoints
- **Session Management**: Admin sessions integrated with existing authentication system

### Admin Pages
- **Admin Login** (`/admin/login`): Secure admin authentication portal
- **Admin Registration** (`/admin/register`): Invite-code protected account creation
- **Digital Twin Labs** (`/admin/digital-twin-labs`): Main admin dashboard with 6-tab interface

### Digital Twin Labs Dashboard

**Tab 1: Users**
- Active user count and growth metrics
- User distribution by subscription tier
- Recent user activity and engagement stats

**Tab 2: Analytics**
- Platform-wide usage analytics
- User engagement metrics
- Growth trends and patterns

**Tab 3: Revenue** (New Enhancement)
- **Total Revenue**: All-time subscription revenue tracking
- **MRR (Monthly Recurring Revenue)**: Current monthly recurring revenue
- **ARR (Annual Recurring Revenue)**: Annualized revenue projections
- **Active Subscriptions**: Real-time active subscription count
- **Subscription Growth**: New vs cancelled subscriptions tracking
- **Plan Breakdown**: Revenue distribution across subscription tiers
- **Time Range Filters**: Week, Month, Year view options
- **Subscription Statistics**: Total, active, cancelled, and expired counts

**Tab 4: Twins**
- Digital twin management and monitoring
- Twin creation and lifecycle tracking

**Tab 5: Perception**
- Perception system analytics
- Pattern recognition insights

**Tab 6: Experiments**
- Platform experiments and A/B testing
- Feature rollout management

### Revenue Analytics Implementation

**Backend Services** (`server/admin-service.ts`):
- `getRevenueOverview(timeRange)`: Aggregates revenue metrics by time period
- `getSubscriptionStats()`: Computes subscription statistics and trends
- Revenue calculation across all payment records
- Subscription lifecycle tracking (new, active, cancelled, expired)

**Data Schema** (`shared/admin-schema.ts`):
- **revenueMetrics**: Tracks aggregated revenue data
  - Total revenue, MRR, ARR calculations
  - Subscription growth metrics
  - Time-based revenue trends
- **subscriptionStats**: Subscription lifecycle statistics
  - Total, active, cancelled, expired counts
  - Plan-based distribution

**API Endpoints** (`server/admin-routes.ts`):
- `GET /api/admin/analytics/revenue`: Revenue overview with time range
- `GET /api/admin/analytics/subscriptions/stats`: Subscription statistics
- All endpoints protected by `requireAdmin` middleware

### Security Features
- Invite-code validation for admin registration
- Password strength requirements (minimum 8 characters)
- Admin-only route protection via middleware
- Secure session management
- No sidebar on admin routes for focused experience

### Technical Architecture
- **Frontend**: React with TypeScript, TanStack Query for data fetching
- **Backend**: Express REST API with role-based middleware
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Shadcn/ui with custom admin styling
- **Routing**: Wouter with dedicated admin route namespace