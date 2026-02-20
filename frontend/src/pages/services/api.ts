const API_URL = import.meta.env.VITE_API_URL as string;

export async function apiPost<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
  const token = localStorage.getItem("auth_token");

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  
  return (await res.json()) as TRes;
}