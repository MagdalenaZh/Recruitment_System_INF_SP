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

type StreamSubscription = {
  applicationIds: Set<string>;
  onMessage: (message: LatestApplicationStateResponse) => void;
  onError?: (error: unknown) => void;
};

export function createRealtimeClientId(): string {
  return crypto.randomUUID();
}

export function subscribeToApplicationStates(
  options: ApplicationStateStreamOptions,
): () => void {
  return applicationStateStreamManager.subscribe(options);
}

class ApplicationStateStreamManager {
  private readonly subscriptions = new Map<string, StreamSubscription>();
  private controller: AbortController | null = null;
  private reconnectTimer: number | null = null;
  private idleDisconnectTimer: number | null = null;
  private lastEventId: string | null = readStoredLastEventId();
  private activeKey = "";
  private connectionGeneration = 0;

  subscribe(options: ApplicationStateStreamOptions): () => void {
    const applicationIds = normalizeApplicationIds(options.applicationIds);

    if (applicationIds.length === 0) {
      return () => undefined;
    }

    const key = `${options.clientId}:${crypto.randomUUID()}`;
    this.subscriptions.set(key, {
      applicationIds: new Set(applicationIds),
      onMessage: options.onMessage,
      onError: options.onError,
    });

    this.clearIdleDisconnectTimer();
    this.refreshConnection();

    return () => {
      this.subscriptions.delete(key);
      this.refreshConnection();
    };
  }

  private refreshConnection(): void {
    const nextApplicationIds = this.getTrackedApplicationIds();
    const nextKey = nextApplicationIds.join(",");

    if (nextApplicationIds.length === 0) {
      this.scheduleIdleDisconnect();
      return;
    }

    this.clearIdleDisconnectTimer();

    if (this.activeKey === nextKey && this.controller) {
      return;
    }

    this.activeKey = nextKey;
    this.abortCurrentConnection();
    void this.connect(nextApplicationIds);
  }

  private async connect(applicationIds: string[]): Promise<void> {
    if (applicationIds.length === 0) {
      return;
    }

    const generation = ++this.connectionGeneration;
    const controller = new AbortController();
    this.controller = controller;

    try {
      const response = await this.openStream(applicationIds, controller.signal);
      await this.streamWithResponse(response, generation);
    } catch (error) {
      if (
        controller.signal.aborted ||
        (error instanceof DOMException && error.name === "AbortError")
      ) {
        return;
      }

      this.notifyError(error);
    } finally {
      if (this.controller === controller) {
        this.controller = null;
      }
    }

    const currentApplicationIds = this.getTrackedApplicationIds();
    const currentKey = currentApplicationIds.join(",");

    if (
      this.subscriptions.size > 0 &&
      currentApplicationIds.length > 0 &&
      this.activeKey === currentKey &&
      generation === this.connectionGeneration
    ) {
      this.reconnectTimer = window.setTimeout(() => {
        this.reconnectTimer = null;
        void this.connect(currentApplicationIds);
      }, 1500);
    }
  }

  private async openStream(
    applicationIds: string[],
    signal: AbortSignal,
  ): Promise<Response> {
    const token = getAuthToken();
    const headers: HeadersInit = {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(this.lastEventId ? { "Last-Event-ID": this.lastEventId } : {}),
    };

    const response = await fetch(buildStreamUrl(applicationIds), {
      method: "GET",
      headers,
      signal,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `SSE request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error("SSE response body is empty.");
    }

    return response;
  }

  private async streamWithResponse(
    response: Response,
    generation: number,
  ): Promise<void> {
    if (!response.body) {
      throw new Error("SSE response body is empty.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();

      if (done || generation !== this.connectionGeneration) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split(/\r?\n\r?\n/);
      buffer = parts.pop() ?? "";

      for (const part of parts) {
        const parsed = parseSseEvent(part);
        if (!parsed) continue;

        if (parsed.id) {
          this.lastEventId = parsed.id;
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
        this.notifyMessage(payload);
      }
    }
  }

  private notifyMessage(payload: LatestApplicationStateResponse): void {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.applicationIds.has(payload.applicationId)) {
        subscription.onMessage(payload);
      }
    }
  }

  private notifyError(error: unknown): void {
    for (const subscription of this.subscriptions.values()) {
      subscription.onError?.(error);
    }
  }

  private getTrackedApplicationIds(): string[] {
    const ids = new Set<string>();
    for (const subscription of this.subscriptions.values()) {
      for (const applicationId of subscription.applicationIds) {
        ids.add(applicationId);
      }
    }

    return Array.from(ids).sort();
  }

  private abortCurrentConnection(): void {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.controller?.abort();
    this.controller = null;
  }

  private scheduleIdleDisconnect(): void {
    if (this.idleDisconnectTimer !== null) {
      return;
    }

    this.idleDisconnectTimer = window.setTimeout(() => {
      this.idleDisconnectTimer = null;
      if (this.subscriptions.size === 0) {
        this.activeKey = "";
        this.abortCurrentConnection();
      }
    }, 15000);
  }

  private clearIdleDisconnectTimer(): void {
    if (this.idleDisconnectTimer !== null) {
      window.clearTimeout(this.idleDisconnectTimer);
      this.idleDisconnectTimer = null;
    }
  }
}

const applicationStateStreamManager = new ApplicationStateStreamManager();

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

function normalizeApplicationIds(applicationIds: string[]): string[] {
  return Array.from(new Set(applicationIds.map((id) => id.trim()).filter(Boolean))).sort();
}

function buildStreamUrl(applicationIds: string[]): string {
  const url = new URL(`${API_BASE}/api/eventEmmitter/aplicationUpdates`);
  for (const applicationId of applicationIds) {
    url.searchParams.append("applicationIds", applicationId);
  }
  return url.toString();
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
