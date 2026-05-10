# Password Manager

A local-first password manager built as a pnpm monorepo. The project is being developed in layers: shared contracts first, core deterministic password logic next, crypto compatibility checks before selecting a real crypto provider, and then the Expo mobile app UI.

## Workspace

```text
apps/
  mobile/              Expo React Native app

packages/
  shared-types/        Shared TypeScript contracts, Result types, and Zod schemas
  crypto-core/         Crypto provider interface and compatibility test scaffold
  password-core/       Deterministic password generation foundation
```

## Current Status

- `shared-types` defines MVP contracts for password profiles, generation input, vault items, vault records, vault headers, and site identifiers.
- `crypto-core` defines the crypto provider interface and placeholder provider. No fake crypto is used in production code.
- `password-core` implements Result-based domain normalization, canonical JSON, password profile validation, byte-to-password mapping, and deterministic generation using an injected HMAC provider.
- `apps/mobile` has the base dependencies, Redux store slices, and initial folder structure for future screens.

## Important Security Notes

Redux and global app state must never store secrets:

```text
master password
root vault key
vault encryption key
password generation key
generated password after screen exit
decrypted notes globally
recovery key
```

Crypto is not finalized yet. `crypto-core` intentionally throws from `createCryptoProvider()` until a real Expo-compatible crypto library is selected and tested.

## Scripts

From the repo root:

```powershell
pnpm.cmd install
pnpm.cmd test
pnpm.cmd typecheck
```

Package-specific checks:

```powershell
pnpm.cmd --filter @password-manager/shared-types typecheck
pnpm.cmd --filter @password-manager/crypto-core typecheck
pnpm.cmd --filter @password-manager/crypto-core test
pnpm.cmd --filter @password-manager/password-core typecheck
pnpm.cmd --filter @password-manager/password-core test
pnpm.cmd --filter mobile typecheck
```

Run the mobile app:

```powershell
pnpm.cmd --filter mobile start
```

## Packages

### `@password-manager/shared-types`

Shared source of truth for domain contracts.

Includes:

- `Result<T, E>` and app error codes
- `SiteIdentifier`
- `PasswordProfileV1` and `defaultPasswordProfileV1`
- `PasswordGenerationInputV1`
- `VaultItemPayloadV1`
- `LocalVaultRecordV1`
- `VaultHeaderV1`
- Zod schemas for password profiles and site identifiers

### `@password-manager/crypto-core`

Defines the crypto provider contract:

- `randomBytes`
- `hmacSha256`
- `hkdfSha256`
- `encryptAead`
- `decryptAead`

The package currently contains only the interface, encoding helpers, placeholder provider, and compatibility test template.

### `@password-manager/password-core`

Platform-independent deterministic password generation foundation.

Includes:

- domain normalization
- stable canonical JSON
- password profile validation wrapper
- byte-to-password mapping
- deterministic `generatePassword()` using injected crypto
- Vitest coverage for the foundation behavior

### `mobile`

Expo app foundation with:

- Redux Toolkit
- React Redux
- React Hook Form
- Zod
- i18next / react-i18next
- Expo SQLite

Initial Redux slices:

- `settingsSlice`
- `sessionSlice`
- `uiSlice`

## Development Rules

- Keep shared persisted contracts versioned with `V1`.
- Keep password generation independent from React Native, Expo, storage, and UI code.
- Use `Result` objects for expected domain errors instead of throwing.
- Do not commit generated build output, TypeScript build info, environment files, signing keys, vault files, or real secrets.

## Next Steps

- Commit the completed shared-types, crypto-core, password-core, and mobile foundation work in clean logical commits.
- Remove or fix any stale scripts that point to deleted files.
- Select and test a real Expo-compatible crypto implementation.
- Build vault storage repositories and mobile screens using the shared contracts.
