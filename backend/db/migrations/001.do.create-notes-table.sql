CREATE TABLE notes (
    notes_uuid UUID PRIMARY KEY,
    hmac TEXT NOT NULL,
    content TEXT NOT NULL
);