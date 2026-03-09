/**
 * src/database/initDatabase.ts
 *
 * Opens (or creates) the local Bible verse cache.
 *
 * Schema (version 3)
 * ──────────────────
 * verse_cache (translation, book_id, chapter, verse, text, cached_at)
 *   PK: (translation, book_id, chapter, verse)
 *
 * downloaded_translations (translation PK, downloaded_at)
 *   Tracks which translations have been fully bulk-downloaded for offline use.
 *
 * Migration: previous versions → version 3 drops and recreates both tables.
 * verse_cache loss is acceptable (re-downloadable). downloaded_translations
 * is new in v3.
 */

import * as SQLite from 'expo-sqlite';

const DB_NAME    = 'bible_cache.db';
const DB_VERSION = 3;

let _db: SQLite.SQLiteDatabase | null = null;

/** Returns a singleton SQLiteDatabase, creating/migrating tables on first launch. */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  _db = await SQLite.openDatabaseAsync(DB_NAME);

  // Read current schema version
  const vRow = await _db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = vRow?.user_version ?? 0;

  if (currentVersion < DB_VERSION) {
    // Drop old tables (cache loss acceptable — everything is re-downloadable)
    await _db.execAsync('DROP TABLE IF EXISTS verse_cache;');
    await _db.execAsync('DROP TABLE IF EXISTS downloaded_translations;');
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

    CREATE TABLE IF NOT EXISTS downloaded_translations (
      translation   TEXT    NOT NULL PRIMARY KEY,
      downloaded_at INTEGER NOT NULL
    );

    PRAGMA user_version = ${DB_VERSION};
  `);

  return _db;
}

/** Resets the singleton — useful for testing. */
export function resetDatabase(): void {
  _db = null;
}

