# Memory Circle

**A private, offline-first journaling application for mindfulness and reflection.**

Memory Circle helps you capture moments, reflect on your day, and practice mindfulness without worrying about privacy. Your data never leaves your device.

## Key Features

*   **100% Private & Offline**: All data is stored locally in IndexedDB. No servers, no tracking.
*   **Multimedia Support**: Attach photos and voice notes to your memories.
*   **Circle of Friends**: Organize memories by person and view shared timelines.
*   **Inspire Me**: Get random, thoughtful prompts to jumpstart your writing.
*   **Insights**: Visualize your mood patterns and activity over time.
*   **Map Explorer**: See your memories on a private map.
*   **Secure**: App lock with passcode protection.
*   **Backup**: Export your entire journal to JSON.

## Tech Stack

*   **Frontend**: React (Vite), TypeScript, Tailwind CSS
*   **Mobile**: Ionic Capacitor (Android & iOS)
*   **Storage**: IndexedDB (via `idb`)
*   **Animation**: Framer Motion

## Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Locally**:
    ```bash
    npm run dev
    ```

3.  **Build for Mobile**:
    ```bash
    npm run build
    npx cap sync
    ```
    Then open the `android` or `ios` folder in Android Studio / Xcode.

## Privacy

See [Privacy Policy](public/privacy.html). We do not collect any user data.

## License

Private / Proprietary.
