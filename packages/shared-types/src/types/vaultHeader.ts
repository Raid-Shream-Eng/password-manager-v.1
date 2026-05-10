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
        encryptionAlgorithm: "XChaCha20-Poly1305";
    };

    createdAt: string;
    updatedAt: string;
};
{/* شلتها لأنها مش مدعومة و (Typescript) بصيح عليها  */}
{/*|"AES-256-GCM"*/}