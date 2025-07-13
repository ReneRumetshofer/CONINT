const {
  initializeDOMInteractions,
  loadNotes,
  loadNote,
  deleteNote,
} = require("../../src/js/index.js");

beforeEach(() => {
  document.body.innerHTML = `
    <form id="newNoteForm">
      <input id="newTitle" />
      <input id="newContent" />
      <input id="newKey" />
      <button type="submit">Submit</button>
    </form>
    <div id="notes"></div>
  `;

  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([]),
    }),
  );

  initializeDOMInteractions();
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
    const uuid = "123";
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
