# Tomato Clock PWA - Project Context

## Project Overview

This is a Pomodoro Clock Progressive Web Application (PWA) built with React, TypeScript, and TailwindCSS. The application helps users implement the Pomodoro Technique for time management, which involves working in focused sessions (typically 25 minutes) followed by short breaks (typically 5 minutes).

Key features:
- Configurable session and break times
- Visual countdown timer with flip animations
- Persistent settings using localStorage
- Data tracking with IndexedDB (Dexie.js)
- Heatmap visualization of productivity
- Browser notifications for session/break transitions
- PWA capabilities for offline use and mobile installation
- Sentry integration for error tracking

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: React Scripts (Create React App)
- **Styling**: TailwindCSS with DaisyUI components
- **State Management**: React Context API and Hooks
- **Animations**: react-flip-toolkit for flip transitions
- **Database**: Dexie.js (IndexedDB wrapper) for data persistence
- **PWA Support**: Workbox for service worker generation
- **Error Tracking**: Sentry integration
- **Package Manager**: pnpm
- **Testing**: Jest with React Testing Library

## Project Structure

```
src/
├── assets/           # Static assets
├── components/       # React components
│   ├── Flip/         # Flip animation components
│   ├── HeatMap/      # Heatmap visualization
│   ├── NumberInput/  # Custom number input component
│   ├── PomodoroClock/# Main timer component
│   ├── SvgIcon/      # SVG icon components
│   └── Tooltip/      # Tooltip components
├── hooks/            # Custom React hooks
├── service/          # Business logic and services
│   ├── context.ts    # React context providers
│   ├── countdown.ts  # Countdown timer logic
│   ├── db.ts         # Database operations
│   ├── notification.ts # Browser notifications
│   └── index.ts      # Service exports
├── shared/           # Utility functions
└── ...
```

## Development Workflow

### Prerequisites
- Node.js >= 17.0.0
- pnpm >= 8.0.0

### Available Scripts

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start

# Build for production
pnpm build

# Run tests
pnpm test

# Build for Vercel deployment (includes Sentry sourcemaps)
pnpm run build:vercel
```

### Development Server
- Runs on http://localhost:3000
- Features hot reloading for code changes
- Includes error overlay in the browser

### Building for Production
- Outputs to `build/` directory
- Generates service worker with Workbox
- Optimizes assets for production

## Key Components and Architecture

### PomodoroClock Component
The main timer component that handles:
- Session and break state management
- Countdown timer logic
- User interactions (start, pause, reset, skip)
- Notification triggers
- Data persistence

### State Management
- Uses React Context API for global state (clock settings, heatmap data)
- Local component state for UI-specific values
- localStorage for persisting user settings
- IndexedDB (Dexie.js) for tracking session/break history

### Timer Logic
- Uses Web Workers for accurate countdown timing
- Separate threads for session and break periods
- Tracks actual vs expected time for analytics

### Data Persistence
- Settings stored in localStorage
- Session/break data stored in IndexedDB
- Heatmap data generated from historical data
- Data automatically refreshed on new days

### Notifications
- Browser notifications for session/break transitions
- Request permission flow with user guidance
- Silent mode option

### PWA Features
- Installable on mobile/desktop
- Works offline after initial load
- Background sync capabilities
- App-like experience on mobile devices

## Configuration Files

### package.json
- Defines dependencies and scripts
- Specifies Node.js and pnpm engine requirements
- Includes build and deployment scripts

### tailwind.config.js
- TailwindCSS configuration
- Custom width/spacing extensions
- DaisyUI plugin integration

### workbox-config.js
- Workbox configuration for PWA service worker
- Asset caching strategies
- Runtime caching for HTML/CSS/JS/PNG files

### tsconfig.json
- TypeScript compiler options
- React JSX transformation
- Strict type checking enabled

## Testing

The project uses Jest with React Testing Library for testing:
- Unit tests for components
- Integration tests for services
- Test coverage reporting

Run tests with:
```bash
pnpm test
```

## Deployment

The application is configured for deployment to Vercel with:
- Sentry sourcemap integration
- Optimized production build
- PWA capabilities maintained

## Development Conventions

- TypeScript for type safety
- Functional components with hooks
- TailwindCSS for styling
- Component composition over inheritance
- Separation of concerns (UI vs business logic)
- Error boundaries and proper error handling
- Accessibility considerations
