import * as SQLite from "expo-sqlite";
export const DATABASE_NAME = "password_manager.db";
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!dbPromise) {
        dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
    }
    return dbPromise;
}

export async function initializeDatabase():Promise<void>{
    const db = await getDatabase();

    await db.execAsync(`
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS vault_header (
        id TEXT PRIMARY KEY NOT NULL,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NULL
        );

        CREATE TABLE IF NOT EXISTS vault_records(
        id TEXT PRIMARY KEY NOT NULL,
        schemaVersion INTEGER NOT NULL,
        encryptionVersion INTEGER NOT NULL,
        encryptionAlgorithm TEXT NOT NULL,
        encryptedPayload TEXT NOT NULL,
        nonce TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NULL,
        deletedAt TEXT NULL
        );

        CREATE TABLE IF NOT EXISTS history_records(
        id TEXT PRIMARY KEY NOT NULL,
        schemaVersion INTEGER NOT NULL,
        encryptionVersion INTEGER NOT NULL,
        encryptedPayload TEXT NOT NULL,
        nonce TEXT NOT NULL,
        createdAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS app_settings(
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updatedAt TEXT NOT NULL
        );
    `);
}
