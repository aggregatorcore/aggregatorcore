// Use proxy (same-origin) in prod for Safari/iOS cookie support
const BASE =
  process.env.NEXT_PUBLIC_USE_PROXY === "true" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000");

const defaultOptions: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" },
};

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, { ...defaultOptions, method: "GET" });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...defaultOptions,
    method: "POST",
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...defaultOptions,
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPatch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...defaultOptions,
    method: "PATCH",
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
