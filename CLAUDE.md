# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Pomodoro Clock Progressive Web App (PWA) built with React, TypeScript, and Tailwind CSS. The application helps users implement the Pomodoro Technique for time management, featuring session timers, break timers, and a heatmap visualization of productivity.

## Architecture

- **Framework**: React with TypeScript
- **State Management**: React Context API with useReducer for clock settings and useState for other states
- **Database**: Dexie.js (IndexedDB wrapper) for local data storage
- **Styling**: Tailwind CSS with DaisyUI components
- **PWA**: Workbox for service worker implementation
- **Error Tracking**: Sentry for error monitoring

### Key Components

1. **App.tsx**: Main application component managing global state and layout
2. **PomodoroClock**: Core timer component handling session/break cycles
3. **HeatMap**: Visualization component showing productivity data over time
4. **Context Providers**: ClockContext for settings, HeatMapContext for data visualization

### Data Flow

1. **Settings**: Managed through React Context with localStorage persistence
2. **Session Tracking**: Data stored in IndexedDB via Dexie
3. **Heatmap Data**: Aggregated from session data for visualization

## Development Commands

### Start Development Server
```bash
npm start
```
Runs the app in development mode on [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
```
Builds the app for production with Workbox service worker generation

### Run Tests
```bash
npm test
```
Launches the test runner in interactive watch mode

### Linting
The project uses ESLint with TypeScript configuration. Linting is integrated with the build process.

## Key Directories

- `src/`: Main source code
- `src/components/`: React components
- `src/service/`: Business logic, database operations, and context providers
- `src/shared/`: Utility functions
- `public/`: Static assets and PWA manifest
- use pnpm