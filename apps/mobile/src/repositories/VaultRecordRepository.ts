import type { Result, LocalVaultRecordV1 } from "@password-manager/shared-types";
import { getDatabase } from "./database";

export class VaultRecordRepository{
    async create(record: LocalVaultRecordV1): Promise<Result<void>>{
        try {
            const db = await getDatabase();
            await db.runAsync(
                `
                INSERT INTO vault_records(
                id,
                schemaVersion,
                encryptionVersion,
                encryptedPayload,
                nonce,
                createdAt,
                updatedAt,
                deletedAt)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?);
                `,
                [
                    record.id,
                    record.schemaVersion,
                    record.encryptionVersion,
                    record.encryptedPayload,
                    record.nonce,
                    record.createdAt,
                    record.updatedAt,
                    record.deletedAt ?? null,
                ]
            );
            return{
                ok: true,
                value:undefined
            };
        } catch (cause) {
            return {
                ok: false,
                error: {
                    code: "DATABASE_ERROR",
                    message: "Failed to create vault record.",
                    cause
                },
            };
        }
    }
    async getById(id: string): Promise<Result<LocalVaultRecordV1 | null>>{
        try {
            const db = await getDatabase();

            const row = await db.getFirstAsync<LocalVaultRecordV1>(
                `SELECT * FROM vault_records WHERE id = ? LIMIT 1;`,
                [id]
            );
            return{
                ok:true,
                value: row ?? null,
            };
        } catch (cause) {
            return {
                ok : false,
                error:{
                    code: "DATABASE_ERROR",
                    message:"Failed to read vault record.",
                    cause
                },
            };
        }
    }

    async listActive(): Promise<Result<LocalVaultRecordV1[]>>{
        try {
            const db = await getDatabase();
            const rows = await db.getAllAsync<LocalVaultRecordV1>(
                `
                SELECT * 
                FROM vault_records
                WHERE deletedAt IS NULL
                ORDER BY updatedAt DESC; 
                `
            );
            return {
                ok: true,
                value: rows,
            };
        } catch (cause) {
            return{
                ok:false,
                error: {
                    code: "DATABASE_ERROR",
                    message:"Failed to list active vault record.",
                    cause
                },
            };
        }
    }
    async listDeleted(): Promise<Result<LocalVaultRecordV1[]>>{
        try {
            const db = await getDatabase();

            const rows = await db.getAllAsync<LocalVaultRecordV1>(
                `
                SELECT * 
                FROM vault_records
                WHERE deletedAt IS NOT NULL
                ORDER BY deletedAt DESC;
                `
            );
            return{
                ok:true,
                value: rows,
            }
        } catch (cause) {
            return{
                ok:false,
                error: {
                    code: "DATABASE_ERROR",
                    message: "Failed to list deleted vault records.",
                    cause,
                },
            };
        }
    }
    async update(record: LocalVaultRecordV1): Promise<Result<void>>{
        try { 
            const db = await getDatabase();

            await db.runAsync(
                `
                UPDATE vault_records
                SET
                  schemaVersion = ?,
                  encryptionVersion = ?,
                  encryptedPayload = ?,
                  nonce = ?,
                  updatedAt = ?,
                  deletedAt = ? WHERE id = ?;
                `,
                [
                    record.schemaVersion,
                    record.encryptionVersion,
                    record.encryptedPayload,
                    record.nonce,
                    record.updatedAt,
                    record.deletedAt ?? null,
                    record.id,
                ]
            );
            return { 
                ok: true,
                value: undefined
            }
        } catch (cause) {
            return {
                ok: false,
                error:{
                    code:"DATABASE_ERROR",
                    message:"Failed to update vault record.",
                    cause
                },
            };
        }
    }

    async deletePermanently(id: string): Promise<Result<void>>{
        try {
            const db = await getDatabase();
            await db.runAsync(`DELETE FROM vault_records WHERE id = ?`,[id]);
            return{
                ok:true,
                value: undefined,
            }
        } catch (cause) {
            return{
                ok:false,
                error:{
                    code:"DATABASE_ERROR",
                    message: "Failed to permanently delete vault record.",
                    cause
                },
            };
        }
    }
}