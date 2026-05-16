import type {
  PasswordGenerationInputV1,
  PasswordProfileV1,
  SiteIdentifier,
} from "@password-manager/shared-types";

export type GeneratedPasswordResultParams = {
  displayName: string;
  site: SiteIdentifier;
  usernameOrEmail: string;
  passwordProfile: PasswordProfileV1;
  generationInput: PasswordGenerationInputV1;
};

export type SaveGeneratedProfileParams = {
  displayName: string;
  site: SiteIdentifier;
  usernameOrEmail: string;
  passwordProfile: PasswordProfileV1;
};

export type VaultItemDetailsParams = {
  itemId: string;
};

export type EditVaultItemParams = {
  itemId: string;
};

export type UnlockedStackParamList = {
  Home: undefined;
  QuickGenerator: undefined;
  GeneratedPasswordResult: GeneratedPasswordResultParams;
  SaveGeneratedProfile: SaveGeneratedProfileParams;
  VaultList: undefined;
  VaultItemDetails: VaultItemDetailsParams;
  EditVaultItem: EditVaultItemParams;
  RecentlyDeleted: undefined;
};