export type VaultHeaderV1 = {
    vaultId: string;
    appVersion: string;
    vaultFormatVersion: 1;

    kdf: {
        algorithm: "argon2id";
        memoryMiB: number;
        iterations: number;
        parallelism: number;
        salt: string;
    };
    keyEnvelope:{
        type : "master-password";
        encryptedRootVaultKey: string;
        nonce: string;
        encryptionAlgorithm: "XChaCha20-Poly1305"|"AES-256-GCM";
    };

    createdAt: string;
    updatedAt: string;
};
