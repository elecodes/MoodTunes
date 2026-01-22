# 2. Use React Suspense and Lazy Loading for Performance

Date: 2026-01-22

## Context
The `MoodTunes` application was originally a monolithic `App.jsx` file. 
As features grew (Favorites, Search, Voiceflow), the initial bundle size increased, potentially impacting First Contentful Paint (FCP) and Time to Interactive (TTI), although for a small app this is preemptive.
We wanted to ensure the application remains performant and scalable as we add more "heavy" components in the future.

## Options
1. **Monolithic Bundle**: Keep everything in one chunk. Simple, but not scalable.
2. **Route-based Splitting**: Split by URL routes. (Not applicable as MoodTunes is currently a single-page app without a router).
3. **Component-based Splitting (Lazy/Suspense)**: Split major logical sections (`Header`, `SongsList`, `Favorites`) into separate chunks loaded on demand or in parallel.

## Decision
We chose **Component-based Splitting** using `React.lazy` and `Suspense`.

We extracted `Header`, `SongsList`, and `Favorites` into their own files and lazy-loaded them in `App.jsx`.

## Consequences
### Positive
- **Better Performance**: Critical rendering path is optimized; secondary components can load in parallel.
- **Maintainability**: Enforced separation of concerns by breaking the God Object `App.jsx` into focused components.
- **Scalability**: New features can be added as lazy components without bloating the main bundle.

### Negative
- **Complexity**: Requires handling loading states (`Suspense` fallback).
- **Testing**: Tests must now account for asynchronous rendering (`waitFor`, `findBy`), as seen in the recent test refactoring.
