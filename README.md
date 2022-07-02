# Google Ads API TypeScript Example

Very basic (and sometimes ugly) but working example of Google Ads API usage in TypeScript for Browser

## Instructions:

1. `git clone https://github.com/Maxim-Mazurok/google-tasks-api-ts-example`
1. `git checkout googleads`
1. `cd google-tasks-api-ts-example`
1. `npm install`
1. Get Client ID and API key: [instructions](https://developers.google.com/tasks/quickstart/js#step_1_turn_on_the)
1. Get Developer Token: [instructions](https://developers.google.com/google-ads/api/docs/first-call/dev-token?hl=en)
1. Set `CLIENT_ID`, `API_KEY` and `DEVELOPER_TOKEN` in [src/index.ts](src/index.ts)
1. Run `npm run compile` to compile TS to JS (`index.js` should appear in `dist` folder)
1. Start your server (`npx -y serve dist`)
1. Authorize, and you'll see some geo targets suggestions

## Troubleshooting:

- Always look in the browser console for errors
- Make sure that your domain is added in Google developer console
- You can open issue here if you need help
