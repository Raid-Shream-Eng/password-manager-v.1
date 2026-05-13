import type{
    LocalVaultRecordV1,
    Result,
    VaultItemPayloadV1
} from "@password-manager/shared-types"
import type { CryptoProvider } from "@password-manager/crypto-core";
import { 
    base64ToBytes,
    bytesToBase64,
    bytesToUtf8,
    utf8ToBytes
 } from "@password-manager/crypto-core";
 import {v4 as uuidv4} from "uuid";
 import { VaultRecordRepository } from "../repositories/VaultRecordRepository";
 import { VaultSessionService } from "./VaultSessionService";

 export type DecryptedVaultItemV1 = {
    id: string;
    payload: VaultItemPayloadV1;
    record: LocalVaultRecordV1;
 };

 export type CreateValtItemInput = {
    site: VaultItemPayloadV1["site"];
    usernameOrEmail: string;
    passwordProfile: VaultItemPayloadV1["passwordProfile"];
    notes?: string ;
 };

 export type UpdateVaultItemInput = {
    id: string;
    payload: VaultItemPayloadV1;
 }

 export class VaultItemService{
   constructor(
      private readonly vaultSessionService : VaultSessionService,
      private readonly vaultRecordRepository : VaultRecordRepository,
      private readonly crypto : CryptoProvider
   ){}
   async createItem(
      input: CreateValtItemInput
   ): Promise<Result<DecryptedVaultItemV1>>{
      const sessionResult = this.vaultSessionService.getSession();

      if (!sessionResult.ok) {
         return sessionResult;
      }

      const duplicateResult = await this.hasDuplicate({
         site: input.site,
         usernameOrEmail: input.usernameOrEmail,         
      });

      if (!duplicateResult.ok) {
         return duplicateResult
      }
      if (duplicateResult.value){
         return{
            ok: false,
            error:{
               code: "DUPLICATE_VAULT_ITEM",
               message: "An item with this account already exists.",
            },
         };
      }
      const now = new Date().toISOString();

      const payload: VaultItemPayloadV1 = {
         schemaVersion: 1,
         site: input.site,
         usernameOrEmail: input.usernameOrEmail,
         passwordProfile: input.passwordProfile,
         passwordHistory: [],
         notes:  input.notes,
         lastUsedAt: null,
         createdAt: now,
         updatedAt: now
      };
      const encryptedResult = await this.encryptPayload(payload);

      if (!encryptedResult.ok){
         return encryptedResult;
      }

      const record: LocalVaultRecordV1 = {
         id: uuidv4(),
         schemaVersion:1,
         encryptionVersion:1,
         encryptionAlgorithm: encryptedResult.value.encryptionAlgorithm,
         encryptedPayload: encryptedResult.value.encryptedPayload,
         nonce: encryptedResult.value.nonce,
         createdAt: now,
         updatedAt: now,
      };

      const saveResult = await this.vaultRecordRepository.create(record);

      if (!saveResult.ok) {
         return saveResult;
      }
     return{
      ok:true,
      value: {
         id: record.id,
         payload,
         record,
      },
     };
   }
   
 

   async getItemById(
      id: string
   ): Promise<Result<DecryptedVaultItemV1 | null >>{
      const sessionResult = this.vaultSessionService.getSession();

      if (!sessionResult.ok){
         return sessionResult;
      }

      const recordResult = await this.vaultRecordRepository.getById(id);

      if (!recordResult.ok) {
         return recordResult;
      }

      if (!recordResult.value){
         return{
            ok: true,
            value: null,
         };
      }

      const payloadResult = await this.decryptPayload(recordResult.value);

      if (!payloadResult.ok) {
         return payloadResult;
      }

      return{
         ok: true,
         value:{
            id: recordResult.value.id,
            payload: payloadResult.value,
            record: recordResult.value,
         },
      };
   }  

   async listActiveItems(): Promise<Result<DecryptedVaultItemV1[]>>{
      const sessionResult = this.vaultSessionService.getSession();

      if(!sessionResult.ok){
         return sessionResult;
      }

      const recordsResult = await this.vaultRecordRepository.listActive();

      if(!recordsResult.ok){
         return recordsResult;
      }
      return this.decryptRecords(recordsResult.value);
   }

   async listDeletedItem(): Promise<Result<DecryptedVaultItemV1[]>>{
      const sessionResult = this.vaultSessionService.getSession();

      if (!sessionResult.ok) {
         return sessionResult;
      }

      const recordsResult = await this.vaultRecordRepository.listActive();

      if (!recordsResult.ok){
         return recordsResult;
      }

      return this.decryptRecords(recordsResult.value);
   }

   async updateItem(
      input: UpdateVaultItemInput
   ): Promise<Result<DecryptedVaultItemV1>>{
      const sessionResult = this.vaultSessionService.getSession();

      if (!sessionResult.ok) {
         return sessionResult;
      }

      const existingResult = await this.vaultRecordRepository.getById(input.id);

      if (!existingResult.ok) {
         return existingResult
      }

      if (!existingResult.value) {
         return{
            ok:false,
            error:{
               code: "VAULT_ITEM_NOT_FOUND",
               message: "Vault item was not found."
            },
         };
      }
      const now = new Date().toISOString();

      const updatedPayload: VaultItemPayloadV1 = {
         ...input.payload,
         updatedAt: now,
      };

      const encryptedResult = await this.encryptPayload(updatedPayload);

      if (!encryptedResult.ok) {
         return encryptedResult;
      }
      const updatedRecord: LocalVaultRecordV1 = {
         ...existingResult.value,

         encryptedPayload: encryptedResult.value.encryptedPayload,
         nonce: encryptedResult.value.nonce,
         updatedAt: now,
      };const saveResult = await this.vaultRecordRepository.update(updatedRecord);

      if (!saveResult.ok) {
         return saveResult;
      }

      return{
         ok:true,
         value:{
            id: updatedRecord.id,
            payload: updatedPayload,
            record: updatedRecord
         },
      };
   }

   async softDeleteItem(id: string): Promise<Result<void>>{
      const sessionResult = this.vaultSessionService.getSession();

      if(!sessionResult.ok){
         return sessionResult;
      }
      const recordResult = await this.vaultRecordRepository.getById(id);
      if(!recordResult.ok){
         return recordResult;
      } 
      if(!recordResult.value){
         return {
            ok: false,
            error: {
               code: "VAULT_ITEM_NOT_FOUND",
               message: "Vault item was not found.",
            },
         };
      }

      const now = new Date().toISOString();

      const updatedRecord: LocalVaultRecordV1 = {
         ...recordResult.value,
         updatedAt: now,
         deletedAt: now
      };

      return this.vaultRecordRepository.update(updatedRecord);
   }

   async restoreItem(id: string): Promise<Result<void>>{
      const sessionResult = this.vaultSessionService.getSession();
      if (!sessionResult.ok) {
         return sessionResult;
      }
       
      const recordResult = await this.vaultRecordRepository.getById(id);
      if (!recordResult.ok) {
         return recordResult;
      }
      if (!recordResult.value) {
         return{
            ok: false,
            error:{
               code: "VAULT_ITEM_NOT_FOUND",
               message: "Vault item was not found.",
            },
         };
      }

      const updatedRecord: LocalVaultRecordV1 = {
         ...recordResult.value,

         updatedAt: new Date().toISOString(),
      };
      return this.vaultRecordRepository.update(updatedRecord);
   }
   async permanentlyDeleteItem(id: string):Promise<Result<void>>{
      const sessionResult = this.vaultSessionService.getSession();

      if(!sessionResult.ok){
         return sessionResult;
      }
      return this.vaultRecordRepository.deletePermanently(id);
   }

   async hasDuplicate(Params:{
    site: VaultItemPayloadV1["site"];
    usernameOrEmail: string;
    excludeItemId?: string;
   }): Promise<Result<boolean>>{
      const itemsResult = await this.listActiveItems();

      if (!itemsResult.ok) {
         return itemsResult;
      }

      const exists = itemsResult.value.some((item) => {
         if(Params.excludeItemId && item.id === Params.excludeItemId){
            return false;
         }
         return(
            isSameSiteIdentity(item.payload.site, Params.site) &&
            normalizeUsername(item.payload.usernameOrEmail)===normalizeUsername(Params.usernameOrEmail)
         );
      });
      return{
         ok: true,
         value: exists,
      };
   }

   private async decryptRecords(
      records: LocalVaultRecordV1[]
   ): Promise<Result<DecryptedVaultItemV1[]>>{
      const items: DecryptedVaultItemV1[]=[];

      for (const record of records){
         const payloadResult = await this.decryptPayload(record);

         if(!payloadResult.ok){
            return payloadResult;
         }

         items.push({
            id:record.id,
            payload: payloadResult.value,
            record
         });
      }
      return {
         ok: true,
         value: items,
      };
   }

   private async encryptPayload(
      payload: VaultItemPayloadV1
   ): Promise<Result<{
      encryptionAlgorithm: LocalVaultRecordV1["encryptionAlgorithm"];
      encryptedPayload:string;
      nonce: string;
   }>
   >{
      const sessionResult = this.vaultSessionService.getSession();

      if (!sessionResult.ok) {
         return sessionResult;
      }
      const plaintext = utf8ToBytes(JSON.stringify(payload));
      const encryptedResult = await this.crypto.encryptAead({
         key: sessionResult.value.vaultEncryptionKey,
         plaintext,
         associatedData: utf8ToBytes(sessionResult.value.vaultId),
      });

      if (!encryptedResult.ok){
         return {
            ok: false,
            error:{
               code: "ENCRYPTION_FAILED",
               message:"",
               cause: encryptedResult.error,
            },
         };
      }
      return{
         ok:true,
         value: {
            encryptionAlgorithm: encryptedResult.value.algorithm,
            encryptedPayload: bytesToBase64(encryptedResult.value.ciphertext),
            nonce: bytesToBase64(encryptedResult.value.nonce),
         },
      };
   }

   private async decryptPayload(
      record: LocalVaultRecordV1
   ): Promise<Result<VaultItemPayloadV1>>{
      const sessionResult = this.vaultSessionService.getSession();

      if (!sessionResult.ok){
         return sessionResult;
      }

      const decryptedResult = await this.crypto.decryptAead({
         key: sessionResult.value.vaultEncryptionKey,
         nonce: base64ToBytes(record.nonce),
         ciphertext: base64ToBytes(record.encryptedPayload),
         associatedData: utf8ToBytes(sessionResult.value.vaultId),
         algorithm: record.encryptionAlgorithm ,
      });

      if (!decryptedResult.ok){
         return{ok:false,
            error:{
               code: "DECRYPTION_FAILED",
               message:"",
               cause: decryptedResult.error,
            },
         };
      }

      try{
         const text = bytesToUtf8(decryptedResult.value);
         const payload = JSON.parse(text) as VaultItemPayloadV1;
         
         if (payload.schemaVersion !== 1) {
            return{
               ok: false,
               error:{
                  code: "INVALID_VAULT_ITEM_PAYLOAD",
                  message: "Failed to decrypt vault item patload.",
               },
            };
         }
         return{
            ok: true,
            value: payload, 
         };
      } catch (cause){
         return{
            ok:false,
            error:{
               code: "DECRYPTION_FAILED",
               message: "Failed to parse decrypted vault item payload.",
               cause
            },
         };
      }
   }
}

   function  normalizeUsername(value: string):string {
         return value.trim().toLowerCase();
   }

   function isSameSiteIdentity(
      first: VaultItemPayloadV1["site"],
      second: VaultItemPayloadV1["site"]
   ) : boolean {
      if (first.kind !== second.kind) {
         return false;
      };
      if (first.kind === "domain" && second.kind === "domain") {
         return first.normalizedDomain === second.normalizedDomain;
      }
      if (first.kind === "label" && second.kind === "label") {
         return first.generationLabel === second.generationLabel;
      }
      return false;
   }