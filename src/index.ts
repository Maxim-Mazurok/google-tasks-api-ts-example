// Client ID and API key from the Developer Console
const CLIENT_ID = 'xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com';
const API_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/tasks';

const authorizeButton = document.getElementById('authorize_button');
const signoutButton = document.getElementById('signout_button');

// Cache for task lists to avoid refetching
let cachedTaskLists: any[] = [];

/**
 *  On load, called to load the auth2 library and API client library.
 */
export function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
export function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES,
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton && (authorizeButton.onclick = handleAuthClick);
    signoutButton && (signoutButton.onclick = handleSignoutClick);
  }, function (error) {
    appendPre(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
export function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton && (authorizeButton.style.display = 'none');
    signoutButton && (signoutButton.style.display = 'block');
    listTaskLists();
  } else {
    authorizeButton && (authorizeButton.style.display = 'block');
    signoutButton && (signoutButton.style.display = 'none');
  }
}

/**
 *  Sign in the user upon button click.
 */
export function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
export function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
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
      cachedTaskLists = taskLists;
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

/**
 * Create a new task in the specified task list.
 */
export function createTask(taskListId: string, title: string, notes?: string, dueDate?: string) {
  const taskBody: any = {
    title: title,
    notes: notes,
    status: 'needsAction',
  };

  if (dueDate) {
    taskBody.due = dueDate;
  }

  return gapi.client.tasks.tasks.insert({
    tasklist: taskListId,
    resource: taskBody,
  }).then(function(resp) {
    appendPre('Created task: ' + resp.result.title);
    return resp.result;
  }).catch(function(err) {
    console.log('Error creating task: ' + err);
  });
}

/**
 * Delete a task from the specified task list.
 */
export function deleteTask(taskListId: string, taskId: string) {
  return gapi.client.tasks.tasks.delete({
    tasklist: taskListId,
    task: taskId,
  }).then(function() {
    appendPre('Task deleted successfully');
  });
}

/**
 * Mark a task as completed.
 */
export function completeTask(taskListId: string, taskId: string) {
  return gapi.client.tasks.tasks.patch({
    tasklist: taskListId,
    task: taskId,
    resource: {
      status: 'completed',
      completed: new Date().toISOString(),
    },
  }).then(function(resp) {
    appendPre('Task completed: ' + resp.result.title);
  });
}

/**
 * Create a new task list.
 */
export function createTaskList(title: string) {
  if (title == '') {
    appendPre('Error: Task list title cannot be empty');
    return;
  }

  return gapi.client.tasks.tasklists.insert({ resource: { title: title } } as any).then(function(resp) {
    appendPre('Created task list: ' + resp.result.title);
    cachedTaskLists.push(resp.result);
    return resp.result;
  });
}

/**
 * Delete a task list.
 */
export function deleteTaskList(taskListId: string) {
  return gapi.client.tasks.tasklists.delete({
    tasklist: taskListId,
  }).then(function() {
    appendPre('Task list deleted');
    // Update cache
    for (let i = 0; i < cachedTaskLists.length; i++) {
      if (cachedTaskLists[i].id === taskListId) {
        cachedTaskLists.splice(i, 1);
        break;
      }
    }
  });
}

/**
 * Move task to a different position.
 */
export function moveTask(taskListId: string, taskId: string, previousTaskId?: string) {
  const params: any = {
    tasklist: taskListId,
    task: taskId,
  };
  if (previousTaskId) {
    params.previous = previousTaskId;
  }

  return gapi.client.tasks.tasks.move(params).then(function(resp) {
    appendPre('Task moved: ' + resp.result.title);
  });
}

/**
 * Search tasks by title across all task lists.
 * Returns matching tasks.
 */
export async function searchTasks(query: string): Promise<gapi.client.tasks.Task[]> {
  const results: gapi.client.tasks.Task[] = [];
  const q = query.toLowerCase();

  for (let i = 0; i < cachedTaskLists.length; i++) {
    const tl = cachedTaskLists[i];
    if (!tl.id) continue;

    const resp = await new Promise<any>((resolve) => {
      gapi.client.tasks.tasks.list({
        tasklist: tl.id,
        maxResults: 100,
      }).then(resolve);
    });

    if (resp.result.items) {
      resp.result.items.forEach((task) => {
        if (task.title && task.title.toLowerCase().indexOf(q) != -1) {
          results.push(task);
        }
      });
    }
  }

  appendPre('Found ' + results.length + ' tasks matching "' + query + '"');
  return results;
}

/**
 * Get all tasks with a due date before the specified date.
 */
export function getOverdueTasks(taskListId: string, beforeDate: Date) {
  return gapi.client.tasks.tasks.list({
    tasklist: taskListId,
    dueMax: beforeDate.toISOString(),
    showCompleted: false,
  }).then(function(resp) {
    const tasks = resp.result.items || [];
    appendPre('Overdue tasks: ' + tasks.length);

    tasks.forEach(function(task) {
      appendPre('  - ' + task.title + ' (due: ' + task.due + ')');
    });

    return tasks;
  });
}
