import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";

export interface QueueItem<T = unknown> {
  id: string;
  kind: "shot" | "putt";
  payload: T;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

interface OfflineDB extends DBSchema {
  queue: {
    key: string;
    value: QueueItem;
    indexes: { "by-kind": string };
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>("golf-practice-offline", 1, {
      upgrade(db) {
        db.createObjectStore("queue", { keyPath: "id" }).createIndex("by-kind", "kind");
      },
    });
  }
  return dbPromise;
}

export const offlineQueue = {
  async enqueue(item: QueueItem): Promise<void> {
    const db = await getDb();
    await db.put("queue", item);
  },

  async all(): Promise<QueueItem[]> {
    const db = await getDb();
    return db.getAll("queue");
  },

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.delete("queue", id);
  },

  async update(item: QueueItem): Promise<void> {
    const db = await getDb();
    await db.put("queue", item);
  },

  async count(): Promise<number> {
    const db = await getDb();
    return db.count("queue");
  },
};
