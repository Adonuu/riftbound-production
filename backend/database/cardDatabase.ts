import { Database } from "bun:sqlite";
import { join } from "path";

const db = new Database(join(import.meta.dir, "cards.db"), { create: true });

db.run(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    tcgId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    artType TEXT NOT NULL,
    imageUrl TEXT NOT NULL
  )
`);

export default db;