import { createCryptoProvider } from "@password-manager/crypto-core";
import { VaultHeaderRepository } from "../repositories/VaultHeaderRepository";
import { VaultCreationService } from "./VaultCreationService";
import { VaultSessionService } from "./VaultSessionService";

const crypto = createCryptoProvider();

const vaultHeaderRepository = new VaultHeaderRepository();

export const services = {
    vaultCreationService: new VaultCreationService(
        vaultHeaderRepository,
        crypto
    ),
    vaultSessionService: new VaultSessionService(
        vaultHeaderRepository,
        crypto
    ),
};