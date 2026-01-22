# 🎵 MoodTunes

**MoodTunes** is a React-based music discovery application integrated with a powerful **Voiceflow AI Agent**.

Users can discover music either by searching manually or by chatting with the AI agent, which understands moods and suggests personalized playlists.

## Features

-   **AI Mood Assistant**: Chat with the integrated Voiceflow agent (powered by LLMs) to get music recommendations based on how you feel.
-   **Mood-Based Recommendations**: The AI agent suggests songs and artists tailored to your current emotional state.
-   **Search Autocomplete**: Real-time suggestions as you type, helping you find artists and songs faster.
-   **Advanced Accessibility (WCAG 2.1 AA)**:
    -   Full Keyboard Navigation (Arrow keys, Enter, Escape)
    -   Screen Reader support (ARIA labels, Roles, Linked Labels)
    -   High Contrast text and Focus indicators
-   **UX Heuristics (Nielsen)**:
    -   **Undo**: Reversible actions for Favoriting/Unfavoriting (Toast Notification).
    -   **Visibility**: Skeleton screens for perceived performance.
    -   **Control**: Clear "Search Music" actions and easy reset.
-   **iTunes API**: Real-time music search and 30-second previews.
-   **Favorites**: Save your favorite tracks locally.
-   **Responsive Design**: A clean, modern UI that works on desktop and mobile.

## Technology Stack

-   **Frontend**: React, Vite
-   **AI**: Voiceflow (Official Widget + Custom Bridge)
-   **API**: iTunes Search API
-   **Styling**: Pure CSS

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```

3.  **Open in Browser**:
    Navigate to `http://localhost:5173`.

## Voiceflow Integration

The app uses the **official Voiceflow Widget** with a custom "Bridge" extension.
-   **Agent**: Sends a hidden `search_terms` payload with suggested songs.
-   **Widget Extension**: Intercepts this payload in `index.html`.
-   **App Bridge**: Passing the data to `window.handleVoiceflowMusic`, triggering the main app's search function.

## Testing & Security

### Automated Testing
This project uses **Vitest** and **React Testing Library** for unit and integration testing.

-   **Run Tests**: `npm run test`
-   **Coverage**: `npm run test:coverage:check`
    -   **Strategy**: "Honest Coverage 100/80/0"
        -   **CORE** (`src/helpers`): 100% Coverage enforced.
        -   **GLOBAL**: 80% Coverage enforced.
        -   **INFRA**: 0% (Config files excluded).
    -   **Quality Gate**: A Husky `pre-push` hook blocks code that does not meet these thresholds.
-   **Scope**: The test suite covers:
    -   Component rendering (App, Footer).
    -   Search functionality (mocked API cycles).
    -   Security checks (input sanitization, URL encoding).

### Security Measures (OWASP Top 10)
-   **Content Security Policy (CSP)**: Implemented in `index.html` to restrict resource sources.
-   **Input Sanitization**: Search queries are truncated and encoded to prevent XSS and Injection attacks.
-   **Dependency Audits**: Regular `npm audit` checks are performed.

## License

MIT
