# Password Manager Project

This project is a local-first password manager built with a pnpm monorepo. I am building it step by step so each part of the app has a clear responsibility before I connect everything together.

The main goal is to create a secure password manager that can generate deterministic passwords, store encrypted vault data locally, and later provide a mobile interface using Expo React Native.

## Project Structure

The repository is organized like this:

```text
apps/
  mobile/              Expo React Native mobile app

packages/
  shared-types/        Shared contracts, Result types, errors, and schemas
  crypto-core/         Crypto provider interface and crypto implementation
  password-core/       Password generation and validation logic
```

I separated the project this way because I do not want the core password logic to depend on the mobile app, React Native, Expo, Redux, or storage code.

## What Each Package Does

### shared-types

This package is the trusted source for shared contracts.

It contains the common types that other packages use, such as:

- `Result<T>`
- shared error codes
- password profile contracts
- password generation input contracts
- vault header contracts
- vault record contracts
- vault item payload contracts
- Zod schemas for validation

I use this package so I do not duplicate the same types in different places.

### password-core

This package contains the password generation foundation.

It handles:

- domain normalization
- generation label normalization
- stable canonical JSON
- password profile validation
- byte-to-password mapping
- deterministic password generation

This package does not use React Native, Expo, Redux, SQLite, or UI code. It only focuses on password logic.

The password generator uses an injected crypto provider, which means `password-core` does not choose the crypto library itself. That keeps the package easier to test and easier to reuse.

### crypto-core

This package defines and implements the crypto provider used by the rest of the project.

It includes:

- secure random bytes
- HMAC-SHA-256
- HKDF-SHA-256
- authenticated encryption
- authenticated decryption
- encoding helpers

For the MVP, I started using Expo-compatible crypto tools and noble libraries. The crypto provider still needs to be tested inside Expo and on Android before it can be considered fully ready for real use.

### mobile

This is the Expo React Native app.

Right now, it contains the local vault flow, repository layer, vault session service, encrypted vault item service, quick generator screen, and generated password result screen.

The mobile app will eventually handle:

- creating a vault
- unlocking a vault
- storing encrypted vault records
- showing saved passwords
- generating passwords
- copying generated passwords with a clipboard timeout
- managing settings

## Current Progress

So far, I have worked on the foundation layers first, then started connecting them inside the mobile app.

Completed or started:

- Created the pnpm monorepo structure.
- Added shared contracts in `shared-types`.
- Added Result-based error handling.
- Built the password generation foundation in `password-core`.
- Added tests for password normalization, validation, mapping, and generation.
- Added a real crypto provider structure in `crypto-core`.
- Added HMAC, HKDF, random bytes, and authenticated encryption support.
- Built the SQLite repository layer in the mobile app.
- Built vault creation and unlock services.
- Added an in-memory vault session service.
- Added encrypted vault item create/read/list test flow.
- Added the quick generator screen.
- Added the generated password result screen.
- Added clipboard timeout behavior for generated passwords.
- Added a temporary app screen switch so I can manually test the MVP flow before building the final navigation.

Current manual app flow:

```text
Create vault if needed
Unlock vault
Quick Generator
Generated Password Result
Copy or reveal generated password
```

The app also has a temporary dev vault item test screen that I used to confirm encrypted vault item create/read/list behavior.

## Security Rules I Am Following

I am trying to keep the project secure by following these rules:

- Do not store secrets in Redux.
- Do not store the master password globally.
- Do not store vault keys in Redux.
- Do not store generated passwords after the screen is closed.
- Do not commit vault files, keys, `.env` files, or generated build files.
- Use `Result<T>` for expected errors instead of throwing exceptions.
- Keep saved contracts versioned with `V1`.
- Keep shared contracts in `shared-types`.
- Keep password generation independent from the mobile UI.

## Important Security Notes

Redux must never store:

```text
master password
root vault key
vault encryption key
password generation key
generated password after screen exit
decrypted notes globally
recovery key
```

These values should only live in memory for as long as they are needed.

## Local Storage Plan

For local storage, I am using a repository layer around Expo SQLite.

The goal is that screens and services should not write SQL directly. Instead, they should use repository classes.

The current tables are:

```text
vault_header
vault_records
history_records
app_settings
```

The vault records store encrypted payloads, nonces, encryption version, and encryption algorithm metadata. Plaintext vault item data should not be stored in SQLite.

## Password Generation Flow

The quick generator does not generate or save the password itself. It collects the user inputs and builds a `PasswordGenerationInputV1`.

Important rules I am following:

- `displayName` does not affect the generated password.
- notes do not affect the generated password.
- timestamps do not affect the generated password.
- normalized domain affects the generated password.
- generation label affects the generated password.
- username/email affects the generated password.
- password profile and password version affect the generated password.

The generated password result screen uses the unlocked session's `passwordGenerationKey` to generate the password. The password is hidden by default, can be copied while hidden, and is cleared from local screen state when the clipboard timeout runs or when the screen unmounts.

## Commands

From the repository root:

```powershell
pnpm.cmd install
pnpm.cmd typecheck
pnpm.cmd test
```

Package-specific checks:

```powershell
pnpm.cmd --filter @password-manager/shared-types typecheck
pnpm.cmd --filter @password-manager/password-core typecheck
pnpm.cmd --filter @password-manager/password-core test
pnpm.cmd --filter @password-manager/crypto-core typecheck
pnpm.cmd --filter @password-manager/crypto-core test
pnpm.cmd --filter mobile typecheck
```

Run the mobile app:

```powershell
pnpm.cmd --filter mobile start -- --clear
```

## What I Need To Do Next

The next steps are:

- Finish replacing the temporary app screen switch with real navigation.
- Add the save-generated-profile flow.
- Add the real saved vault item UI.
- Add automated service tests for encrypted vault item behavior.
- Add automated tests for wrong-key and tamper-detection behavior.
- Manually test the crypto provider inside Expo and Android APK builds.
- Replace any temporary password KDF placeholder with a real password KDF before real use.

## Current Limitations

The project is not ready for real password storage yet.

Before real use, I still need to make sure:

- authenticated encryption works correctly on Android
- tamper detection works on Android
- the master password uses a real password KDF such as Argon2id
- no fake or placeholder crypto remains
- no secrets are stored in Redux or logs
- all repository and service layers pass typecheck and tests
- generated passwords are not saved to Redux, SQLite, logs, navigation params, or crash reports
- the temporary testing screens are replaced by production navigation and screens
