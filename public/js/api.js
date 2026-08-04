/* ============================================================
   CLIENTE API (fetch a la API REST del servidor)
   ============================================================ */

export async function apiGet(url) {
  const r = await fetch(url);
  const j = await r.json();
  if (!j.success) throw new Error(j.message);
  return j.data;
}

export async function apiSend(method, url, body) {
  const r = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!j.success) throw new Error(j.message);
  return j.data;
}
