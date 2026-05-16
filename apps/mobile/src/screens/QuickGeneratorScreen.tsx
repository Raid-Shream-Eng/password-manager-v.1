import { useState } from "react";
import {
    Alert,
    Button,
    ScrollView,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';

import {
    defaultPasswordProfileV1,
    type PasswordGenerationInputV1,
    type SiteIdentifier,
} from "@password-manager/shared-types";
import { normalizeDomain } from "@password-manager/password-core";
import {
    quickGeneratorSchema,
    type QuickGeneratorFormValues
}from "../forms/quickGenerator.schema";
import { normalizeGenerationLabel } from "../utils/normalizeGenerationLabel";
// I'll use this later cuz I dont want to forget import { useRootNavigationState } from "expo-router";
import Style from "./style";
import { CustomButton } from "../components/Customs/customButton";

type Props = {
    navigation:{
        navigate: 
            (screen: string, params?: unknown)=> void ;
    };
};
export function  QuickGeneratorScreen({navigation}: Props){
    const [normalizedPreview, setNormalizedPreview] = useState<string|null>(null);
    const { 
        control,
        handleSubmit,
        watch,
        setValue , 
        formState:{ errors },
    } = useForm<QuickGeneratorFormValues>({
        resolver: zodResolver(quickGeneratorSchema),
        defaultValues:{
            identifierType: "domain",
            displayName:"",
            domainInput:"",
            labelInput :"",
            usernameOrEmail:"",
            passwordProfile: defaultPasswordProfileV1,
        },
    });

    const identifierType  = watch( "identifierType");
    const passwordProfile = watch("passwordProfile");

    function updatePasswordProfile(
        patch: Partial<QuickGeneratorFormValues["passwordProfile"]>
    ){
        setValue("passwordProfile", {
            ...passwordProfile,
            ...patch,
        });
    }
    function onSubmit(values: QuickGeneratorFormValues){
        let site: SiteIdentifier;

        if(values.identifierType === "domain"){
            const normalizedResult = normalizeDomain(values.domainInput ?? "");

            if (!normalizedResult.ok) {
                Alert.alert("Invalid domain", normalizedResult.error.code);
                return;
            }

            site = {
                kind: "domain",
                displayName: values.displayName.trim(),
                normalizedDomain: normalizedResult.value,
            };

            setNormalizedPreview(normalizedResult.value);
        } 
        else{
        const labelResult = normalizeGenerationLabel(values.labelInput ?? "");

        if (!labelResult.ok){
            Alert.alert("Invalid label", labelResult.error.code);
            return;
        }

        site = {
            kind: "label",
            displayName: values.displayName.trim(),
            generationLabel: labelResult.value,
        };

        setNormalizedPreview(labelResult.value);
        }

        const generationInput: PasswordGenerationInputV1 = {
            algorithmVersion:1,
            site:
            site.kind === "domain" ?{
                kind:"domain",
                normalizedDomain: site.normalizedDomain,
            }:{
                kind:"label",
                generationLabel: site.generationLabel
            },
            usernameOrEmail: values.usernameOrEmail.trim(),
            passwordProfile: values.passwordProfile,
        };

        navigation.navigate("GeneratedPasswordResult",{
            displayName: values.displayName.trim(),
            site,
            usernameOrEmail: values.usernameOrEmail.trim(),
            passwordProfile: values.passwordProfile,
            generationInput,
        });
    }


    return(
        <ScrollView>
            <Text></Text>
            <Text></Text>

            <View>
                <Button
                title="Domain"
                onPress={()=> setValue("identifierType", "domain")}
                />
                <Button
                title="Label"
                onPress={()=> setValue("identifierType", "label")}
                />
            </View>
            <Text></Text>
            <Controller
            control={control}
            name='displayName'
            render={({ field: { value, onChange }})=> (
                <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Example: Gmail"
                style={{}}
                />
            )}
            />
            {errors.displayName &&(
                <Text style={{}}>{errors.displayName.message}</Text>
            )}

            {identifierType === "domain" ? (
                <>
                <Text style={{}}>
                    Domain
                </Text>
                <Controller
                control={control}
                name="domainInput"
                render={({ field: {value, onChange}})=>(
                    <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Example: https://www.google.com/login"
                    autoCapitalize="none"
                    style={{}}
                    /> 
                )}
                />
                {errors.domainInput && (
                    <Text style={{}}>{errors.domainInput.message}                    </Text>
                )}
                </>
            ):
            (<>
             <Text style={Style.QuuickGeneratorLabel}>Generation Label</Text>
             <Controller
             control={control}
             name="labelInput"
             render={({field: {value, onChange}})=>
            <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Example: Google"
            autoCapitalize="none"
            style={Style.QuuickGeneratorInput}
            />
            }
             />
             {errors.labelInput && (
                <Text style={{}}>{errors.labelInput.message}</Text>
             )}
             </>
            )}
            {normalizedPreview &&(
                <Text style={{}}>
                    Normalized value: {normalizedPreview}
                </Text>
            )}

            <Text style={Style.QuuickGeneratorLabel}>Username Or Email</Text>
            <Controller 
            control={control}
            name="usernameOrEmail"
            render={({ field: { value, onChange }})=>(
                <TextInput 
                value={value}
                onChangeText={onChange}
                placeholder="Name@email.com"
                autoCapitalize="none"
                style={Style.QuuickGeneratorInput}
                />)}/>
                {errors.usernameOrEmail &&(<Text style={Style.QuuickGeneratorError}>{errors.usernameOrEmail.message}</Text>)}

                <Text style={Style.QuuickGeneratorSectionTitle}>Password Rules</Text>
                <Text style={Style.QuuickGeneratorLabel}>Length</Text>
                <Controller
                control={control}
                name="passwordProfile.length"
                render={({field: {value, onChange }})=>(
                    <TextInput
                    value={String(value)}
                    onChangeText={(text)=> {
                        const parsed = Number.parseInt(text,10);
                        onChange(Number.isNaN(parsed) ? 20 : parsed);
                    }}
                    keyboardType="numeric"
                    style={Style.QuuickGeneratorInput}
                    />
                )}
            />
            <ProfileSwitch
            label="Uppercase"
            value={passwordProfile.includeUppercase}
            onValueChange={(value)=>
                updatePasswordProfile({
                    includeUppercase: value
                })
            }
            />
            <ProfileSwitch
            label="Lowercase"
            value={passwordProfile.includeLowercase}
            onValueChange={(value)=>
                updatePasswordProfile({
                    includeLowercase: value
                })
            }
            />
            <ProfileSwitch
            label="Numbers"
            value={passwordProfile.includeNumbers}
            onValueChange={(value)=>
                updatePasswordProfile({
                   includeNumbers : value
                })
            }
            />
            <ProfileSwitch
            label="Symbols"
            value={passwordProfile.includeSymbols}
            onValueChange={(value)=>
                updatePasswordProfile({
                    includeSymbols: value
                })
            }
            />

            <Text style={Style.QuuickGeneratorLabel}>Allowed Symbols </Text>
            <Controller
                control={control}
                name="passwordProfile.allowedSymbols"
                render={({field: {value, onChange}})=> (
                    <TextInput
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    style={Style.QuuickGeneratorInput}
                    />
                )}
            />


            <Text style={Style.QuuickGeneratorLabel} >Password Version</Text>
            <Controller 
            control={control}
            name="passwordProfile.passwordVersion"
            render={({field:{value, onChange}})=>(
                <TextInput
                    value={String(value)}
                        onChangeText={(text)=>{
                            const parsed = Number.parseInt(text,10);
                            onChange(Number.isNaN(parsed) ? 1 : parsed );
                        }
                    }
                    keyboardType="numeric"
                    style={Style.QuuickGeneratorInput}
                />
            )}
            />

            <ProfileSwitch
            label="Avoid Ambiguous Characters"
            value={passwordProfile.avoidAmbiguousCharacters}
            onValueChange={(value)=>
                updatePasswordProfile({avoidAmbiguousCharacters: value})
            }
            />
            <ProfileSwitch
            label="Requiered start with letter"
            value={passwordProfile.requiredStartWithLetter}
            onValueChange={(value)=>
                updatePasswordProfile({requiredStartWithLetter: value})
            }
            />

            <CustomButton title="Generate" onPress={handleSubmit(onSubmit)}/>
        </ScrollView>
    );
}

type ProfileSwitchProps = {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
};

function ProfileSwitch({
    label,
    value,
    onValueChange,
}: ProfileSwitchProps){
    return (
        <View style={Style.QuuickGeneratorSwitchRow}>
            <Text>{label}</Text>
            <Switch value={value} onValueChange={onValueChange} />
        </View>
    );
}