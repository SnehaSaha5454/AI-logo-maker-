# AI Logo Maker

## Overview

This is a full-stack AI-powered logo generation web application that allows users to create custom logos through a guided wizard interface. The application features a warm, Indian-inspired design aesthetic with saffron-to-pink gradients and modern UI components. Users can specify logo requirements through a multi-step wizard, and the application generates logos using the Hugging Face Stable Diffusion API.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**UI Component Library**: Shadcn/ui (Radix UI primitives) with Tailwind CSS for styling. The design system uses a "new-york" style with custom color schemes supporting both light and dark modes. Components follow a consistent design language with elevation states, border treatments, and spacing primitives.

**State Management**: React hooks for local state management, with React Query (@tanstack/react-query) for server state management and caching. No global state management library is used; instead, localStorage is leveraged for persistence.

**Routing**: Wouter for lightweight client-side routing. The application has three main routes:
- `/` - Authentication page (login/register)
- `/app` - Main application page with logo wizard and history
- `/*` - 404 not found page

**Form Handling**: React Hook Form with Zod for schema validation. Forms use the zodResolver to integrate Zod schemas for type-safe validation.

**Design System**: Custom Tailwind configuration with CSS variables for theming. The color palette supports warm Indian aesthetics with saffron (#FF9933) and pink (#FF69B4) gradients. Typography uses Inter and Poppins fonts from Google Fonts.

### Backend Architecture

**Framework**: Express.js server running on Node.js with TypeScript.

**Development Setup**: The application uses Vite's middleware mode in development, allowing the Express server to serve the Vite-transformed frontend code with HMR support. In production, static files are served from the built `dist/public` directory.

**API Structure**: RESTful API with a single primary endpoint:
- `POST /api/generate-logo` - Accepts a prompt and returns a generated logo image URL

**Request/Response Flow**: 
1. Client sends logo generation request with combined prompt
2. Server forwards request to Hugging Face API
3. Image blob is received and converted to base64
4. Base64 image is returned to client for display and storage

**Error Handling**: Structured error responses with appropriate HTTP status codes. Special handling for 503 errors (model loading state) from Hugging Face API.

### Authentication & Authorization

**Authentication Mechanism**: Client-side only authentication using localStorage. No backend session management or database storage for user credentials.

**User Storage**: User data is stored in localStorage under the `users` key as a JSON array. Current session is maintained in `currentUser` key.

**Security Considerations**: This is a simplified authentication system suitable for demonstration purposes. Passwords are stored in plain text in localStorage, which is not production-ready. A production system would require:
- Server-side authentication with hashed passwords
- Secure session management
- HTTPS-only cookie storage
- CSRF protection

### Data Storage

**Primary Storage**: Browser localStorage for all persistent data:
- User accounts stored in `users` array
- Current session in `currentUser` object  
- Per-user logo history in `logoHistory_{userId}` keys

**Database Configuration**: The application includes Drizzle ORM setup with PostgreSQL configuration (via @neondatabase/serverless), but this is not currently utilized. The schema and migrations are defined but the in-memory storage implementation is used instead.

**Data Models**:
- User: id, email, username, password
- LogoHistoryItem: id, userId, imageUrl, prompt, name, description, color, style, designIdea, createdAt

**Migration Path**: The architecture supports future migration to PostgreSQL by replacing the MemStorage implementation with database queries while maintaining the same IStorage interface.

### Logo Generation Workflow

**Multi-Step Wizard**: Progressive disclosure pattern with 6 steps:
1. Logo name input
2. Description/vision textarea
3. Color palette selection
4. Logo style selection (9 preset options)
5. Design idea selection (6 options + AI auto-select)
6. Generation and display

**Prompt Engineering**: The final prompt combines all wizard inputs into a structured string that guides the AI model. The prompt includes the logo name, description, color preference, style directive, and design idea.

**Image Handling**: Generated images are received as blobs from Hugging Face API, converted to base64 data URLs, and stored directly in localStorage as part of the logo history.

## External Dependencies

### Third-Party APIs

**Hugging Face Inference API**: Primary integration for AI logo generation.
- Model: `stabilityai/stable-diffusion-xl-base-1.0`
- Authentication: Bearer token via `HUGGINGFACE_API_KEY` environment variable
- Parameters: 30 inference steps, 7.5 guidance scale
- Rate Limiting: Model may return 503 when loading (cold start)

### UI Libraries

**Radix UI**: Comprehensive set of unstyled, accessible component primitives including dialogs, popovers, dropdowns, tooltips, accordions, and form controls.

**Tailwind CSS**: Utility-first CSS framework with custom configuration for theming and design tokens.

**Class Variance Authority (CVA)**: Pattern for creating variant-based component APIs.

**Lucide React**: Icon library for consistent iconography.

### Development Tools

**Vite**: Fast build tool and dev server with HMR support. Custom plugins include:
- @replit/vite-plugin-runtime-error-modal
- @replit/vite-plugin-cartographer (dev only)
- @replit/vite-plugin-dev-banner (dev only)

**TypeScript**: Strict type checking with path aliases configured for clean imports (@/, @shared/, @assets/).

**ESBuild**: Used for production server bundle compilation.

### Potential Database Integration

The application is configured for PostgreSQL via:
- Drizzle ORM for type-safe database queries
- @neondatabase/serverless for serverless Postgres connections
- Migration system ready via `drizzle-kit push`

The `DATABASE_URL` environment variable is expected but not currently required since in-memory storage is used.