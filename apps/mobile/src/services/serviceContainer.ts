import { createCryptoProvider } from "@password-manager/crypto-core";
import { VaultHeaderRepository } from "../repositories/VaultHeaderRepository";
import { VaultRecordRepository } from "../repositories/VaultRecordRepository";
import { VaultCreationService } from "./VaultCreationService";
import { VaultSessionService } from "./VaultSessionService";
import { VaultItemService } from "./VaultItemService";

const crypto = createCryptoProvider();

const vaultHeaderRepository = new VaultHeaderRepository();
const vaultRecordRepository = new VaultRecordRepository(); 

const vaultSessionService = new VaultSessionService(
    vaultHeaderRepository,
    crypto,
);

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
};