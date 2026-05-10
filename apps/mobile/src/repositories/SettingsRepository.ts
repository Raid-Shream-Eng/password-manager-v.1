import type { Result } from "@password-manager/shared-types";
import { getDatabase } from "./database";

export class SetttingsRpository{
    async get(key: string): Promise<Result<string| null>>{
        try {
            const db = await getDatabase();
            const row = await db.getFirstAsync<{value: string}>(
                `SELECT value FROM app_settings WHERE  = ? LIMIT 1;`,
                [key]
            );
            return{
                ok:true,
                value: row?.value ?? null,
            }
        } catch (cause) {
            return{
                ok: false,
                error:{
                    code: "DATABASE_ERROR",
                    message: "Failed to read setting.",
                    cause
                },
            };
        }
    }

    async set(key: string, value: string): Promise<Result<void>>{
        try {

            const db = await getDatabase();
            await db.runAsync(
            `
            ISERTRT OR REPLACE INTO app_setting(
            
            key,
            value,
            updateedAt
            )VALUES (?, ?, ?);
            `,
            [key,value,new Date().toISOString()]
            );
            return {
                ok: true,
                value: undefined,
            };
        } catch (cause) {
           return {
                ok: false,
                error: {
                    code:"DATABASE_ERROR",
                    message:"Failed to save setting.",
                    cause
                },
            };
        }
    }
}