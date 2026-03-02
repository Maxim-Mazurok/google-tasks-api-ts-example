/**
 * Unit tests for the Google Tasks API example application.
 *
 * Tests the core functions with mocked DOM and gapi/google globals.
 */

// We need to mock the gapi/google globals and DOM elements before importing the module.

// Mock DOM elements
const mockAuthorizeButton = {
  style: { display: "" },
};
const mockSignoutButton = {
  style: { display: "" },
};
const mockContentElement = {
  appendChild: vi.fn(),
  innerText: "",
};

// Override getElementById to return our mocks
const originalGetElementById = document.getElementById.bind(document);
vi.spyOn(document, "getElementById").mockImplementation((id: string) => {
  if (id === "authorize_button") return mockAuthorizeButton as any;
  if (id === "signout_button") return mockSignoutButton as any;
  if (id === "content") return mockContentElement as any;
  return originalGetElementById(id);
});

// Mock the gapi global
const mockTasklistsList = vi.fn();
const mockTasksList = vi.fn();
const mockClientInit = vi.fn();
const mockLoad = vi.fn();
const mockGetToken = vi.fn();
const mockSetToken = vi.fn();

// Define credential globals needed by the module
(globalThis as any).CLIENT_ID = "test-client-id";
(globalThis as any).API_KEY = "test-api-key";

(globalThis as any).gapi = {
  load: mockLoad,
  client: {
    init: mockClientInit,
    getToken: mockGetToken,
    setToken: mockSetToken,
    tasks: {
      tasklists: { list: mockTasklistsList },
      tasks: { list: mockTasksList },
    },
  },
};

// Mock the Google Identity Services (GIS) global
const mockRequestAccessToken = vi.fn();
const mockInitTokenClient = vi.fn();
const mockRevoke = vi.fn();

(globalThis as any).google = {
  accounts: {
    oauth2: {
      initTokenClient: mockInitTokenClient,
      revoke: mockRevoke,
    },
  },
};

// Now import the module (after mocks are set up)
import {
  appendPre,
  handleClientLoad,
  initGapiClient,
  gisLoaded,
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

describe("handleClientLoad", () => {
  beforeEach(() => {
    mockLoad.mockClear();
  });

  it("should call gapi.load with client and initGapiClient", () => {
    handleClientLoad();

    expect(mockLoad).toHaveBeenCalledWith("client", initGapiClient);
  });
});

describe("initGapiClient", () => {
  beforeEach(() => {
    mockClientInit.mockReset();
    mockAuthorizeButton.style.display = "";
  });

  it("should call gapi.client.init with apiKey and discoveryDocs (no clientId or scope)", async () => {
    mockClientInit.mockResolvedValue({});

    await initGapiClient();

    expect(mockClientInit).toHaveBeenCalledWith({
      apiKey: expect.any(String),
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest",
      ],
    });
    expect(mockClientInit).not.toHaveBeenCalledWith(
      expect.objectContaining({ clientId: expect.anything() })
    );
  });
});

describe("gisLoaded", () => {
  beforeEach(() => {
    mockInitTokenClient.mockClear();
    mockInitTokenClient.mockReturnValue({
      requestAccessToken: mockRequestAccessToken,
      callback: "",
    });
  });

  it("should initialize tokenClient via google.accounts.oauth2.initTokenClient", () => {
    gisLoaded();

    expect(mockInitTokenClient).toHaveBeenCalledWith({
      client_id: expect.any(String),
      scope: "https://www.googleapis.com/auth/tasks.readonly",
      callback: "",
    });
  });
});

describe("handleAuthClick", () => {
  beforeEach(() => {
    mockRequestAccessToken.mockClear();
    mockGetToken.mockReturnValue(null);
    mockInitTokenClient.mockReturnValue({
      requestAccessToken: mockRequestAccessToken,
      callback: "",
    });
    gisLoaded(); // initialize tokenClient
  });

  it("should request access token with consent prompt when not signed in", () => {
    handleAuthClick();

    expect(mockRequestAccessToken).toHaveBeenCalledWith({ prompt: "consent" });
  });

  it("should request access token without prompt when already signed in", () => {
    mockGetToken.mockReturnValue({ access_token: "mock-token" });

    handleAuthClick();

    expect(mockRequestAccessToken).toHaveBeenCalledWith({ prompt: "" });
  });
});

describe("handleSignoutClick", () => {
  beforeEach(() => {
    mockGetToken.mockClear();
    mockSetToken.mockClear();
    mockRevoke.mockClear();
    mockAuthorizeButton.style.display = "none";
    mockSignoutButton.style.display = "block";
    mockContentElement.innerText = "some content";
  });

  it("should revoke token and reset UI when signed in", () => {
    mockGetToken.mockReturnValue({ access_token: "mock-token" });

    handleSignoutClick();

    expect(mockRevoke).toHaveBeenCalledWith("mock-token", expect.any(Function));
    expect(mockSetToken).toHaveBeenCalled();
    expect(mockAuthorizeButton.style.display).toBe("block");
    expect(mockSignoutButton.style.display).toBe("none");
  });

  it("should do nothing when not signed in", () => {
    mockGetToken.mockReturnValue(null);

    handleSignoutClick();

    expect(mockRevoke).not.toHaveBeenCalled();
    expect(mockSetToken).not.toHaveBeenCalled();
  });
});

describe("listTaskLists", () => {
  beforeEach(() => {
    mockTasklistsList.mockReset();
    mockTasksList.mockReset();
    mockContentElement.appendChild.mockClear();
  });

  it("should call tasklists.list with maxResults of 10", () => {
    mockTasklistsList.mockReturnValue({ then: vi.fn() });

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

    mockTasksList.mockReturnValue({ then: vi.fn() });
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

    mockTasksList.mockReturnValue({ then: vi.fn() });
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

    mockTasksList.mockReturnValue({ then: vi.fn() });
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
