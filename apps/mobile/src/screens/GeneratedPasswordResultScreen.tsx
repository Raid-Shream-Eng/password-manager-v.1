import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Text, View } from "react-native";
import { CustomButton } from "../components/Customs/customButton";
import Style from './style';
import  { useClipboardTimeout } from "../hooks/useClipboardTimeout";
import { services } from "../services/serviceContainer";
import type { GeneratedPasswordResultParams } from "../navigation/navigation";

type Props = {
    route: {
        params: GeneratedPasswordResultParams;
    };
    navigation:{
        navigate: (screen: string, params?: unknown) => void;
        goBack: ()=> void;
    };
};

export function GeneratedPasswordResultScreen({route, navigation}: Props){
    const { 
        displayName,
        site,
        usernameOrEmail,
        passwordProfile,
        generationInput,
    } = route.params;

    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
      const clearGeneratedPassword = useCallback(() => {
    setGeneratedPassword(null);
    setIsRevealed(false);
    }, []);
    const { isCopied, remainingSeconds, copyWithTimeout, clearClipboard }= 
    useClipboardTimeout({
        timeoutMs: 60_000,
        onTimeout: clearGeneratedPassword, 
    });
    const generate = useCallback(async ()=> {
        setIsGenerating(true);
            try {
           const result = await services.generatorService.generateFromInput(
  generationInput,
);

            if (!result.ok) {
                Alert.alert("Generation failed", result.error.code);
                return;
            }

            setGeneratedPassword(result.value);
            } finally {
            setIsGenerating(false);
            }
        }, [generationInput]);

    useEffect(()=>{
        void generate();
        return ()=> {
            clearGeneratedPassword();
            void clearClipboard();
        };
    }, [generate, clearGeneratedPassword, clearClipboard]);

    async function handleCopy(){
        if (!generatedPassword){
            Alert.alert("Password is not ready yet.");
            return;
        }
        await copyWithTimeout(generatedPassword);
    }
    function handleRevealToggle(){
        setIsRevealed((current)=> !current);
    }
    function handleGenerateAgain(){
        void generate();
    }
    function handleSaveProfile(){
        navigation.navigate("SaveGeneratedProfile",{
            displayName,
            site,
            usernameOrEmail,
            passwordProfile
        });
    }

    const passwordDisplay = generatedPassword && isRevealed ? generatedPassword : "***********************";

    const targetValue = 
    site.kind === "domain" ? site.normalizedDomain : site.generationLabel;

    return(
        <View style={Style.GeneratedPasswordResultContainer}>
            <Text style={Style.GeneratedPasswordResultTitle}>Generated Password</Text>

            <View style={Style.GeneratedPasswordResultCard}>
                <Text style={Style.GeneratedPasswordResultLabel}>Account</Text>
                <Text style={Style.GeneratedPasswordResultValue}>{displayName}</Text>

                <Text style={Style.GeneratedPasswordResultLabel}>Identifier</Text>
                <Text style={Style.GeneratedPasswordResultValue}>{targetValue}</Text>

                <Text style={Style.GeneratedPasswordResultLabel}>Username / Email</Text>
                <Text style={Style.GeneratedPasswordResultValue}>{usernameOrEmail}</Text>

                <Text style={Style.GeneratedPasswordResultLabel}>Password Version</Text>
                <Text style={Style.GeneratedPasswordResultValue}>{passwordProfile.passwordVersion}</Text>
            </View>
            <View style={Style.GeneratedPasswordResultPasswordBox}>
                <Text  style={Style.GeneratedPasswordResultPasswordText}>{passwordDisplay}</Text>
            </View>
            {isCopied && remainingSeconds !== null &&(
                <Text  style={Style.GeneratedPasswordResultCopiedText}>
                    copied. Clipboard clear will be attempted in {remainingSeconds} seconds.
                </Text> )}

                <View  style={Style.GeneratedPasswordResultActions}>
                    <CustomButton 
                    title="Copy"
                    onPress={handleCopy}
                    disabled={!generatedPassword || isGenerating}
                    />
                    <CustomButton 
                    title={isRevealed ? "Hide" : "Reveal"}
                    onPress={handleRevealToggle}
                    disabled={!generatedPassword || isGenerating}
                    />
                    <CustomButton 
                    title="generate Again"
                    onPress={handleGenerateAgain}
                    disabled={!generatedPassword || isGenerating}
                    />
                    <CustomButton 
                    title="Save Profile"
                    onPress={handleSaveProfile}
                    disabled={!generatedPassword || isGenerating}
                    />
                </View>

                <Text  style={Style.GeneratedPasswordResultWarning}>
                    this password can be regenerated only with the same Master Password, identifier, username, rules, and version.
                </Text>
           
        </View>
    );
}