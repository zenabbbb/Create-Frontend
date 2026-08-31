const BASE_URL = "http://localhost:8080";

export async function request(path, { method = "GET", body } = {}) {
  const options = { method, headers: {} };

  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, options);

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      if (err?.message) message = err.message;
    } catch {}
    throw new Error(message);
  }

  // DELETE endpoints return 200 with empty body
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}