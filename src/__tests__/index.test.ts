/**
 * Unit tests for the Google Tasks API example application.
 *
 * Tests the core functions with mocked DOM and gapi globals.
 */

// We need to mock the gapi global and DOM elements before importing the module,
// because the module executes document.getElementById on import.

// Mock DOM elements
const mockAuthorizeButton = {
  style: { display: "" },
  onclick: null as ((ev: MouseEvent) => any) | null,
};
const mockSignoutButton = {
  style: { display: "" },
  onclick: null as ((ev: MouseEvent) => any) | null,
};
const mockContentElement = {
  appendChild: jest.fn(),
};

// Override getElementById to return our mocks
const originalGetElementById = document.getElementById.bind(document);
jest.spyOn(document, "getElementById").mockImplementation((id: string) => {
  if (id === "authorize_button") return mockAuthorizeButton as any;
  if (id === "signout_button") return mockSignoutButton as any;
  if (id === "content") return mockContentElement as any;
  return originalGetElementById(id);
});

// Mock the gapi global
const mockSignIn = jest.fn();
const mockSignOut = jest.fn();
const mockListenFn = jest.fn();
const mockGetFn = jest.fn();
const mockTasklistsList = jest.fn();
const mockTasksList = jest.fn();
const mockClientInit = jest.fn();
const mockLoad = jest.fn();

(globalThis as any).gapi = {
  load: mockLoad,
  client: {
    init: mockClientInit,
    tasks: {
      tasklists: { list: mockTasklistsList },
      tasks: { list: mockTasksList },
    },
  },
  auth2: {
    getAuthInstance: () => ({
      signIn: mockSignIn,
      signOut: mockSignOut,
      isSignedIn: {
        listen: mockListenFn,
        get: mockGetFn,
      },
    }),
  },
};

// Now import the module (after mocks are set up)
import {
  appendPre,
  updateSigninStatus,
  handleClientLoad,
  initClient,
  handleAuthClick,
  handleSignoutClick,
  listTaskLists,
} from "../index";

describe("appendPre", () => {
  beforeEach(() => {
    mockContentElement.appendChild.mockClear();
  });

  it("should append a text node to the content element", () => {
    appendPre("Hello World");

    expect(mockContentElement.appendChild).toHaveBeenCalledTimes(1);
    const appendedNode = mockContentElement.appendChild.mock.calls[0][0];
    expect(appendedNode.textContent).toBe("Hello World\n");
  });

  it("should append message with newline character", () => {
    appendPre("Test message");

    const appendedNode = mockContentElement.appendChild.mock.calls[0][0];
    expect(appendedNode.textContent).toContain("\n");
  });

  it("should handle empty string", () => {
    appendPre("");

    expect(mockContentElement.appendChild).toHaveBeenCalledTimes(1);
    const appendedNode = mockContentElement.appendChild.mock.calls[0][0];
    expect(appendedNode.textContent).toBe("\n");
  });
});

describe("updateSigninStatus", () => {
  beforeEach(() => {
    mockAuthorizeButton.style.display = "";
    mockSignoutButton.style.display = "";
    mockTasklistsList.mockReset();
    mockTasksList.mockReset();
  });

  it("should hide authorize button and show signout button when signed in", () => {
    // Mock listTaskLists to prevent actual API call
    mockTasklistsList.mockReturnValue({ then: jest.fn() });

    updateSigninStatus(true);

    expect(mockAuthorizeButton.style.display).toBe("none");
    expect(mockSignoutButton.style.display).toBe("block");
  });

  it("should show authorize button and hide signout button when signed out", () => {
    updateSigninStatus(false);

    expect(mockAuthorizeButton.style.display).toBe("block");
    expect(mockSignoutButton.style.display).toBe("none");
  });

  it("should call listTaskLists when signed in", () => {
    mockTasklistsList.mockReturnValue({ then: jest.fn() });

    updateSigninStatus(true);

    expect(mockTasklistsList).toHaveBeenCalledWith({ maxResults: 10 });
  });

  it("should not call listTaskLists when signed out", () => {
    updateSigninStatus(false);

    expect(mockTasklistsList).not.toHaveBeenCalled();
  });
});

describe("handleClientLoad", () => {
  beforeEach(() => {
    mockLoad.mockClear();
  });

  it("should call gapi.load with client:auth2", () => {
    handleClientLoad();

    expect(mockLoad).toHaveBeenCalledWith("client:auth2", initClient);
  });
});

describe("initClient", () => {
  beforeEach(() => {
    mockClientInit.mockReset();
    mockListenFn.mockClear();
    mockGetFn.mockClear();
    mockContentElement.appendChild.mockClear();
    mockAuthorizeButton.onclick = null;
    mockSignoutButton.onclick = null;
    mockTasklistsList.mockReset();
  });

  it("should call gapi.client.init with correct parameters", () => {
    mockClientInit.mockReturnValue({ then: jest.fn() });

    initClient();

    expect(mockClientInit).toHaveBeenCalledWith({
      apiKey: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      clientId:
        "xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest",
      ],
      scope: "https://www.googleapis.com/auth/tasks.readonly",
    });
  });

  it("should set up sign-in state listener on success", () => {
    mockGetFn.mockReturnValue(false);
    mockClientInit.mockReturnValue({
      then: (onSuccess: () => void) => {
        onSuccess();
      },
    });

    initClient();

    expect(mockListenFn).toHaveBeenCalledWith(updateSigninStatus);
  });

  it("should handle the initial sign-in state on success", () => {
    mockGetFn.mockReturnValue(true);
    mockTasklistsList.mockReturnValue({ then: jest.fn() });
    mockClientInit.mockReturnValue({
      then: (onSuccess: () => void) => {
        onSuccess();
      },
    });

    initClient();

    expect(mockGetFn).toHaveBeenCalled();
  });

  it("should set up button onclick handlers on success", () => {
    mockGetFn.mockReturnValue(false);
    mockClientInit.mockReturnValue({
      then: (onSuccess: () => void) => {
        onSuccess();
      },
    });

    initClient();

    expect(mockAuthorizeButton.onclick).toBe(handleAuthClick);
    expect(mockSignoutButton.onclick).toBe(handleSignoutClick);
  });

  it("should display error message on failure", () => {
    const mockError = { error: "init_failed", message: "Failed to init" };
    mockClientInit.mockReturnValue({
      then: (_onSuccess: () => void, onError: (error: any) => void) => {
        onError(mockError);
      },
    });

    initClient();

    const appendedTexts = mockContentElement.appendChild.mock.calls.map(
      (call: any[]) => call[0].textContent
    );
    expect(appendedTexts).toContain(
      JSON.stringify(mockError, null, 2) + "\n"
    );
  });
});

