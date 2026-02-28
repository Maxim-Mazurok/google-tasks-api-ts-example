/**
 * Tests for the new task management functions.
 */

const mockContentElement = {
  appendChild: jest.fn(),
};

const mockInsertTask = jest.fn();
const mockDeleteTask = jest.fn();
const mockPatchTask = jest.fn();
const mockMoveTask = jest.fn();
const mockInsertTaskList = jest.fn();
const mockDeleteTaskList = jest.fn();
const mockTasksList = jest.fn();

const originalGetElementById = document.getElementById.bind(document);
jest.spyOn(document, "getElementById").mockImplementation((id: string) => {
  if (id === "authorize_button") return { style: { display: "" }, onclick: null } as any;
  if (id === "signout_button") return { style: { display: "" }, onclick: null } as any;
  if (id === "content") return mockContentElement as any;
  return originalGetElementById(id);
});

afterAll(() => {
  (document.getElementById as jest.SpyInstance).mockRestore();
});

(globalThis as any).gapi = {
  load: jest.fn(),
  client: {
    init: jest.fn().mockReturnValue({ then: jest.fn() }),
    tasks: {
      tasklists: {
        list: jest.fn().mockReturnValue({ then: jest.fn() }),
        insert: mockInsertTaskList,
        delete: mockDeleteTaskList,
      },
      tasks: {
        list: mockTasksList,
        insert: mockInsertTask,
        delete: mockDeleteTask,
        patch: mockPatchTask,
        move: mockMoveTask,
      },
    },
  },
  auth2: {
    getAuthInstance: () => ({
      signIn: jest.fn(),
      signOut: jest.fn(),
      isSignedIn: { listen: jest.fn(), get: jest.fn() },
    }),
  },
};

import {
  createTask,
  deleteTask,
  completeTask,
  createTaskList,
  deleteTaskList,
  moveTask,
  searchTasks,
  getOverdueTasks,
} from "../index";

describe("createTask", () => {
  beforeEach(() => {
    mockInsertTask.mockReset();
    mockContentElement.appendChild.mockClear();
  });

  it("should call tasks.insert with correct params", () => {
    mockInsertTask.mockReturnValue({
      then: (cb) => { cb({ result: { title: "New Task" } }); return { catch: jest.fn() }; },
    });

    createTask("list-1", "New Task", "Some notes");

    expect(mockInsertTask).toHaveBeenCalledWith(
      expect.objectContaining({
        tasklist: "list-1",
        resource: expect.objectContaining({ title: "New Task" }),
      })
    );
  });

  it("should include due date when provided", () => {
    mockInsertTask.mockReturnValue({
      then: (cb) => { cb({ result: { title: "Task" } }); return { catch: jest.fn() }; },
    });

    createTask("list-1", "Task", undefined, "2024-12-25T00:00:00.000Z");

    expect(mockInsertTask).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: expect.objectContaining({ due: "2024-12-25T00:00:00.000Z" }),
      })
    );
  });

  it("should handle errors gracefully", () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    mockInsertTask.mockReturnValue({
      then: () => ({ catch: (cb) => cb("API Error") }),
    });

    createTask("list-1", "Task");

    consoleSpy.mockRestore();
  });
});

describe("deleteTask", () => {
  beforeEach(() => {
    mockDeleteTask.mockReset();
    mockContentElement.appendChild.mockClear();
  });

  it("should call tasks.delete with correct params", () => {
    mockDeleteTask.mockReturnValue({
      then: (cb) => cb(),
    });

    deleteTask("list-1", "task-1");

    expect(mockDeleteTask).toHaveBeenCalledWith({
      tasklist: "list-1",
      task: "task-1",
    });
  });
});

describe("completeTask", () => {
  beforeEach(() => {
    mockPatchTask.mockReset();
    mockContentElement.appendChild.mockClear();
  });

  it("should call tasks.patch with completed status", () => {
    mockPatchTask.mockReturnValue({
      then: (cb) => cb({ result: { title: "Done Task" } }),
    });

    completeTask("list-1", "task-1");

    expect(mockPatchTask).toHaveBeenCalledWith(
      expect.objectContaining({
        tasklist: "list-1",
        task: "task-1",
        resource: expect.objectContaining({ status: "completed" }),
      })
    );
  });
});

describe("createTaskList", () => {
  beforeEach(() => {
    mockInsertTaskList.mockReset();
    mockContentElement.appendChild.mockClear();
  });

  it("should not create task list with empty title", () => {
    createTaskList("");

    expect(mockInsertTaskList).not.toHaveBeenCalled();
  });

  it("should call tasklists.insert with title", () => {
    mockInsertTaskList.mockReturnValue({
      then: (cb) => cb({ result: { title: "New List", id: "new-1" } }),
    });

    createTaskList("New List");

    expect(mockInsertTaskList).toHaveBeenCalled();
  });
});

describe("deleteTaskList", () => {
  beforeEach(() => {
    mockDeleteTaskList.mockReset();
    mockContentElement.appendChild.mockClear();
  });

  it("should call tasklists.delete and update display", () => {
    mockDeleteTaskList.mockReturnValue({
      then: (cb) => cb(),
    });

    deleteTaskList("list-1");

    expect(mockDeleteTaskList).toHaveBeenCalledWith({
      tasklist: "list-1",
    });
  });
});

describe("moveTask", () => {
  beforeEach(() => {
    mockMoveTask.mockReset();
    mockContentElement.appendChild.mockClear();
  });

  it("should call tasks.move with correct params", () => {
    mockMoveTask.mockReturnValue({
      then: (cb) => cb({ result: { title: "Moved Task" } }),
    });

    moveTask("list-1", "task-1", "task-0");

    expect(mockMoveTask).toHaveBeenCalledWith(
      expect.objectContaining({
        tasklist: "list-1",
        task: "task-1",
        previous: "task-0",
      })
    );
  });

  it("should work without previousTaskId", () => {
    mockMoveTask.mockReturnValue({
      then: (cb) => cb({ result: { title: "Moved Task" } }),
    });

    moveTask("list-1", "task-1");

    const call = mockMoveTask.mock.calls[0][0];
    expect(call.previous).toBeUndefined();
  });
});

describe("getOverdueTasks", () => {
  beforeEach(() => {
    mockTasksList.mockReset();
    mockContentElement.appendChild.mockClear();
  });

  it("should fetch tasks with dueMax parameter", () => {
    mockTasksList.mockReturnValue({
      then: (cb) => cb({ result: { items: [] } }),
    });

    const dueDate = new Date("2024-06-15");
    getOverdueTasks("list-1", dueDate);

    expect(mockTasksList).toHaveBeenCalledWith(
      expect.objectContaining({
        tasklist: "list-1",
        dueMax: dueDate.toISOString(),
        showCompleted: false,
      })
    );
  });

  it("should display overdue tasks", () => {
    const tasks = [
      { title: "Late task", due: "2024-01-01" },
    ];
    mockTasksList.mockReturnValue({
      then: (cb) => cb({ result: { items: tasks } }),
    });

    getOverdueTasks("list-1", new Date("2024-06-15"));

    const appendedTexts = mockContentElement.appendChild.mock.calls.map(
      (call: any[]) => call[0].textContent
    );
    expect(appendedTexts).toContain("Overdue tasks: 1\n");
  });
});
