import Dexie, { type Table } from "dexie";
import type { Session, BodyweightEntry } from "@/lib/types";

export interface Mutation {
  id?: number;
  entity: "session" | "bodyweight";
  payload: Session | BodyweightEntry;
}

export class WayneDB extends Dexie {
  sessions!: Table<Session, string>;
  bodyweights!: Table<BodyweightEntry, string>;
  mutations!: Table<Mutation, number>;

  constructor() {
    super("wayne");
    this.version(1).stores({
      sessions: "id, date, dayKey",
      bodyweights: "id, date",
      mutations: "++id, entity",
    });
  }
}

export const db = new WayneDB();
