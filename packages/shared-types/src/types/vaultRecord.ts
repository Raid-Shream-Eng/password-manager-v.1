export type LocalVaultRecordV1 = {
    id: string;
    schemaVersion: 1;
    encryptionVersion: 1;

    encryptionAlgorithm:  "XChaCha20-Poly1305";

    encryptedPayload: string;
    nonce: string;

    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
};
