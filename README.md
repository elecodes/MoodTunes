# 🎵 MoodTunes

**MoodTunes** is a React-based music discovery application integrated with a powerful **Voiceflow AI Agent**.

Users can discover music either by searching manually or by chatting with the AI agent, which understands moods and suggests personalized playlists.

## Features

-   **AI Mood Assistant**: Chat with the integrated Voiceflow agent (powered by LLMs) to get music recommendations based on how you feel.
-   **Smart Integration**: When the agent suggests songs, they automatically appear in the app's result list for instant playback.
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
-   **Coverage**: The test suite covers:
    -   Component rendering (App, Footer).
    -   Search functionality (mocked API cycles).
    -   Security checks (input sanitization, URL encoding).

### Security Measures (OWASP Top 10)
-   **Content Security Policy (CSP)**: Implemented in `index.html` to restrict resource sources.
-   **Input Sanitization**: Search queries are truncated and encoded to prevent XSS and Injection attacks.
-   **Dependency Audits**: Regular `npm audit` checks are performed.

## License

MIT
