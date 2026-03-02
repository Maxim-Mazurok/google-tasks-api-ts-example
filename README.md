# Google Tasks API TypeScript Example
Very basic (and sometimes ugly) but working example of Google Tasks API usage in TypeScript for Browser


## Instructions:
1. `git clone https://github.com/Maxim-Mazurok/google-tasks-api-ts-example`
1. `cd google-tasks-api-ts-example`
1. `npm install`
1. Get your Client ID and API key from the [Google Cloud Console](https://developers.google.com/tasks/quickstart/js#step_1_turn_on_the) and add the OAuth 2.0 redirect URI `http://localhost:3000/oauth2callback`
1. Copy `src/config.example.ts` to `src/config.ts` and fill in your `CLIENT_ID` and `API_KEY`
   > `src/config.ts` is gitignored — never commit real credentials
   >
   > **API_KEY vs Client Secret:** this app uses a *Browser API key* (not the Client Secret). The Client Secret is for server-side OAuth flows; a browser key is used here alongside the OAuth client ID to initialise the `gapi` client.
1. Run `npm run compile` to compile TS to JS (`index.js` appears in the `dist` folder)
1. Serve the `dist` folder on `http://localhost:3000`:
   ```
   npx serve dist --listen 3000
   ```
   Plain HTTP on `localhost` is fine — Google allows non-HTTPS redirect URIs for `localhost`. `https-serve` or `ngrok` are only needed if you want to use a custom hostname; for local development they are not required.
1. Open `http://localhost:3000` in your browser, click **Authorize**, and you'll see your TaskLists and Tasks


## E2E Tests (Playwright)

The e2e tests are **read-only** — they only list tasks, never modify them.

### Prerequisites
- `src/config.ts` exists and contains valid credentials (see above)
- `dist/index.js` is compiled: `npm run compile`
- You are signed in to your Google account in system Chrome (the tests reuse your saved session)

### Run
```
npm run test:e2e
```

A Chrome window will open, click **Authorize**, complete the Google OAuth prompt
(only required on the first run — Chrome remembers the grant), and the tests will
verify that your task lists and tasks are displayed.


## Troubleshooting:
- Always look in the browser console for errors
- Make sure `src/config.ts` contains the correct `CLIENT_ID` and `API_KEY`
- Make sure `http://localhost:3000/oauth2callback` is listed as an **Authorized redirect URI** in the Google Cloud Console OAuth client settings
- You can open an issue here if you need help

