
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Memory, Person } from '../types';

interface MemoryCircleDB extends DBSchema {
  memories: {
    key: string;
    value: Memory;
  };
  people: {
    key: string;
    value: Person;
  };
}

const DB_NAME = 'memory-circle-db';
const DB_VERSION = 1;

class StorageService {
  private dbPromise: Promise<IDBPDatabase<MemoryCircleDB>>;

  constructor() {
    this.dbPromise = openDB<MemoryCircleDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('memories')) {
          db.createObjectStore('memories', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('people')) {
          db.createObjectStore('people', { keyPath: 'id' });
        }
      },
    });
  }

  async migrateFromLocalStorage(): Promise<boolean> {
    const db = await this.dbPromise;
    const memoriesRaw = localStorage.getItem('mc_memories');
    const peopleRaw = localStorage.getItem('mc_people');
    let migrated = false;

    if (memoriesRaw) {
      try {
        const memories = JSON.parse(memoriesRaw) as Memory[];
        const tx = db.transaction('memories', 'readwrite');
        const store = tx.objectStore('memories');
        for (const memory of memories) {
          await store.put(memory);
        }
        await tx.done;
        localStorage.removeItem('mc_memories');
        migrated = true;
        console.log('Migrated memories from LocalStorage to IndexedDB');
      } catch (e) {
        console.error('Failed to migrate memories', e);
      }
    }

    if (peopleRaw) {
      try {
        const people = JSON.parse(peopleRaw) as Person[];
        const tx = db.transaction('people', 'readwrite');
        const store = tx.objectStore('people');
        for (const person of people) {
          await store.put(person);
        }
        await tx.done;
        localStorage.removeItem('mc_people');
        migrated = true;
        console.log('Migrated people from LocalStorage to IndexedDB');
      } catch (e) {
        console.error('Failed to migrate people', e);
      }
    }

    return migrated;
  }

  // --- Memories ---

  async getMemories(): Promise<Memory[]> {
    const db = await this.dbPromise;
    return db.getAll('memories');
  }

  async saveMemory(memory: Memory): Promise<void> {
    const db = await this.dbPromise;
    await db.put('memories', memory);
  }

  async deleteMemory(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('memories', id);
  }

  // --- People ---

  async getPeople(): Promise<Person[]> {
    const db = await this.dbPromise;
    return db.getAll('people');
  }

  async savePerson(person: Person): Promise<void> {
    const db = await this.dbPromise;
    await db.put('people', person);
  }

  async deletePerson(id: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('people', id);
  }
  async clearAll(): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(['memories', 'people'], 'readwrite');
    await tx.objectStore('memories').clear();
    await tx.objectStore('people').clear();
    await tx.done;
  }

  async restoreData(memories: Memory[], people: Person[]): Promise<void> {
    await this.clearAll();
    const db = await this.dbPromise;
    const tx = db.transaction(['memories', 'people'], 'readwrite');

    const memoryStore = tx.objectStore('memories');
    for (const m of memories) {
      await memoryStore.put(m);
    }

    const peopleStore = tx.objectStore('people');
    for (const p of people) {
      await peopleStore.put(p);
    }

    await tx.done;
  }
}

export const storageService = new StorageService();
