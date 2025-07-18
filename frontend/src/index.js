const API_HOSTS = {
  localhost: "http://localhost:3000/api",
  "staging.conint-securenotes.online":
    "https://staging.conint-securenotes.online/api",
  "prod.conint-securenotes.online":
    "https://prod.conint-securenotes.online/api",
  "frontend-green": "http://backend-green:3000/api",
};

const hostname = window.location.hostname;
const API = API_HOSTS[hostname];

async function loadNotes() {
  const res = await fetch(`${API}/notes`);
  const notes = await res.json();
  const container = document.getElementById("notes");
  container.innerHTML = "";
  notes.forEach((note) => {
    const div = document.createElement("div");
    div.className = "note";
    div.innerHTML = `
    <strong>${note.title}</strong><br />
    UUID: ${note.notes_uuid}<br />
    <input type="text" placeholder="Key eingeben" id="key-${note.notes_uuid}" />
    <button id="show-${note.notes_uuid}">Anzeigen</button>
    <button id="del-${note.notes_uuid}">Löschen</button>
    <pre id="content-${note.notes_uuid}"></pre>
  `;
    container.appendChild(div);

    document
      .getElementById(`show-${note.notes_uuid}`)
      .addEventListener("click", () => loadNote(note.notes_uuid));
    document
      .getElementById(`del-${note.notes_uuid}`)
      .addEventListener("click", () => deleteNote(note.notes_uuid));
  });
}

async function loadNote(uuid) {
  const key = document.getElementById(`key-${uuid}`).value;
  const res = await fetch(
    `${API}/notes/${uuid}?key=${encodeURIComponent(key)}`,
  );
  const contentBox = document.getElementById(`content-${uuid}`);
  if (res.ok) {
    contentBox.textContent = await res.text();
  } else {
    contentBox.textContent = `Fehler: ${res.status} ${await res.text()}`;
  }
}

async function deleteNote(uuid) {
  await fetch(`${API}/notes/${uuid}`, { method: "DELETE" });
  await loadNotes();
}

async function initializeDOMInteractions(isLoadNotes) {
  document
    .getElementById("newNoteForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("newTitle").value;
      const content = document.getElementById("newContent").value;
      const key = document.getElementById("newKey").value;

      const res = await fetch(`${API}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, key }),
      });

      if (res.ok) {
        alert("Notiz erstellt!");
        document.getElementById("newNoteForm").reset();
        await loadNotes();
      } else {
        alert("Fehler beim Erstellen der Notiz.");
      }
    });
  if (typeof posthog !== "undefined") {
    /* eslint-disable no-undef */
    posthog.onFeatureFlags(() => {
      const variant = posthog.getFeatureFlag("new-ui-theme");
      /* eslint-enable no-undef */
      const button = document.getElementById("createNote");
      if (button) {
        if (variant === "variant") {
          button.style.backgroundColor = "green";
        } else if (variant === "control") {
          button.style.backgroundColor = "blue";
        }
      }
    });
  }

  if (isLoadNotes) {
    await loadNotes();
  }
}

window.initializeDOMInteractions = initializeDOMInteractions;

/* eslint-disable no-undef */
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = {
    initializeDOMInteractions,
    loadNotes,
    loadNote,
    deleteNote,
  };
}
/* eslint-enable no-undef */
