import { getAuthToken, getStoredUserId } from "../auth/auth.api";
import {
  parseLatestApplicationState,
  type LatestApplicationStateResponse,
} from "./applicationStateTypes";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "https://localhost:7113";

const APPLICATION_UPDATES_EVENT_NAME = "applicationUpdates";
const LAST_EVENT_ID_STORAGE_KEY_PREFIX = "applicationUpdates:lastEventId";
const SNAPSHOT_CACHE_STORAGE_KEY_PREFIX = "applicationUpdates:latestSnapshots";

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
  let lastEventId: string | null = readStoredLastEventId();

  const buildStreamUrl = () => {
    const url = new URL(`${API_BASE}/api/eventEmmitter/aplicationUpdates`);
    for (const applicationId of applicationIds) {
      url.searchParams.append("applicationIds", applicationId);
    }
    return url.toString();
  };

  const streamWithResponse = async (response: Response) => {
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
          writeStoredLastEventId(parsed.id);
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

        let rawPayload: unknown;
        try {
          rawPayload = JSON.parse(parsed.data);
        } catch {
          continue;
        }

        const payload = parseLatestApplicationState(rawPayload);
        if (!payload) {
          continue;
        }

        cacheLatestSnapshot(payload);
        options.onMessage(payload);
      }
    }
  };

  const openStream = async (signal: AbortSignal) => {
    const token = getAuthToken();
    const baseHeaders: HeadersInit = {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}),
    };

    const getResponse = await fetch(buildStreamUrl(), {
      method: "GET",
      headers: baseHeaders,
      signal,
    });

      return getResponse;
  };

  const connect = async () => {
    if (disposed) return;

    controller = new AbortController();

    try {
      const response = await openStream(controller.signal);
      await streamWithResponse(response);
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

function readStoredLastEventId(): string | null {
  try {
    const value = window.localStorage.getItem(getLastEventIdStorageKey());
    return value && value.trim().length > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeStoredLastEventId(lastEventId: string): void {
  try {
    window.localStorage.setItem(getLastEventIdStorageKey(), lastEventId);
  } catch {
    // Ignore storage failures and continue streaming in-memory.
  }
}

function cacheLatestSnapshot(state: LatestApplicationStateResponse): void {
  try {
    const raw = window.localStorage.getItem(getSnapshotCacheStorageKey());
    const cache =
      raw && typeof raw === "string"
        ? (JSON.parse(raw) as Record<string, LatestApplicationStateResponse>)
        : {};

    cache[state.applicationId] = state;
    window.localStorage.setItem(getSnapshotCacheStorageKey(), JSON.stringify(cache));
  } catch {
    // Ignore cache write errors.
  }
}

function getLastEventIdStorageKey(): string {
  const userId = getStoredUserId() ?? "anonymous";
  return `${LAST_EVENT_ID_STORAGE_KEY_PREFIX}:${userId}`;
}

function getSnapshotCacheStorageKey(): string {
  const userId = getStoredUserId() ?? "anonymous";
  return `${SNAPSHOT_CACHE_STORAGE_KEY_PREFIX}:${userId}`;
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
