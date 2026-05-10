import { Result , VaultHeaderV1 } from "@password-manager/shared-types"; 
import { getDatabase } from "./database";

const VAULT_HEADER_ID = "local-vault-header";

export class VaultHeaderRepository{
    async get(): Promise<Result<VaultHeaderV1 | null>>{
            try {
            const db = await getDatabase();

            const row = await db.getFirstAsync<{
                data: string;
            }>(
                `SELECT data FROM vault_header WHERE id = ? LIMIT 1;`,
                [VAULT_HEADER_ID]
            );
            if(!row){
                return{
                    ok: true,
                    value:null,
                };
            }
            return{
                ok: true,
                value: JSON.parse(row.data) as VaultHeaderV1,
            };
            } catch (cause) {
             return {
                ok: false,
                error:{
                    code: "DATABASE_ERROR",
                    message: "Failed to read vault header.",
                    cause
                },
             };
        }
    }

    async save(header: VaultHeaderV1): Promise<Result<void>>{
        try {
            const db = await getDatabase();

            await db.runAsync(
                `
                INSERT OR REPLACE INTO vault_header (
                id,
                data,
                createdAt,
                updatedAt
                )
                VALUES (?, ?, ?, ?);`,[
                    VAULT_HEADER_ID,
                    JSON.stringify(header),
                    header.createdAt,
                    header.updatedAt,
                ]
            );
            return {
                ok:true,
                value: undefined,
            };
        } catch (cause) {
            return {
                ok:false,
                error:{
                    code: "DATABASE_ERROR",
                    message: "Failed to save vault header.",
                    cause
                },
            };
        }
    }

    async delete(): Promise<Result<void>>{
        try {
            const db = await getDatabase();
            await db.runAsync(`DELETE FROM vault_header WHERE id = ?;`,[VAULT_HEADER_ID])
            return{    
                ok: true,
                value: undefined,
            };
        } catch (cause) {
            return{
                ok:false,
                error:{
                    code: "DATABASE_ERROR",
                    message: "Failed to delete vault header.",
                    cause
                },
            };
        }
    }
}