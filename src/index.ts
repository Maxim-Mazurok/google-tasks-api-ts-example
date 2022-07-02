// Client ID and API key from the Developer Console
const CLIENT_ID =
  "xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com";
const API_KEY = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest",
  "https://googleads.googleapis.com/$discovery/rest?version=v11",
];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = [
  "https://www.googleapis.com/auth/tasks.readonly",
  "https://www.googleapis.com/auth/adwords",
];

const authorizeButton = document.getElementById("authorize_button");
const signoutButton = document.getElementById("signout_button");

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES.join(" "),
      "developer-token": "XXXXXXXXXXXXXXXXXXXXXX",
    })
    .then(
      function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton && (authorizeButton.onclick = handleAuthClick);
        signoutButton && (signoutButton.onclick = handleSignoutClick);
      },
      function (error) {
        appendPre(JSON.stringify(error, null, 2));
      }
    );
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton && (authorizeButton.style.display = "none");
    signoutButton && (signoutButton.style.display = "block");
    listTaskLists();
  } else {
    authorizeButton && (authorizeButton.style.display = "block");
    signoutButton && (signoutButton.style.display = "none");
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  const pre = document.getElementById("content");
  const textContent = document.createTextNode(message + "\n");
  pre && pre.appendChild(textContent);
}

/**
 * Print task lists.
 */
function listTaskLists() {
  // gapi.client.tasks.tasklists
  //   .list({
  //     maxResults: 10,
  //   })
  //   .then(function (response) {
  //     appendPre("Task Lists:");
  //     const taskLists = response.result.items;
  //     if (taskLists && taskLists.length > 0) {
  //       for (let i = 0; i < taskLists.length; i++) {
  //         const taskList = taskLists[i];
  //         appendPre(taskList.title + " (" + taskList.id + ")");

  //         taskList.id &&
  //           gapi.client.tasks.tasks
  //             .list({
  //               tasklist: taskList.id,
  //             })
  //             .then((response) => {
  //               appendPre("\nTasks:");
  //               response.result.items &&
  //                 response.result.items.forEach((task) =>
  //                   appendPre(task.title)
  //                 );
  //             });
  //       }
  //     } else {
  //       appendPre("No task lists found.");
  //     }
  //   });

  gapi.client
    .request({
      path: "https://content-googleads.googleapis.com/v11/geoTargetConstants:suggest",
      body: {
        geoTargets: { geoTargetConstants: ["20118"] },
        countryCode: "AU",
      },
      headers: { "developer-token": "XXXXXXXXXXXXXXXXXXXXXX" },
    })
    // gapi.client.googleads.geoTargetConstants
    //   .suggest(
    //     {},
    //     { geoTargets: { geoTargetConstants: ["20118"] }, countryCode: "AU" },
    //     // @ts-expect-error
    //     { headers: { "developer-token": "XXXXXXXXXXXXXXXXXXXXXX" } }
    //   )
    .then((x) => console.log(x))
    .catch((x) => console.error(x));
}
