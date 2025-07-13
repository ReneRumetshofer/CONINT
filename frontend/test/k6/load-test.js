import http from "k6/http";
import { check, group, sleep } from "k6";

export let options = {
  stages: [
    { duration: "5s", target: 10 },
    { duration: "10s", target: 50 },
    { duration: "5s", target: 0 },
  ],
};

const BASE_URL = __ENV.BACKEND_GREEN || "http://localhost:3000/api";

export default function () {
  group("Notiz erstellen → abrufen → löschen", () => {
    // 1. Notiz erstellen
    const payload = JSON.stringify({
      title: `Titel ${__VU}-${__ITER}`,
      content: "Dies ist ein Loadtest-Inhalt",
      key: "k6testkey",
    });

    const headers = { "Content-Type": "application/json" };

    const postRes = http.post(`${BASE_URL}/notes`, payload, { headers });

    check(postRes, {
      "Notiz erfolgreich erstellt": (res) => res.status === 200,
    });

    if (postRes.status !== 200) return;

    let uuid;
    try {
      uuid = postRes.json().notes_uuid;
    } catch (e) {
      return;
    }

    // 2. Notiz abrufen mit Key
    const getRes = http.get(`${BASE_URL}/notes/${uuid}?key=k6testkey`);
    check(getRes, {
      "Notiz abrufbar": (res) => res.status === 200,
    });

    // 3. Notiz abrufen mit falschem Key
    const wrongKeyRes = http.get(`${BASE_URL}/notes/${uuid}?key=falsch`);
    check(wrongKeyRes, {
      "Fehler bei falschem Key": (res) =>
        res.status === 401 || res.status === 403,
    });

    // 4. Notiz löschen
    const delRes = http.del(`${BASE_URL}/notes/${uuid}`);
    check(delRes, {
      "Notiz geloescht": (res) => res.status === 200 || res.status === 204,
    });

    sleep(1);
  });
}
