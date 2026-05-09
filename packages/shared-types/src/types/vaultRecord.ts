export type LocalVaultRecord = {
    id: string;
    schemaVersion: 1;
    encryptionVersion: 1;

    encryptedPayload: string;
    nonce: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
};