describe("handleAuthClick", () => {
  beforeEach(() => {
    mockSignIn.mockClear();
  });

  it("should call gapi.auth2 signIn", () => {
    handleAuthClick(null);

    expect(mockSignIn).toHaveBeenCalled();
  });
});

describe("handleSignoutClick", () => {
  beforeEach(() => {
    mockSignOut.mockClear();
  });

  it("should call gapi.auth2 signOut", () => {
    handleSignoutClick(null);

    expect(mockSignOut).toHaveBeenCalled();
  });
});

describe("listTaskLists", () => {
  beforeEach(() => {
    mockTasklistsList.mockReset();
    mockTasksList.mockReset();
    mockContentElement.appendChild.mockClear();
  });

  it("should call tasklists.list with maxResults of 10", () => {
    mockTasklistsList.mockReturnValue({ then: jest.fn() });

    listTaskLists();

    expect(mockTasklistsList).toHaveBeenCalledWith({ maxResults: 10 });
  });

  it("should display task lists when they are returned", () => {
    const mockResponse = {
      result: {
        items: [
          { id: "list-1", title: "My Tasks" },
          { id: "list-2", title: "Work" },
        ],
      },
    };

    mockTasksList.mockReturnValue({ then: jest.fn() });
    mockTasklistsList.mockReturnValue({
      then: (callback: (response: any) => void) => {
        callback(mockResponse);
      },
    });

    listTaskLists();

    // Verify appendPre was called with task list info
    const appendedTexts = mockContentElement.appendChild.mock.calls.map(
      (call: any[]) => call[0].textContent
    );
    expect(appendedTexts).toContain("Task Lists:\n");
    expect(appendedTexts).toContain("My Tasks (list-1)\n");
    expect(appendedTexts).toContain("Work (list-2)\n");
  });

  it("should display 'No task lists found.' when items is empty", () => {
    const mockResponse = {
      result: {
        items: [],
      },
    };

    mockTasklistsList.mockReturnValue({
      then: (callback: (response: any) => void) => {
        callback(mockResponse);
      },
    });

    listTaskLists();

    const appendedTexts = mockContentElement.appendChild.mock.calls.map(
      (call: any[]) => call[0].textContent
    );
    expect(appendedTexts).toContain("No task lists found.\n");
  });

  it("should display 'No task lists found.' when items is undefined", () => {
    const mockResponse = {
      result: {},
    };

    mockTasklistsList.mockReturnValue({
      then: (callback: (response: any) => void) => {
        callback(mockResponse);
      },
    });

    listTaskLists();

    const appendedTexts = mockContentElement.appendChild.mock.calls.map(
      (call: any[]) => call[0].textContent
    );
    expect(appendedTexts).toContain("No task lists found.\n");
  });

  it("should fetch tasks for each task list", () => {
    const mockResponse = {
      result: {
        items: [{ id: "list-1", title: "My Tasks" }],
      },
    };

    mockTasksList.mockReturnValue({ then: jest.fn() });
    mockTasklistsList.mockReturnValue({
      then: (callback: (response: any) => void) => {
        callback(mockResponse);
      },
    });

    listTaskLists();

    expect(mockTasksList).toHaveBeenCalledWith({ tasklist: "list-1" });
  });

  it("should not fetch tasks for task lists without an id", () => {
    const mockResponse = {
      result: {
        items: [{ title: "No ID List" }],
      },
    };

    mockTasksList.mockReturnValue({ then: jest.fn() });
    mockTasklistsList.mockReturnValue({
      then: (callback: (response: any) => void) => {
        callback(mockResponse);
      },
    });

    listTaskLists();

    expect(mockTasksList).not.toHaveBeenCalled();
  });

  it("should display tasks when they are returned for a task list", () => {
    const mockTasksResponse = {
      result: {
        items: [
          { title: "Buy groceries" },
          { title: "Walk the dog" },
        ],
      },
    };

    const mockTaskListResponse = {
      result: {
        items: [{ id: "list-1", title: "My Tasks" }],
      },
    };

    mockTasksList.mockReturnValue({
      then: (callback: (response: any) => void) => {
        callback(mockTasksResponse);
      },
    });
    mockTasklistsList.mockReturnValue({
      then: (callback: (response: any) => void) => {
        callback(mockTaskListResponse);
      },
    });

    listTaskLists();

    const appendedTexts = mockContentElement.appendChild.mock.calls.map(
      (call: any[]) => call[0].textContent
    );
    expect(appendedTexts).toContain("\nTasks:\n");
    expect(appendedTexts).toContain("Buy groceries\n");
    expect(appendedTexts).toContain("Walk the dog\n");
  });
});
