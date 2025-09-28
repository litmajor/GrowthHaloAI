
# Bliss AI Growth Halo Platform - Features Documentation

## Core Features Overview

### 🎯 Goal Intelligence System
**Status**: ✅ Implemented
- **Automatic Goal Detection**: AI analyzes conversations to detect implicit goals
- **Progress Tracking**: Intelligent monitoring of goal advancement through conversations
- **Goal Relationships**: Identifies how goals support, conflict, or depend on each other
- **Momentum Analysis**: Tracks acceleration, steady progress, slowing, or stalled goals
- **Categories**: Career, Health, Learning, Relationships, Financial, Personal, Spiritual, Creative

**Pages**: `/goals` - View and manage all goals
**Integration**: Dashboard shows goal insights and progress summaries

### 🧠 Advanced Memory & Recall
**Status**: ✅ Implemented
- **Associative Recall System**: Surfaces relevant past information contextually
- **Memory Clustering**: Groups related memories and conversations
- **Pattern Recognition**: Identifies recurring themes and insights
- **Memory Timeline**: Visual representation of past conversations and insights

**Access**: Dashboard → Memory tab, integrated in chat interface

### 🔄 Growth Halo Phases
**Status**: ✅ Implemented
- **Phase Detection**: Automatically identifies Expansion, Contraction, and Renewal phases
- **Visual Indicators**: Halo progress rings and phase-specific UI adaptations
- **Phase-Aware Responses**: AI adapts communication style based on current phase
- **Confidence Tracking**: Measures certainty of phase detection

**Locations**: Dashboard main view, navigation sidebar

### 💬 Intelligent Chat Interface
**Status**: ✅ Implemented
- **Adaptive Responses**: AI personality changes based on user's growth phase
- **Contradiction Detection**: Identifies cognitive distortions and limiting beliefs
- **Crisis Support**: Gentle intervention when difficult topics arise
- **Chat History**: Searchable archive of all conversations

**Access**: `/chat` - Main conversation interface

### 📊 Analytics & Insights
**Status**: ✅ Implemented
- **Growth Analytics**: Visual charts of progress over time
- **Energy Mapping**: Tracks mental, physical, emotional, and spiritual energy
- **Weekly Insights**: AI-generated observations about growth patterns
- **Values Alignment**: Tracks decision-making against core values

**Pages**: `/analytics`, Dashboard analytics tab

### 🌟 Values Compass
**Status**: ✅ Implemented
- **Values Assessment**: Interactive tool to identify core values
- **Decision Support**: Framework for value-aligned choices
- **Values Tracking**: Monitor how well decisions align with stated values

**Access**: `/compass` or `/values`

### 📝 Growth Journal
**Status**: ✅ Implemented
- **Structured Reflection**: Guided journaling prompts
- **AI Insights**: Analysis of journal entries for patterns
- **Privacy Controls**: Secure storage of personal reflections

**Access**: `/journal`

### 🎯 Intentions Setting
**Status**: ✅ Implemented
- **Goal Alignment**: Connect daily intentions with larger goals
- **Progress Tracking**: Monitor intention fulfillment
- **Phase-Appropriate Prompts**: Suggestions based on current growth phase

**Access**: `/intentions`

### 👥 Growth Circles (Community)
**Status**: ✅ Basic Implementation
- **Anonymous Sharing**: Share insights without personal details
- **Themed Discussions**: Topic-based growth conversations
- **Supportive Environment**: Moderated community spaces

**Access**: `/community`

### 📅 Daily Check-ins
**Status**: ✅ Implemented
- **Energy Assessment**: Quick daily energy level tracking
- **Mood Monitoring**: Track emotional states over time
- **Reflection Prompts**: Brief daily growth questions

**Access**: `/checkin`

### 💳 Subscription Management
**Status**: ✅ Implemented
- **Tier Management**: Free, Pro, and Premium tiers
- **Feature Access Control**: Gated features based on subscription
- **Billing Integration**: Stripe payment processing

**Access**: `/subscription`

## Technical Architecture

### Frontend (React + TypeScript)
- **Routing**: Wouter for lightweight routing
- **State Management**: TanStack Query for server state
- **UI Components**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion for smooth transitions
- **Theme Support**: Light/Dark mode with system preference

### Backend (Node.js + Express)
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-5 for advanced reasoning
- **Authentication**: JWT-based user sessions
- **Real-time**: WebSocket support for live features

### Key Services
- **AI Service**: Core Bliss AI personality and responses
- **Goal Intelligence**: Automatic goal detection and tracking
- **Growth Service**: Phase detection and growth analytics
- **Memory Service**: Advanced recall and pattern recognition
- **Analytics Service**: Data visualization and insights

## User Journey

### First-Time User
1. **Landing Page** (`/`) - Introduction to Growth Halo philosophy
2. **Registration** (`/register`) - Account creation
3. **Values Assessment** (`/compass`) - Core values identification
4. **First Chat** (`/chat`) - Begin relationship with Bliss AI
5. **Dashboard** (`/dashboard`) - Growth overview and phase detection

### Daily Usage
1. **Check-in** (`/checkin`) - Daily energy and mood assessment
2. **Chat Sessions** (`/chat`) - Ongoing conversations with Bliss
3. **Goal Review** (`/goals`) - Monitor progress and relationships
4. **Journal** (`/journal`) - Deep reflection and insights

### Weekly/Monthly
1. **Analytics Review** (`/analytics`) - Growth trends and patterns
2. **Intentions Setting** (`/intentions`) - Align goals with values
3. **Community Engagement** (`/community`) - Share and learn from others

## API Endpoints

### Core Chat
- `POST /api/bliss/adaptive-chat` - Main AI conversation
- `GET /api/chat-history/:userId` - Retrieve conversation history

### Goals Management
- `GET /api/goals/:userId` - User's goals
- `POST /api/goals/detect` - AI goal detection from conversation
- `PUT /api/goals/:goalId/progress` - Update goal progress

### Growth Tracking
- `GET /api/user/:userId/growth` - Growth phase and analytics
- `POST /api/checkin` - Daily check-in submission
- `GET /api/analytics/:userId` - Detailed analytics data

### Memory System
- `GET /api/memory/:userId/insights` - Memory-based insights
- `POST /api/memory/store` - Store significant memories

## Configuration

### Environment Variables
```
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key (for subscriptions)
```

### Feature Flags
- Memory system: Always enabled
- Goal intelligence: Always enabled
- Community features: Enabled for Pro+ users
- Advanced analytics: Enabled for Premium users
