import { getAuthToken } from "../auth/auth.api";
import type { LatestApplicationStateResponse } from "./applicationStateTypes";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://localhost:7113";

const APPLICATION_UPDATES_EVENT_NAME = "applicationUpdates";

export type ApplicationStateStreamOptions = {
  clientId: string;
  applicationIds: string[];
  onMessage: (message: LatestApplicationStateResponse) => void;
  onError?: (error: unknown) => void;
};

export function createRealtimeClientId(): string {
  return crypto.randomUUID();
}

export function subscribeToApplicationStates(
  options: ApplicationStateStreamOptions,
): () => void {
  const applicationIds = Array.from(
    new Set(options.applicationIds.map((id) => id.trim()).filter(Boolean)),
  );

  if (applicationIds.length === 0) {
    return () => undefined;
  }

  let disposed = false;
  let controller: AbortController | null = null;
  let reconnectTimer: number | null = null;
  let lastEventId: string | null = null;

  const connect = async () => {
    if (disposed) return;

    controller = new AbortController();

    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        applicationIds: applicationIds.join(","),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      if (lastEventId) {
        headers["Last-Event-ID"] = lastEventId;
      }

      const response = await fetch(
        `${API_BASE}/api/eventEmmitter/aplicationUpdates`,
        {
          method: "GET",
          headers,
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `SSE request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("SSE response body is empty.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (!disposed) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split(/\r?\n\r?\n/);
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const parsed = parseSseEvent(part);
          if (!parsed) continue;

          if (parsed.id) {
            lastEventId = parsed.id;
          }

          if (
            parsed.eventName &&
            parsed.eventName !== APPLICATION_UPDATES_EVENT_NAME
          ) {
            continue;
          }

          if (!parsed.data) {
            continue;
          }

          const payload = JSON.parse(parsed.data) as LatestApplicationStateResponse;
          options.onMessage(payload);
        }
      }
    } catch (error) {
      if (disposed || (error instanceof DOMException && error.name === "AbortError")) {
        return;
      }

      options.onError?.(error);
    }

    if (!disposed) {
      reconnectTimer = window.setTimeout(() => {
        void connect();
      }, 1500);
    }
  };

  void connect();

  return () => {
    disposed = true;

    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
    }

    controller?.abort();
  };
}

type ParsedSseEvent = {
  eventName: string | null;
  data: string;
  id: string | null;
};

function parseSseEvent(rawEvent: string): ParsedSseEvent | null {
  const lines = rawEvent.split(/\r?\n/);

  let eventName: string | null = null;
  let id: string | null = null;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (!line || line.startsWith(":")) {
      continue;
    }

    if (line.startsWith("event:")) {
      eventName = line.slice("event:".length).trim();
      continue;
    }

    if (line.startsWith("id:")) {
      id = line.slice("id:".length).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trimStart());
    }
  }

  if (!eventName && dataLines.length === 0 && !id) {
    return null;
  }

  return {
    eventName,
    data: dataLines.join("\n"),
    id,
  };
}
