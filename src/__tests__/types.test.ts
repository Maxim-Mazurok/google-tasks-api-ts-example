/**
 * Type assertion tests for Google Tasks API type definitions.
 *
 * These tests verify that the TypeScript types from
 * @types/gapi.client.tasks are correctly defined and usable.
 * If the types are incorrect, these tests will fail at compile time.
 */

// Helper type to assert that two types are equal
type IsExact<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;

// Helper to cause a compile error if the condition is false
function assert<T extends true>() {}

describe("Google Tasks API type definitions", () => {
  describe("Task interface", () => {
    it("should allow creating a Task with all optional properties", () => {
      const task: gapi.client.tasks.Task = {
        id: "task-1",
        title: "My Task",
        status: "needsAction",
        due: "2024-01-01T00:00:00.000Z",
        notes: "Some notes",
        completed: "2024-01-02T00:00:00.000Z",
        deleted: false,
        hidden: false,
        etag: "etag-value",
        kind: "tasks#task",
        parent: "parent-id",
        position: "00000000000000000001",
        selfLink: "https://example.com/task/1",
        updated: "2024-01-01T00:00:00.000Z",
        links: [{ description: "Link", link: "https://example.com", type: "email" }],
      };
      expect(task.title).toBe("My Task");
    });

    it("should allow creating an empty Task (all properties optional)", () => {
      const task: gapi.client.tasks.Task = {};
      expect(task).toEqual({});
    });

    it("should have correct types for Task properties", () => {
      const task: gapi.client.tasks.Task = {};

      // Verify property types are string | undefined
      assert<IsExact<typeof task.id, string | undefined>>();
      assert<IsExact<typeof task.title, string | undefined>>();
      assert<IsExact<typeof task.status, string | undefined>>();
      assert<IsExact<typeof task.due, string | undefined>>();
      assert<IsExact<typeof task.notes, string | undefined>>();
      assert<IsExact<typeof task.completed, string | undefined>>();
      assert<IsExact<typeof task.etag, string | undefined>>();
      assert<IsExact<typeof task.kind, string | undefined>>();
      assert<IsExact<typeof task.parent, string | undefined>>();
      assert<IsExact<typeof task.position, string | undefined>>();
      assert<IsExact<typeof task.selfLink, string | undefined>>();
      assert<IsExact<typeof task.updated, string | undefined>>();

      // Verify boolean properties
      assert<IsExact<typeof task.deleted, boolean | undefined>>();
      assert<IsExact<typeof task.hidden, boolean | undefined>>();
    });

    it("should have correctly typed links array", () => {
      const task: gapi.client.tasks.Task = {
        links: [
          { description: "desc", link: "https://link.com", type: "email" },
        ],
      };
      const firstLink = task.links?.[0];
      assert<IsExact<typeof firstLink, { description?: string; link?: string; type?: string } | undefined>>();
      expect(firstLink?.link).toBe("https://link.com");
    });
  });

  describe("TaskList interface", () => {
    it("should allow creating a TaskList with all properties", () => {
      const taskList: gapi.client.tasks.TaskList = {
        id: "list-1",
        title: "My Task List",
        etag: "etag",
        kind: "tasks#taskList",
        selfLink: "https://example.com/list/1",
        updated: "2024-01-01T00:00:00.000Z",
      };
      expect(taskList.title).toBe("My Task List");
    });

    it("should allow creating an empty TaskList (all properties optional)", () => {
      const taskList: gapi.client.tasks.TaskList = {};
      expect(taskList).toEqual({});
    });

    it("should have correct types for TaskList properties", () => {
      const taskList: gapi.client.tasks.TaskList = {};

      assert<IsExact<typeof taskList.id, string | undefined>>();
      assert<IsExact<typeof taskList.title, string | undefined>>();
      assert<IsExact<typeof taskList.etag, string | undefined>>();
      assert<IsExact<typeof taskList.kind, string | undefined>>();
      assert<IsExact<typeof taskList.selfLink, string | undefined>>();
      assert<IsExact<typeof taskList.updated, string | undefined>>();
    });
  });

  describe("TaskLists interface", () => {
    it("should contain an array of TaskList items", () => {
      const taskLists: gapi.client.tasks.TaskLists = {
        items: [
          { id: "list-1", title: "List 1" },
          { id: "list-2", title: "List 2" },
        ],
        kind: "tasks#taskLists",
        etag: "etag",
        nextPageToken: "token",
      };

      assert<IsExact<typeof taskLists.items, gapi.client.tasks.TaskList[] | undefined>>();
      expect(taskLists.items?.length).toBe(2);
    });

    it("should have optional nextPageToken for pagination", () => {
      const taskLists: gapi.client.tasks.TaskLists = {};
      assert<IsExact<typeof taskLists.nextPageToken, string | undefined>>();
    });
  });

  describe("Tasks interface", () => {
    it("should contain an array of Task items", () => {
      const tasks: gapi.client.tasks.Tasks = {
        items: [
          { id: "task-1", title: "Task 1" },
          { id: "task-2", title: "Task 2" },
        ],
        kind: "tasks#tasks",
        etag: "etag",
        nextPageToken: "token",
      };

      assert<IsExact<typeof tasks.items, gapi.client.tasks.Task[] | undefined>>();
      expect(tasks.items?.length).toBe(2);
    });
  });

  describe("API method types", () => {
    it("should accept correct parameters for tasklists.list", () => {
      // Verify the tasklists.list method accepts maxResults parameter
      type TasklistsListParam = Parameters<typeof gapi.client.tasks.tasklists.list>[0];

      // maxResults should be an optional number
      const params: TasklistsListParam = { maxResults: 10 };
      expect(params.maxResults).toBe(10);
    });

    it("should accept correct parameters for tasks.list", () => {
      // Verify the tasks.list method requires tasklist parameter
      type TasksListParam = Parameters<typeof gapi.client.tasks.tasks.list>[0];

      const params: TasksListParam = { tasklist: "my-list-id" };
      expect(params.tasklist).toBe("my-list-id");
    });

    it("should have tasklists.list return type with correct result shape", () => {
      // Verify the return type includes TaskLists in the result
      type TasklistsListReturn = ReturnType<typeof gapi.client.tasks.tasklists.list>;

      // This verifies that the return is a Request<TaskLists>
      type ResultType = TasklistsListReturn extends gapi.client.Request<infer R> ? R : never;
      assert<IsExact<ResultType, gapi.client.tasks.TaskLists>>();
    });

    it("should have tasks.list return type with correct result shape", () => {
      type TasksListReturn = ReturnType<typeof gapi.client.tasks.tasks.list>;

      type ResultType = TasksListReturn extends gapi.client.Request<infer R> ? R : never;
      assert<IsExact<ResultType, gapi.client.tasks.Tasks>>();
    });
  });
});
