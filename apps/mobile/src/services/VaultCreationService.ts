import type { Result, VaultHeaderV1 } from "@password-manager/shared-types";
import type { CryptoError, CryptoProvider } from "@password-manager/crypto-core";
import { bytesToBase64, utf8ToBytes } from "@password-manager/crypto-core";
import { VaultHeaderRepository } from "../repositories/VaultHeaderRepository";


export class VaultCreationService{
    constructor(
        private readonly vaultHeaderRepository: VaultHeaderRepository,
        private readonly crypto: CryptoProvider,
    ){}

    async createVault(masterPassword:string):Promise<Result<VaultHeaderV1>>{
        const existingHeader = await this.vaultHeaderRepository.get();
        if (!existingHeader.ok) {
            return existingHeader;
        }
        if (existingHeader.value) {
            return{
                ok:false,
                error:{
                    code:"VAULT_ALREADY_EXISTS",
                    message: "A local vault already exists."
                },
            };
        }

        const vaultIdResult =this.createVaultId();
        const rootVaultKeyResult = this.crypto.randomBytes(32);
        const saltResult = this.crypto.randomBytes(32);

        if (!vaultIdResult.ok){
            return vaultIdResult;
        }

        if (!rootVaultKeyResult.ok) {
            return this.cryptoError(
        "Failed to create root vault key.",
        rootVaultKeyResult.error,
        );
        }

        if (!saltResult.ok){
            return this.cryptoError("Failed to create vault salt.", saltResult.error);
        }

        const vaultId = vaultIdResult.value;
        const now = new Date().toISOString();
        const masterPasswordKeyResult = await this.deriveMasterPasswordKey({
            masterPassword,
            salt: saltResult.value,
        });

        if (!masterPasswordKeyResult.ok) {
            return masterPasswordKeyResult;            
        }
        const encryptedRootVaultKeyResult = await this.crypto.encryptAead({
            key: masterPasswordKeyResult.value,
            plaintext: rootVaultKeyResult.value,
            associatedData: utf8ToBytes(vaultId),
        });
        if (!encryptedRootVaultKeyResult.ok) {
            return this.cryptoError(
                "Failed to encrypt root vault key.",
        encryptedRootVaultKeyResult.error,
            );
        }

        const header: VaultHeaderV1 = {
            
      vaultId,
      appVersion: "0.1.0",
      vaultFormatVersion: 1,
      kdf: {
        algorithm: "argon2id",
        memoryMiB: 19,
        iterations: 2,
        parallelism: 1,
        salt: bytesToBase64(saltResult.value),
      },
      keyEnvelope: {
        type: "master-password",
        encryptedRootVaultKey: bytesToBase64(
          encryptedRootVaultKeyResult.value.ciphertext,
        ),
        nonce: bytesToBase64(encryptedRootVaultKeyResult.value.nonce),
        encryptionAlgorithm: encryptedRootVaultKeyResult.value.algorithm,
      },
      createdAt: now,
      updatedAt: now,
        };
        const saveResult = await  this.vaultHeaderRepository.save(header)

        if (!saveResult.ok){
            return saveResult;
        }

        return{
            ok:true,
            value: header,
        };
    }

    private createVaultId(): Result<string>{
        const result = this.crypto.randomBytes(16);

        if (!result.ok) {
            return this.cryptoError("Failed to create vault id.", result.error);            
        }

        return{
            ok: true,
            value: `vault_${bytesToBase64(result.value)}`,
        };
    }

    private async deriveMasterPasswordKey(params: {
        masterPassword:string;
        salt: Uint8Array;
    }):Promise<Result<Uint8Array>>{/**
     * Temporary MVP placeholder:
     * HKDF is not a password KDF. Replace this with Argon2id before real use.
     */
    const result = await this.crypto.hkdfSha256({
      inputKeyMaterial: utf8ToBytes(params.masterPassword),
      salt: params.salt,
      info: utf8ToBytes("master-password-key"),
      length: 32,
    });

    if(!result.ok){
        return this.cryptoError(
        "Failed to derive master password key.",
        result.error,
      );
    }
        return result;

    }

    private cryptoError<T>(message:string, cause:CryptoError): Result<T>{
        return{
            ok:false,
            error:{
                code: "CRYPTO_ERROR",
                message,
                cause
            }
        }
    }
}