"use client";

// Use proxy (same-origin) in prod for Safari/iOS cookie support
const BASE =
  process.env.NEXT_PUBLIC_USE_PROXY === "true" ? "" : (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000");

export async function checkSession(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await fetch(`${BASE}/api/admin/session`, { credentials: "include" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function login(password: string): Promise<void> {
  const res = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Invalid password");
  }
}

export async function logout(): Promise<void> {
  await fetch(`${BASE}/api/admin/logout`, {
    method: "POST",
    credentials: "include",
  });
}
