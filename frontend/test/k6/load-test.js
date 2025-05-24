import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "5s", target: 20 }, // 20 User innerhalb 30 Sek.
    { duration: "5s", target: 100 }, // Peak: 100 User für 1 Min.
    { duration: "5s", target: 0 }, // Cooldown
  ],
};

export default function () {
  const res = http.get("http://localhost:8080/");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "body contains title": (r) => r.body.includes("Secret Notes"),
  });
  sleep(1); // Simuliert User-Verhalten
}
