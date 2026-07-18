import Dexie, { type Table } from "dexie";
import type { Session } from "@/lib/types";

export interface Mutation {
  id?: number;
  entity: "session";
  payload: Session;
}

export class WayneDB extends Dexie {
  sessions!: Table<Session, string>;
  mutations!: Table<Mutation, number>;

  constructor() {
    super("wayne");
    this.version(1).stores({
      sessions: "id, date, dayKey",
      bodyweights: "id, date",
      mutations: "++id, entity",
    });
    // v2: bodyweight tracking removed — drop the table.
    this.version(2).stores({
      bodyweights: null,
    });
  }
}

export const db = new WayneDB();
