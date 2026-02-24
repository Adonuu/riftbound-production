import { Database } from "bun:sqlite";
import { join } from "path";

const db = new Database(join(import.meta.dir, "cards.db"), { create: true });

db.run(`
  CREATE TABLE IF NOT EXISTS arts (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
  )
`);

db.run(`
  INSERT OR IGNORE INTO arts (name) VALUES ('Normal')
`);

db.run(`
  INSERT OR IGNORE INTO arts (name) VALUES ('Alternate')
`);

db.run(`
  CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    tcgId TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    artTypeId INTEGER NOT NULL,
    imageUrl TEXT NOT NULL,
    FOREIGN KEY (artTypeId) REFERENCES arts(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS overlays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    showAnimation TEXT NOT NULL DEFAULT 'fade',
    showAnimationDirection TEXT,
    showAnimationDuration INTEGER NOT NULL DEFAULT 500,
    hideAnimation TEXT NOT NULL DEFAULT 'fade',
    hideAnimationDirection TEXT,
    hideAnimationDuration INTEGER NOT NULL DEFAULT 500,
    isOnPreview INTEGER NOT NULL DEFAULT 0,
    isOnOutput INTEGER NOT NULL DEFAULT 0
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    overlayId INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    x REAL NOT NULL DEFAULT 0,
    y REAL NOT NULL DEFAULT 0,
    width REAL NOT NULL DEFAULT 100,
    height REAL NOT NULL DEFAULT 100,
    zIndex INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (overlayId) REFERENCES overlays(id) ON DELETE CASCADE
  )
`);

export default db;