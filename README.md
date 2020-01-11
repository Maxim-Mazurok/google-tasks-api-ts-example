# Google Tasks API TypeScript Example
Very basic (and sometimes ugly) but working example of Google Tasks API usage in TypeScript for Browser


## Instructions:
1. Get Client ID and API key: [instructions](https://developers.google.com/tasks/quickstart/js#step_1_turn_on_the)
1. Set `CLIENT_ID` and `API_KEY` in [src/index.ts](src/index.ts)
1. Run `npm run compile` to compile TS to JS (`index.js` should appear in `dist` folder)
1. Start your server (using `https-serve` + edit `hosts` file, or `ngrok`)
1. Authorize, and you'll see your TaskLists as well as Tasks within those TaskLists

## Troubleshooting:
- Always look in the browser console for errors
- Make sure that you're serving via https (using `https-serve` + edit `hosts` file, or `ngrok`)
- Make sure that your domain is added in Google developer console
- You can open issue here if you need help
