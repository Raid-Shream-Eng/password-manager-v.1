export type VaultRecordEncryptionAlgorithm  = "XChaCha20-Poly1305";
export type LocalVaultRecordV1 = {
    id: string;
    schemaVersion: 1;
    encryptionVersion: 1;

    encryptionAlgorithm:  VaultRecordEncryptionAlgorithm;

    encryptedPayload: string;
    nonce: string;

    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
};
