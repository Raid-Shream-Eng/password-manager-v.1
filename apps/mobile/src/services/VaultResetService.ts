import type { Result } from "@password-manager/shared-types";
import { VaultHeaderRepository } from "../repositories/VaultHeaderRepository";
import { VaultRecordRepository } from "../repositories/VaultRecordRepository";
import { HistoryRecordRepository } from "../repositories/HistoryRecordRepository";
import { AppLockService } from "./AppLockService";

export const VAULT_RESET_CONFIRMATION_PHRASE = "DELETE MY VAULT";

export class VaultResetService {
    constructor(
    private readonly vaultHeaderRepository: VaultHeaderRepository,
    private readonly vaultRecordRepository: VaultRecordRepository,
    private readonly historyRecordRepository: HistoryRecordRepository,
    private readonly appLockService: AppLockService
  ) {}

  async resetVault(params: {
    confirmationPhrase: string;
  }): Promise<Result<void>> {
    if (params.confirmationPhrase !== VAULT_RESET_CONFIRMATION_PHRASE){
        return {
            ok: false,
            error: {
                code: "RESET_CONFIRMATION_MISMATCH",
                message: "Reset confirmation phrase does not match.",
            },
        };
    }

    const lockResult = this.appLockService.lock("reset");

    if (!lockResult.ok){
        return lockResult;
    }

    const deleteRecordsResult = await this.vaultRecordRepository.deleteAll();

    if (!deleteRecordsResult.ok){
        return deleteRecordsResult;
    }
    
    const deleteHistoryResult = await this.historyRecordRepository.deleteAll();

    if (!deleteHistoryResult.ok) {
      return deleteHistoryResult;
    }

    const deleteHeaderResult = await this.vaultHeaderRepository.delete();

    if (!deleteHeaderResult.ok) {
      return deleteHeaderResult;
    }

    return {
        ok: true,
        value: undefined,
    };
  }
}