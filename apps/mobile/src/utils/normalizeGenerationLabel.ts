import { Result } from "@password-manager/shared-types";

export function normalizeGenerationLabel(input: string): Result<string>{
    const value = input.trim().toLowerCase().replace(/\s+/g , "-");

    if (!value){
        return{
            ok:false,
            error:{
                code:"INVALID_GENERATION_LABEL",
                message:"Generation label is required",
            },
        };
    }
    return{
        ok:true,
        value: value,
    };
}