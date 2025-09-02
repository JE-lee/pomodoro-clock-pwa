# Pomodoro clock
This is a PWA application about Pomodoro clock.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run lint`

Runs ESLint to check for code style issues and potential bugs.

### `npm run lint:fix`

Runs ESLint and automatically fixes issues that can be fixed.

## ESLint Configuration

This project uses [@antfu/eslint-config](https://github.com/antfu/eslint-config) with React and TypeScript support, specifically configured for browser environments. The configuration:

- Enables React and TypeScript support
- Disables Node.js specific rules for browser environment
- Includes custom rules for JSX formatting and React best practices
- Ignores build artifacts and node_modules

The configuration is defined in `eslint.config.mjs`.




