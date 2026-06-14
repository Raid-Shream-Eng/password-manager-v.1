import type { Result } from "@password-manager/shared-types";
import { VaultSessionService } from "./VaultSessionService";
import { tr } from "zod/v4/locales";
 export type LockReason = 
 | "manual"
 | "background"
 | "inactivity"
 | "reset"
 | "security";

 export type AppLockEvent = {
    reason: LockReason;
    lockedAt: string;
 };

 export class AppLockService {
    private lastLockEvent: AppLockEvent | null = null;

    constructor(private readonly vaultSessionService: VaultSessionService){}

    isUnlocked(): boolean {
        return this.vaultSessionService.isUnlocked();
    }

    lock(reason: LockReason): Result<AppLockEvent>{
        const lockResult = this.vaultSessionService.lock();

        if (!lockResult.ok) {
            return lockResult;
        }

        const event: AppLockEvent = {
            reason,
            lockedAt:new Date().toISOString(),
        };

        this.lastLockEvent = event;

        return{
            ok: true,
            value: event,
        };
    }
    getLastLockEvent(): AppLockEvent | null{
        return this.lastLockEvent;
    }
 }