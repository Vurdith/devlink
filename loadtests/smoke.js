import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,
  duration: "30s",
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export default function () {
  const home = http.get(`${BASE_URL}/home`);
  check(home, {
    "home is healthy": (r) => r.status === 200 || r.status === 302,
  });

  const feed = http.get(`${BASE_URL}/api/posts`);
  check(feed, {
    "posts api responds": (r) => r.status < 500,
  });

  const search = http.get(`${BASE_URL}/api/search/posts?q=dev`);
  check(search, {
    "search api responds": (r) => r.status < 500,
  });

  sleep(1);
}
