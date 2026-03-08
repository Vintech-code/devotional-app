/**
 * src/database/initDatabase.ts
 *
 * Opens (or creates) the local Bible verse cache.
 *
 * Schema (version 2)
 * ──────────────────
 * verse_cache (translation, book_id, chapter, verse, text, cached_at)
 *   PK: (translation, book_id, chapter, verse)
 *
 * `translation` is included in the primary key so each Bible translation
 * gets its own cached copy of every chapter.
 *
 * Migration: version 1 (no translation column) → version 2 is handled
 * by dropping and recreating the table — cache data loss is acceptable
 * since all content is re-downloadable.
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME    = 'bible_cache.db';
const DB_VERSION = 2;

let _db: SQLite.SQLiteDatabase | null = null;

/** Returns a singleton SQLiteDatabase, creating/migrating tables on first launch. */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  _db = await SQLite.openDatabaseAsync(DB_NAME);

  // Read current schema version
  const vRow = await _db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = vRow?.user_version ?? 0;

  if (currentVersion < DB_VERSION) {
    // Drop old table (acceptable — it's a download cache, not user data)
    await _db.execAsync('DROP TABLE IF EXISTS verse_cache;');
  }

  await _db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS verse_cache (
      translation TEXT    NOT NULL,
      book_id     INTEGER NOT NULL,
      chapter     INTEGER NOT NULL,
      verse       INTEGER NOT NULL,
      text        TEXT    NOT NULL,
      cached_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      PRIMARY KEY (translation, book_id, chapter, verse)
    );

    PRAGMA user_version = ${DB_VERSION};
  `);

  return _db;
}

/** Resets the singleton — useful for testing. */
export function resetDatabase(): void {
  _db = null;
}

