/**
 * API proxy for Safari/iOS compatibility.
 * Proxies /api/* to backend so requests are same-origin (cookies work on iOS).
 */
const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, await params);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, await params);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, await params);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, await params);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  return proxy(req, await params);
}

async function proxy(
  req: Request,
  params: { path?: string[] }
) {
  const path = params?.path?.join("/") || "";
  const url = `${BACKEND}/api/${path}${req.url.includes("?") ? "?" + new URL(req.url).searchParams.toString() : ""}`;

  const headers = new Headers();
  req.headers.forEach((v, k) => {
    if (!["host", "connection"].includes(k.toLowerCase())) {
      headers.set(k, v);
    }
  });

  const res = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
  });

  const resHeaders = new Headers();
  res.headers.forEach((v, k) => {
    if (k.toLowerCase() === "set-cookie") {
      // Rewrite: remove Domain so cookie is first-party (Safari/iOS fix)
      const rewritten = v.replace(/;\s*Domain=[^;]+/gi, "");
      resHeaders.append(k, rewritten);
    } else {
      resHeaders.set(k, v);
    }
  });

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: resHeaders,
  });
}
