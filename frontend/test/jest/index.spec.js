const {
  initializeDOMInteractions,
  loadNotes,
  loadNote,
  deleteNote,
} = require("../../src/index.js");

beforeEach(() => {
  document.body.innerHTML = `
    <form id="newNoteForm">
      <input id="newTitle" />
      <input id="newContent" />
      <input id="newKey" />
      <button type="submit">Submit</button>
    </form>
    <div id="notes">
      <div class="note">
        <strong>Test Note 3</strong><br>
        UUID: 789<br>
        <input type="text" placeholder="Key eingeben" id="key-789">
        <button id="show-789">Anzeigen</button>
        <button id="del-789">Löschen</button>
        <pre id="content-789"></pre>
      </div>
    </div>
  `;

  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
    }),
  );

  initializeDOMInteractions(false);
});

afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = "";
});

describe("Testing notes functionality", () => {
  test("loadNotes should load notes and display them", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { notes_uuid: "123", title: "Test Note 1" },
        { notes_uuid: "456", title: "Test Note 2" },
      ],
    });

    await loadNotes();

    expect(document.querySelectorAll(".note").length).toBe(2);
    expect(document.querySelector(".note").textContent).toContain(
      "Test Note 1",
    );
  });

  test("loadNote should display the content of a note", async () => {
    const uuid = "789";
    const content = "This is the content of the note";

    fetch.mockResolvedValueOnce({
      ok: true,
      text: async () => content,
    });

    await loadNote(uuid);

    expect(document.getElementById(`content-${uuid}`).textContent).toBe(
      content,
    );
  });

  test("loadNote should not display the content of a note", async () => {
    const uuid = "789";
    const content = "403 Key is invalid";

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => content,
    });

    await loadNote(uuid);

    expect(document.getElementById(`content-${uuid}`).textContent).toBe(
      `Fehler: 403 ${content}`,
    );
  });

  test("deleteNote should delete the note and reload notes", async () => {
    const uuid = "123";

    fetch.mockResolvedValueOnce({ ok: true });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ notes_uuid: "456", title: "Test Note 2" }],
    });

    await deleteNote(uuid);

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(document.querySelectorAll(".note").length).toBe(1);
  });
});
