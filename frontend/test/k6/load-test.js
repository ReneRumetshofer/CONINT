import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "30s", target: 20 }, // 20 User innerhalb 30 Sek.
    { duration: "1m", target: 100 }, // Peak: 100 User für 1 Min.
    { duration: "30s", target: 0 }, // Cooldown
  ],
};

export default function () {
  const res = http.get("https://staging.secret-notes.example.com/");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "body contains title": (r) => r.body.includes("Secret Notes"),
  });
  sleep(1); // Simuliert User-Verhalten
}
