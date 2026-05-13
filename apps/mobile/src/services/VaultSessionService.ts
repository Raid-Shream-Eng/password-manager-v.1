import type { Result, VaultHeaderV1 } from "@password-manager/shared-types";
import type { CryptoProvider, CryptoError } from "@password-manager/crypto-core";
import { base64ToBytes, utf8ToBytes } from "@password-manager/crypto-core";
import { VaultHeaderRepository } from "../repositories/VaultHeaderRepository";

export type UnlockedVaultSession = {
    vaultId: string;
    rootVaultKey: Uint8Array;
    vaultEncryptionKey: Uint8Array;
    passwordGenerationKey: Uint8Array;
    unlockedAt: string;
};

export class VaultSessionService {
    private session: UnlockedVaultSession|null=null;

    constructor(
        private readonly vaultHeaderRepository: VaultHeaderRepository,
        private readonly crypto: CryptoProvider
    ){}

    isUnlocked(): boolean {
        return this.session !== null;
    }

    getSession(): Result<UnlockedVaultSession> {
        if (!this.session) {
            return {
                ok:false,
                error:{
                    code: "VAULT_LOCKED",
                    message: " Vault is locked.",
                },
            };
        }
        return{
            ok:true,
            value: this.session,
        };
    }


    async hasVault() : Promise<Result<boolean>>{
        const headerResult = await this.vaultHeaderRepository.get();

        if (!headerResult.ok) {
            return headerResult;
        }
        return{
            ok: true,
            value: headerResult.value !== null,
        };
    }

    async unlock(masterPassword: string): Promise<Result<void>>{
        const headerResult = await this.vaultHeaderRepository.get();

        if (!headerResult.ok) {
            return headerResult;
        }

        if(!headerResult.value){
            return{
                ok: false,
                error:{
                    code:"VAULT_NOT_FOUND",
                    message:"No local vault exists.",
                },
            };
        }
        const header = headerResult.value;
        
        const masterPaasswordKeyResult = await this.deriveMasterPasswordKey(
            masterPassword,
            header
        );
        if(!masterPaasswordKeyResult.ok){
            return masterPaasswordKeyResult;
        }
        const rootVaultKeyResult = await this.decryptRootVaultKey(
            header,
            masterPaasswordKeyResult.value
        );
        if(!rootVaultKeyResult.ok){
            return{
                ok:false,
                error:{
                    code: "WRONG_MASTER_PASSWORD",
                    message: "Wrong master password",
                    cause: rootVaultKeyResult.error,
                },
            };
        }
        const vaultEncyptionKeyResult = await this.crypto.hkdfSha256({
            inputKeyMaterial: rootVaultKeyResult.value,
            salt: utf8ToBytes(header.vaultId),
            info: utf8ToBytes("vault-encryption"),
            length: 32,
        });

        if (!vaultEncyptionKeyResult.ok){
            return this.cryptoError(
                "Failed to derive vault encryption key.",
                vaultEncyptionKeyResult.error,
            );
        }


        const passwordGenerationKeyResult =await this.crypto.hkdfSha256({
            inputKeyMaterial: rootVaultKeyResult.value,
            salt: utf8ToBytes(header.vaultId),
            info: utf8ToBytes("password-generation"),
            length: 32,
        });

        if(!passwordGenerationKeyResult.ok){
            return this.cryptoError(
            "Failed to derive password generation key.",
            passwordGenerationKeyResult.error,
            );
        }

        this.session = {
            vaultId: header.vaultId,
            rootVaultKey: rootVaultKeyResult.value,
            vaultEncryptionKey: vaultEncyptionKeyResult.value,
            passwordGenerationKey: passwordGenerationKeyResult.value,
            unlockedAt: new Date().toISOString(),
        };

        return{
            ok:true,
            value:undefined,
        };
    }

    lock(): Result<void>{
        if(this.session){
            this.zeroBytes(this.session.rootVaultKey);
            this.zeroBytes(this.session.vaultEncryptionKey);
            this.zeroBytes(this.session.passwordGenerationKey);
        }

        this.session = null;

        return{
            ok:true,
            value: undefined,
        };
    }
// Temporary Temporary Temporary Temporary Temporary Temporary Temporary Temporary Temporary Temporary Temporary Temporary Temporary Temporary Temporary Temporary 
    private async deriveMasterPasswordKey(
        masterPassword: string,
        header: VaultHeaderV1
    ): Promise<Result<Uint8Array>>{
        /*
        * The code above uses HKDF as a temporary placeholder for deriving the master password key.
        * That is not final
        * This  just for the MVP
        * I will Overwrite Argon2id over it once the chosen KDF package passes Expo comatibility.
        * 
        */
       const result = await this.crypto.hkdfSha256({
        inputKeyMaterial:utf8ToBytes(masterPassword),
        salt:base64ToBytes(header.kdf.salt),
        info:utf8ToBytes("master-password-key"),
        length:32,
       });
       if (!result.ok){
        return this.cryptoError(
        "Failed to derive master password key.",
        result.error,
      );
       }
       return result;
    }

    private async decryptRootVaultKey(
        header: VaultHeaderV1,
        masterPasswordKey: Uint8Array
    ): Promise<Result<Uint8Array>>{
        const decryptResult = await this.crypto.decryptAead({
            key: masterPasswordKey,
            nonce: base64ToBytes(header.keyEnvelope.nonce),
            ciphertext: base64ToBytes(header.keyEnvelope.encryptedRootVaultKey),
            associatedData: utf8ToBytes(header.vaultId),
            algorithm: header.keyEnvelope.encryptionAlgorithm,
        });

        if(!decryptResult.ok){
            return this.cryptoError(
        "Failed to decrypt root vault key.",
        decryptResult.error,
        );
        }

        return decryptResult;
    }
    private cryptoError<T>(message: string, cause: CryptoError): Result<T>{
        return{
            ok: false,
            error:{
                code:"CRYPTO_ERROR",
                message,
                cause,
            }
        }
    }

    private zeroBytes(bytes:Uint8Array): void{
        bytes.fill(0);
    }
}