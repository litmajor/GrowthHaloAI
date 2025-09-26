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
  - AI service for OpenAI integration and Bliss responses
  - Growth tracking service for phase detection and analytics
  - Community service for member matching and discussions
  - Subscription service for tiered access management
  - Memory service for advanced conversational context

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
- **AI Integration**: OpenAI GPT models for Bliss AI companion responses and content analysis
- **Payment Processing**: Stripe integration for subscription management and billing
- **Database Hosting**: Neon PostgreSQL for serverless database operations
- **Email Services**: Planned integration for user communications and notifications
- **File Storage**: Planned integration for user-generated content and media assets

### Key Design Patterns
- **Service Layer Pattern**: Clear separation between API routes, business logic, and data access
- **Repository Pattern**: Storage abstraction layer supporting both development (in-memory) and production (PostgreSQL) modes
- **Event-Driven Architecture**: Planned implementation for real-time features and community interactions
- **Progressive Enhancement**: Features gracefully degrade based on subscription tier and technical capabilities
- **Philosophical UI Design**: Interface elements reflect the cyclical growth philosophy with breathing animations and halo-inspired components