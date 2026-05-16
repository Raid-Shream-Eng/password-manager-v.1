import type { PasswordGenerationInputV1,Result, } from "@password-manager/shared-types";
import { hmacSha256, type CryptoProvider } from "@password-manager/crypto-core";
import{ generatePassword }from"@password-manager/password-core";
import { VaultSessionService } from "./VaultSessionService";

export class GeneratorService{
    constructor(
        private readonly vaultSessionService: VaultSessionService,
        private readonly crypto: CryptoProvider
    ) {}
    async generateFromInput(
        input: PasswordGenerationInputV1
    ): Promise<Result<string>>{
    const sessionResult = this.vaultSessionService.getSession();

    if (!sessionResult.ok) {
        return sessionResult;
    }
    const session = sessionResult.value;
    const result = await generatePassword({
        input,
        passwordGenerationKey: session.passwordGenerationKey,
        crypto: {
            hmacSha256: async (key, message) => {
                const hmacResult = await this.crypto.hmacSha256(key, message);

                if(!hmacResult.ok){
                    throw new Error(hmacResult.error.code);
                }
                return hmacResult.value;;
            },
        },
    });
    return result;
 }
}