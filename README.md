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

## License

MIT
