const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;

if (!rawApiUrl) {
  throw new Error("VITE_API_URL is missing from the frontend environment.");
}

const API_URL = rawApiUrl.replace(/\/+$/, "");

function buildHeaders(includeAuth = true): HeadersInit {
  const token = localStorage.getItem("auth_token");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(includeAuth && token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      const message =
        data?.message ||
        data?.error ||
        data?.title ||
        JSON.stringify(data);
      throw new Error(message || "Request failed");
    }

    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}

export async function apiGet<TRes>(path: string, includeAuth = true): Promise<TRes> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: buildHeaders(includeAuth),
  });

  return handleResponse<TRes>(res);
}

export async function apiPost<TReq, TRes>(
  path: string,
  body: TReq,
  includeAuth = true
): Promise<TRes> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(includeAuth),
    body: JSON.stringify(body),
  });

  return handleResponse<TRes>(res);
}

export async function apiPut<TReq, TRes>(
  path: string,
  body: TReq,
  includeAuth = true
): Promise<TRes> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: buildHeaders(includeAuth),
    body: JSON.stringify(body),
  });

  return handleResponse<TRes>(res);
}

export { API_URL };