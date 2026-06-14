import { createCryptoProvider } from "@password-manager/crypto-core";
import { VaultHeaderRepository } from "../repositories/VaultHeaderRepository";
import { VaultRecordRepository } from "../repositories/VaultRecordRepository";
import { VaultCreationService } from "./VaultCreationService";
import { VaultSessionService } from "./VaultSessionService";
import { VaultItemService } from "./VaultItemService";
import { GeneratorService } from "./GeneratorService";
import {  AppLockService } from "./AppLockService";
import { HistoryRecordRepository } from "../repositories/HistoryRecordRepository";
import { VaultResetService } from "./VaultResetService";

const crypto = createCryptoProvider();

const vaultHeaderRepository = new VaultHeaderRepository();
const vaultRecordRepository = new VaultRecordRepository(); 
const historyRecordRepository = new HistoryRecordRepository();


const vaultSessionService = new VaultSessionService(
    vaultHeaderRepository,
    crypto,
);

const appLockService = new AppLockService(vaultSessionService);


export const services = {
    vaultCreationService: new VaultCreationService(
        vaultHeaderRepository,
        crypto
    ),

    vaultSessionService,

    vaultItemService: new VaultItemService(
        vaultSessionService,
        vaultRecordRepository,
        crypto
    ),

    generatorService: new GeneratorService(vaultSessionService, crypto),

    appLockService,

    vaultResetService : new VaultResetService(
        vaultHeaderRepository,
        vaultRecordRepository,
        historyRecordRepository,
        appLockService
    ),
};