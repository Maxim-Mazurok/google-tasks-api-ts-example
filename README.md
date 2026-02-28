# Google Tasks API TypeScript Example
Very basic (and sometimes ugly) but working example of Google Tasks API usage in TypeScript for Browser

## Features:
- View task lists and tasks
- Create, delete, and complete tasks
- Create and delete task lists
- Move tasks between positions
- Search tasks across all lists
- View overdue tasks

## Instructions:
1. `git clone https://github.com/Maxim-Mazurok/google-tasks-api-ts-example`
1. `cd google-tasks-api-ts-example`
1. `npm install`
1. Get Client ID and API key: [instructions](https://developers.google.com/tasks/quickstart/js#step_1_turn_on_the)
1. Set `CLIENT_ID` and `API_KEY` in [src/index.ts](src/index.ts)
1. Run `npm run compile` to compile TS to JS (`index.js` should appear in `dist` folder)
1. Start your server (using `https-serve` + edit `hosts` file, or `ngrok`)
1. Authorize, and you'll see your TaskLists as well as Tasks within those TaskLists

## New API Functions:
- `createTask(taskListId, title, notes?, dueDate?)` - Creates a new task
- `deleteTask(tasklistId, taskId)` - Deletes a task
- `completeTask(taskListId, taskId)` - Marks task as done
- `createTaskList(title)` - Creates a new task list
- `deleteTaskList(taskListId)` - Deletes a task list
- `moveTask(tasklistId, taskId, previousTaskId?)` - Reorders a task
- `searchTasks(query)` - Search tasks by title
- `getOverdueTasks(taskListId, beforeDate)` - Get overdue tasks

## Troubleshooting:
- Always look in the browser console for errors
- Make sure that you're serving via https (using `https-serve` + edit `hosts` file, or `ngrok`)
- Make sure that your domain is added in Google developer console
- You can open issue here if you need help
