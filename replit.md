# MusicsForYou

## Overview

MusicsForYou is both a web application and native mobile app that enables users to generate personalized music using AI, with an optional feature to have vocals sung by a cloned version of their own voice. The platform provides phone-based authentication, a credit system for music generation, and a library to manage generated tracks.

## User Preferences

Preferred communication style: Simple, everyday language.

## Mobile App (React Native + Expo)

The project includes a complete native mobile app located in the `mobile/` directory.

### Mobile App Structure
- **Framework**: React Native with Expo SDK 52
- **Routing**: Expo Router (file-based routing)
- **Audio**: Expo AV for recording and playback
- **Storage**: Expo SecureStore for session persistence
- **Styling**: React Native StyleSheet with dark theme

### Running the Mobile App
1. Navigate to `mobile/` folder
2. Run `npm install` to install dependencies
3. Run `npx expo start` to start development server
4. Scan QR code with Expo Go app on your phone

### Publishing to App Stores
- **iOS**: Requires Apple Developer Program ($99/year)
- **Android**: Requires Google Play Developer account ($25 one-time)
- Use `npx expo build` or EAS Build for production builds

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, React Context for auth state
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Build Tool**: Vite with custom plugins for Replit integration and meta image handling
- **Design**: Dark mode by default with a music-themed vibrant design, mobile-first layout

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON APIs under `/api` prefix
- **Session Management**: express-session with session-based authentication
- **File Uploads**: Multer for handling audio file uploads (voice samples)

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Tables**:
  - `users`: User accounts with phone, credits, and voice settings
  - `songs`: Generated music tracks with status tracking
  - `voiceSamples`: User voice recordings for custom voice cloning
- **Migrations**: Drizzle Kit with `db:push` command

### Authentication
- Phone number-based login with verification codes
- Session cookies stored server-side
- Protected routes via `requireAuth` middleware on backend
- Client-side route protection via `ProtectedRoute` component

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared code (`shared/`)
- **Path Aliases**: `@/` for client source, `@shared/` for shared code
- **Schema Validation**: Zod schemas generated from Drizzle tables using drizzle-zod
- **API Client**: Centralized API module in `client/src/lib/api.ts`

## External Dependencies

### Database
- PostgreSQL (required, connection via `DATABASE_URL` environment variable)
- Drizzle ORM for type-safe database operations

### Authentication
- Express-session for session management
- connect-pg-simple for PostgreSQL session storage (available in dependencies)

### UI/Frontend
- Radix UI primitives for accessible components
- Lucide React for icons
- Embla Carousel for carousel components
- date-fns for date formatting

### Planned Integrations (Placeholder)
- OpenAI API for voice cloning (`/v1/audio/voice` endpoint - marked as pending in codebase)
- AI music generation backend service
- External payment processing (Stripe Checkout or similar)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (auto-configured by Replit)
- `SESSION_SECRET`: Secret key for session encryption (REQUIRED in production)
- `JWT_SECRET`: Secret key for mobile JWT authentication (REQUIRED in production)

### Production Security
- Both `SESSION_SECRET` and `JWT_SECRET` must be set in production
- Server will refuse to start without these secrets
- Use strong, random secrets (32+ characters recommended)
- JWT tokens expire after 7 days
- Token revocation on logout ensures immediate access removal