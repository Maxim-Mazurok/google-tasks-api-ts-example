// Credentials are declared as globals — loaded via config.js script tag in index.html
declare const CLIENT_ID: string;
declare const API_KEY: string;

// Google Identity Services (GIS) type declarations
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenClient {
        callback: string | ((tokenResponse: TokenResponse) => void);
        requestAccessToken(overrideConfig?: { prompt?: string }): void;
      }
      interface TokenResponse {
        access_token: string;
        error?: string;
      }
      function initTokenClient(config: {
        client_id: string;
        scope: string;
        callback: string | ((tokenResponse: TokenResponse) => void);
      }): TokenClient;
      function revoke(token: string, done: () => void): void;
    }
  }
}

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'];

// Authorization scopes required by the API
const SCOPES = 'https://www.googleapis.com/auth/tasks.readonly';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInited = false;
let gisInited = false;

const getAuthorizeButton = () => document.getElementById('authorize_button');
const getSignoutButton = () => document.getElementById('signout_button');

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    getAuthorizeButton() && (getAuthorizeButton()!.style.display = 'block');
  }
}

/**
 * Called by api.js onload to load the gapi client library.
 */
export function handleClientLoad() {
  gapi.load('client', initGapiClient);
}

/**
 * Initializes the gapi client library for API calls (no auth).
 */
export async function initGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: DISCOVERY_DOCS,
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Called by the GIS script onload to initialize the OAuth token client.
 */
export function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '',
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Sign in the user upon button click.
 */
export function handleAuthClick() {
  tokenClient!.callback = (tokenResponse: google.accounts.oauth2.TokenResponse) => {
    if (tokenResponse.error !== undefined) {
      appendPre(JSON.stringify(tokenResponse, null, 2));
      return;
    }
    getSignoutButton() && (getSignoutButton()!.style.display = 'block');
    getAuthorizeButton() && (getAuthorizeButton()!.style.display = 'none');
    listTaskLists();
  };
  if (gapi.client.getToken() === null) {
    tokenClient!.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient!.requestAccessToken({ prompt: '' });
  }
}

/**
 * Sign out the user upon button click.
 */
export function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token, () => {});
    gapi.client.setToken('' as any);
    const content = document.getElementById('content') as HTMLPreElement | null;
    if (content) content.innerText = '';
    getAuthorizeButton() && (getAuthorizeButton()!.style.display = 'block');
    getSignoutButton() && (getSignoutButton()!.style.display = 'none');
  }
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
export function appendPre(message) {
  const pre = document.getElementById('content');
  const textContent = document.createTextNode(message + '\n');
  pre && pre.appendChild(textContent);
}

/**
 * Print task lists.
 */
export function listTaskLists() {
  gapi.client.tasks.tasklists.list({
    maxResults: 10,
  }).then(function (response) {
    appendPre('Task Lists:');
    const taskLists = response.result.items;
    if (taskLists && taskLists.length > 0) {
      for (let i = 0; i < taskLists.length; i++) {
        const taskList = taskLists[i];
        appendPre(taskList.title + ' (' + taskList.id + ')');

        taskList.id && gapi.client.tasks.tasks.list({
          tasklist: taskList.id,
        }).then((response) => {
          appendPre('\nTasks:');
          response.result.items && response.result.items.forEach(task => appendPre(task.title));
        });
      }
    } else {
      appendPre('No task lists found.');
    }
  });
}
