import { test, expect } from "@playwright/test";

const BASE_URL = process.env.FRONTEND_GREEN || "http://localhost:80";

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
});

test("1. Seite lädt und zeigt Notizliste an (auch wenn leer)", async ({
  page,
}) => {
  const notesContainer = page.locator("#notes");
  const count = await notesContainer.locator(".note").count();
  expect(count).toBeGreaterThanOrEqual(0);
});

test("2. Neue Notiz erfolgreich erstellen", async ({ page }) => {
  const uniqueTitle = `Test Titel ${Date.now()}`;
  await page.fill("#newTitle", uniqueTitle);
  await page.fill("#newContent", "Testinhalt");
  await page.fill("#newKey", "1234");
  await page.click('button[type="submit"]');

  const newNote = page.locator(".note", { hasText: uniqueTitle });
  await expect(newNote).toBeVisible();
});

test("3. Neue Notiz mit fehlendem Key schlägt fehl", async ({ page }) => {
  await page.fill("#newTitle", "Ohne Key");
  await page.fill("#newContent", "Testinhalt");

  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toMatch(/Fehler beim Erstellen/i);
    await dialog.dismiss();
  });

  await page.click('button[type="submit"]');
});

test("4. Eine bestehende Notiz anzeigen mit richtigem Key", async ({
  page,
}) => {
  const note = page.locator(".note").first();
  const uuid = await note.locator('input[id^="key-"]').getAttribute("id");
  const uuidValue = uuid.replace("key-", "");
  await page.fill(`#key-${uuidValue}`, "1234"); // Passenden Key verwenden
  await page.click(`button:has-text("Anzeigen")`);
  await expect(page.locator(`#content-${uuidValue}`)).not.toBeEmpty();
});

test("5. Anzeige mit falschem Key zeigt Fehlermeldung", async ({ page }) => {
  const note = page.locator(".note").first();
  const uuid = await note.locator('input[id^="key-"]').getAttribute("id");
  const uuidValue = uuid.replace("key-", "");
  await page.fill(`#key-${uuidValue}`, "falscher-key");
  await page.click(`button:has-text("Anzeigen")`);
  await expect(page.locator(`#content-${uuidValue}`)).toContainText("Fehler");
});

test("6. Notiz löschen entfernt sie aus der Liste", async ({ page }) => {
  const initialCount = await page.locator(".note").count();
  if (initialCount === 0) test.skip();

  await page.locator('.note button:has-text("Löschen")').first().click();
  await expect(page.locator(".note")).toHaveCount(initialCount - 1);
});

test("7. Neue Notiz wird nach Erstellung in Liste angezeigt", async ({
  page,
}) => {
  const uniqueTitle = `Temporär ${Date.now()}`;
  await page.fill("#newTitle", uniqueTitle);
  await page.fill("#newContent", "Inhalt");
  await page.fill("#newKey", "abc");
  await page.click('button[type="submit"]');

  const note = page.locator(".note", { hasText: uniqueTitle });
  await expect(note).toBeVisible();
});

test("8. Felder werden nach erfolgreicher Notizerstellung geleert", async ({
  page,
}) => {
  await page.fill("#newTitle", "Zurücksetzen");
  await page.fill("#newContent", "Testinhalt");
  await page.fill("#newKey", "reset123");
  await page.click('button[type="submit"]');
  await expect(page.locator("#newTitle")).toHaveValue("");
  await expect(page.locator("#newContent")).toHaveValue("");
  await expect(page.locator("#newKey")).toHaveValue("");
});

test("9. Leerer Titel verhindert Erstellung der Notiz", async ({ page }) => {
  const initialCount = await page.locator(".note").count();

  await page.fill("#newContent", "Inhalt ohne Titel");
  await page.fill("#newKey", "nokey");

  await page.click('button[type="submit"]');

  // Kurz warten, falls die App asynchron etwas versucht
  await page.waitForTimeout(500);

  const finalCount = await page.locator(".note").count();
  expect(finalCount).toBe(initialCount);
});




test("10. Notiz löschen und sicherstellen, dass sie nicht mehr abrufbar ist", async ({
  page,
}) => {
  const uniqueTitle = `Zu löschen ${Date.now()}`;
  await page.fill("#newTitle", uniqueTitle);
  await page.fill("#newContent", "Löschen Test");
  await page.fill("#newKey", "deletekey");
  await page.click('button[type="submit"]');

  const note = page.locator(".note", { hasText: uniqueTitle });
  await expect(note).toBeVisible();

  await note.locator("button", { hasText: "Löschen" }).click();

  await expect(page.locator(".note", { hasText: uniqueTitle })).toHaveCount(0);
});
