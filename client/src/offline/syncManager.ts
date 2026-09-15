import { http, ApiError } from "../api/http";
import { offlineQueue } from "./db";
import type { QueueItem } from "./db";

const QUEUE_CHANGED_EVENT = "golf-offline-queue-changed";
const FLUSH_INTERVAL_MS = 30_000;

function notifyQueueChanged() {
  window.dispatchEvent(new CustomEvent(QUEUE_CHANGED_EVENT));
}

export function onQueueChanged(handler: () => void): () => void {
  window.addEventListener(QUEUE_CHANGED_EVENT, handler);
  return () => window.removeEventListener(QUEUE_CHANGED_EVENT, handler);
}

function endpointFor(kind: QueueItem["kind"]): string {
  return kind === "shot" ? "/shots" : "/putts";
}

let flushing = false;

export async function flushQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    const items = (await offlineQueue.all()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    let changed = false;

    for (const item of items) {
      try {
        await http.post(endpointFor(item.kind), item.payload);
        await offlineQueue.remove(item.id);
        changed = true;
      } catch (err) {
        if (err instanceof ApiError) {
          // Server rejected the data itself (bad club_id, validation, auth) — not worth retrying forever.
          console.warn(`Dropping queued ${item.kind} after server rejection:`, err.message);
          await offlineQueue.remove(item.id);
          changed = true;
        } else {
          // Still offline / network failure — leave it queued for the next attempt.
          await offlineQueue.update({ ...item, attempts: item.attempts + 1, lastError: String(err) });
        }
      }
    }

    if (changed) notifyQueueChanged();
  } finally {
    flushing = false;
  }
}

export async function enqueueForSync(kind: QueueItem["kind"], payload: unknown): Promise<void> {
  const item: QueueItem = {
    id: crypto.randomUUID(),
    kind,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  await offlineQueue.enqueue(item);
  notifyQueueChanged();
}

export function initSyncManager() {
  window.addEventListener("online", () => void flushQueue());
  window.addEventListener("load", () => void flushQueue());
  setInterval(() => void flushQueue(), FLUSH_INTERVAL_MS);
  void flushQueue();
}
