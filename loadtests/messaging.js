import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 20,
  duration: "45s",
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const AUTH_HEADER = __ENV.AUTH_HEADER || "";

const headers = AUTH_HEADER ? { Authorization: AUTH_HEADER } : {};

export default function () {
  const inbox = http.get(`${BASE_URL}/api/messages/threads`, { headers });
  check(inbox, {
    "threads endpoint available": (r) => r.status < 500,
  });

  const requests = http.get(`${BASE_URL}/api/messages/requests?type=incoming`, { headers });
  check(requests, {
    "requests endpoint available": (r) => r.status < 500,
  });

  sleep(1);
}
