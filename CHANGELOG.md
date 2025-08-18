# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added

- Initial release of Statio library
- `GlobalStore` class for state management
- `useStatio` hook for basic state management
- `useStatioSelector` hook for selective state updates
- Middleware system with built-in middlewares:
  - `persistStatio` for localStorage persistence
  - `loggerStatio` for development logging
  - `devStatio` for Redux DevTools integration
  - `effectStatio` for side effects
  - `validateStatio` for state validation
- Custom HashMap and Set implementations for performance
- Batch updates support
- TypeScript support with full type definitions

### Features

- Lightweight and performant state management
- React 18+ compatibility
- Immer integration for immutable updates
- Middleware architecture for extensibility
- Automatic subscription management
- Memory leak prevention
