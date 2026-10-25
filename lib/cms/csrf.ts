export function sameOrigin(request: Request) {
  const value = request.headers.get("origin");
  if (!value) return false;
  try {
    const origin = new URL(value);
    // Next may normalize request.url to localhost behind its internal server.
    // Host is browser-controlled only through the destination, unlike arbitrary
    // X-Forwarded-Host values. Permit HTTP solely for loopback development.
    return origin.origin === value && origin.host === request.headers.get("host") &&
      (origin.protocol === "https:" || (origin.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname)));
  } catch { return false; }
}
