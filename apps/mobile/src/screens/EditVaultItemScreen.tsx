import {useCallback, useEffect, useMemo, useState} from "react";
import { 
    Alert,
     Button,
     ScrollView,
      StyleSheet,
       Switch,
        Text,
         TextInput,
          View 
 } from "react-native"; 
import { Controller, useForm } from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {siteIdentifierSchema, type SiteIdentifier, type VaultItemPayloadV1} from "@password-manager/shared-types";
import { normalizeDomain } from "@password-manager/password-core";
import type {EditVaultItemParams} from "../navigation/navigation";
import { services } from "../services/serviceContainer";
import type { DecryptedVaultItemV1 } from "../services/VaultItemService";
import { editVaultItemSchema, type EditVaultItemFormValues, } from "../forms/editeVaultItem.schema";
import { normalizeGenerationLabel } from "../utils/normalizeGenerationLabel";
import { buildGenerationIdentityKey } from "../utils/buildGenerationIdentityKey";
import { CustomButton } from "../components/Customs/customButton";

type Props = {
    route: {
        params: EditVaultItemParams;
    };
    navigation: {
        goBack: () => void;
        navigate: (screen: string, params?: unknown) => void;
    };
};

export function EditVaultItemScreen({ route, navigation }: Props) {
    const {itemId} = route.params;
    const [item, setItem] = useState<DecryptedVaultItemV1 | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },}= useForm<EditVaultItemFormValues>({
            resolver: zodResolver(editVaultItemSchema),
            defaultValues:{
                identifierType: "domain",
                displayName: "",
                domainInput: "",
                labelInput: "",
                usernameOrEmail: "",
                passwordProfile: {
                    length: 20,
                    includeUppercase: true,
                    includeLowercase: true,
                    includeNumbers: true,
                    includeSymbols: true,
                    allowedSymbols: "!@#$%^&*_-+=",
                    passwordVersion: 1,
                    avoidAmbiguousCharacters: true,
                    requiredStartWithLetter: true,
                },
                notes: "",
            },
        });
        const identifierType = watch("identifierType");
        const passwordProfile = watch("passwordProfile");

        const originalGenerationKey = useMemo(()=>{
            if(!item) {
                return null;
            }

            return buildGenerationIdentityKey(item.payload)
        },[item]);
        const loadItem = useCallback(async () => {
            setIsLoading(true);
            try {
                const result =await services.vaultItemService.getItemById(itemId);
                 
                if (!result.ok){
                    Alert.alert("Failed to load vault item.", result.error.code);
                    return;
                }

                if (!result.value) {
                    Alert.alert("Not found", "Vault item was not found.");
                    navigation.goBack();
                    return;
                }

                setItem(result.value);
                const payload = result.value.payload;
                reset({
                    identifierType: payload.site.kind,
                    displayName: payload.site.displayName,
                    domainInput: payload.site.kind === "domain" ? payload.site.normalizedDomain : "",
                    labelInput: payload.site.kind === "label" ? payload.site.generationLabel : "",
                    usernameOrEmail: payload.usernameOrEmail,
                    passwordProfile: payload.passwordProfile,
                    notes: payload.notes,
                });
            } finally {
                setIsLoading(false);
            }
        }, [itemId, navigation, reset]);

        useEffect(() => {
            void loadItem();
        }, [loadItem]);

        function updatePasswordProfile(
            patch: Partial<EditVaultItemFormValues["passwordProfile"]>
        ){
            setValue("passwordProfile", {
                ...passwordProfile,
                ...patch,
            });
        }

        async function onSubmit(values: EditVaultItemFormValues) {
            if (!item) {
                Alert.alert("Error", "Item data is not loaded.");
                return;
            }
            const siteResult = buildSiteIdentifier(values);

            if (!siteResult.ok) {
                Alert.alert("Invalid identifier", siteResult.error.code);
                return;
            }

            const trimedNotes = values.notes?.trim();
            const { notes: _oldNotes, ...payloadWithoutNotes } = item.payload;
            const updatedPayload: VaultItemPayloadV1 = {
                ...payloadWithoutNotes,
                site: siteResult.value,
                usernameOrEmail: values.usernameOrEmail.trim(),
                passwordProfile: values.passwordProfile,
                ...(trimedNotes ? { notes: trimedNotes } : {}),
            };
            const updateGenerationKey = buildGenerationIdentityKey(updatedPayload);

            const duplicateResult = await services.vaultItemService.hasDuplicate({
                site: updatedPayload.site,
                usernameOrEmail: updatedPayload.usernameOrEmail,
                excludeItemId: item.id,
            });
                if (!duplicateResult.ok) {
                  Alert.alert("Duplicate check failed", duplicateResult.error.code);
                  return;
                }
                if (duplicateResult.value) {
                  Alert.alert(
                    "Duplicate item",
                    "Another item with this account identifier and username already exists.",
                    );
                    return;
                }
            const passwordAffectingChange = 
            originalGenerationKey !== null &&
            originalGenerationKey !== updateGenerationKey;
            if (passwordAffectingChange) {
                Alert.alert(
                    "Password will change",
                    "Changing this field will generate a different password. Make sure you update the password on the website or service before relying on the new one.",
                    [
                     {
                        text: "Cancel",
                        style: "cancel",
                     },
                     {
                        text: "Save Anyway",
                        style: "destructive",
                        onPress: () => {
                        void savePayload(updatedPayload);
                        },
                     },
                    ]
                );
                return;
            }
            
            await savePayload(updatedPayload);
        }

        async function savePayload(payload: VaultItemPayloadV1) {
            if (!item) {
                Alert.alert("Error", "Item data is not loaded.");
                return;
            }
            setIsSaving(true);
            try {
                const result = await services.vaultItemService.updateItem({id:item.id, payload});
                if (!result.ok) {
                    Alert.alert("Save failed", result.error.code);
                    return;
                }
                navigation.navigate("VaultItemDetails", { itemId: item.id });
            }finally {
                setIsSaving(false);
            }
        }

        function buildSiteIdentifier(
            values: EditVaultItemFormValues
        ): |{ok: true; value: SiteIdentifier}
           |{ok: false; error: {code: string}} {
            if (values.identifierType === "domain") {
            const normalizedResult = normalizeDomain(values.domainInput??"");
        
            if (!normalizedResult.ok) {
                return {
                    ok: false,
                    error: { code: normalizedResult.error.code },
                };
            }
            return {
                ok: true,
                value: {
                    kind: "domain",
                    displayName: values.displayName.trim(),
                    normalizedDomain: normalizedResult.value,
                },
            };
        }
        const LabelResult = normalizeGenerationLabel(values.labelInput??"");

        if (!LabelResult.ok) {
            return {
                ok: false,
                error: { code: LabelResult.error.code },
            };
        }
        return {
            ok: true,
            value: {
                kind: "label",
                displayName: values.displayName.trim(),
                generationLabel: LabelResult.value,
            },
        };
}
  if (isLoading || !item) {
    return (
      <View style={styles.center}>
        <Text>Loading item...</Text>
      </View>
    );
  }
return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Edit Vault Item</Text>

        <Text style={styles.warning}>
        Changing the domain, label, username, password rules, or password
        version will generate a different password.
        </Text>
        <Text style={styles.label}>Identifier Type</Text>
        <View style={styles.row}>
            <CustomButton
                title="Domain"
                onPress={() => setValue("identifierType", "domain")}
            />
            <CustomButton
                title="Label"
                onPress={() => setValue("identifierType", "label")}
            />
        </View>
        <Text style={styles.label}>Display Name</Text>
        <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, value } }) => (
                <TextInput
                    style={styles.input}
                    placeholder="Display Name"
                    value={value}
                    onChangeText={onChange}
                />
            )}
        />
        {errors.displayName && (
            <Text style={styles.error}>{errors.displayName.message}</Text>
        )}
        {identifierType === "domain" ? (
            <>
                <Text style={styles.label}>Domain</Text>
                <Controller
                    control={control}
                    name="domainInput"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="example.com"
                            value={value}
                            onChangeText={onChange}
                            autoCapitalize="none"
                        />
                    )}
                />
                {errors.domainInput && (
                    <Text style={styles.error}>{errors.domainInput.message}</Text>
                )}
            </>
        ):(
            <>
                <Text style={styles.label}>Label</Text>
                <Controller
                    control={control}
                    name="labelInput"
                    render={({ field: { onChange, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Label"
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />
                {errors.labelInput && (
                    <Text style={styles.error}>{errors.labelInput.message}</Text>
                )}
            </>
        )}

        <Text style={styles.label}>Username or Email</Text>
        <Controller
            control={control}
            name="usernameOrEmail"
            render={({ field: { onChange, value } }) => (
                <TextInput
                    style={styles.input}
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                />
            )}
        />
        {errors.usernameOrEmail && (
            <Text style={styles.error}>{errors.usernameOrEmail.message}</Text>
        )}
        <Text style={styles.sectionTitle}>Password Rules</Text>
        <Text style={styles.label}>Length: {passwordProfile.length}</Text>
        <Controller
            control={control}
            name="passwordProfile.length"
            render={({ field: { onChange, value } }) => (
                <TextInput
                value={String(value)}
                onChangeText={(text) => {
                    const parsed = Number.parseInt(text, 10);
                    onChange(Number.isNaN(parsed) ? 20 : parsed);
                }}
                style={styles.input}
                keyboardType="number-pad"
                />
            )}
        />
        <ProfileSwitch
            label="Include Uppercase Letters"
            value={passwordProfile.includeUppercase}
            onValueChange={(value) => updatePasswordProfile({ includeUppercase: value })}
        />
        <ProfileSwitch
            label="Include Lowercase Letters"
            value={passwordProfile.includeLowercase}
            onValueChange={(value) => updatePasswordProfile({ includeLowercase: value })}   
        />
        <ProfileSwitch
            label="Include Numbers"
            value={passwordProfile.includeNumbers}
            onValueChange={(value) => updatePasswordProfile({ includeNumbers: value })}
        />
        <ProfileSwitch
            label="Include Symbols"
            value={passwordProfile.includeSymbols}
            onValueChange={(value) => updatePasswordProfile({ includeSymbols: value })}
        />
        <Text style={styles.label}>Allowed Symbols</Text>
        <Controller

            control={control}
            name="passwordProfile.allowedSymbols"
            render={({ field: { onChange, value } }) => (   
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    style={styles.input}
                    autoCapitalize="none"
                />
            )}
        />  

        <Text style={styles.label}>Password Version</Text>
        <Controller
            control={control}
            name="passwordProfile.passwordVersion"
            render={({ field: { onChange, value } }) => (
                <TextInput
                value={String(value)}
                onChangeText={(text) => {
                    const parsed = Number.parseInt(text, 10);
                    onChange(Number.isNaN(parsed) ? 1 : parsed);
                }}
                style={styles.input}
                keyboardType="numeric"
                />
            )}
        />

        <ProfileSwitch
            label="Avoid Ambiguous Characters (e.g. 0, O, l, 1)"
            value={passwordProfile.avoidAmbiguousCharacters}
            onValueChange={(value) => updatePasswordProfile({ avoidAmbiguousCharacters: value })}
        />
        <ProfileSwitch
            label="Require Password to Start with a Letter"
            value={passwordProfile.requiredStartWithLetter}
            onValueChange={(value) => updatePasswordProfile({ requiredStartWithLetter: value })}
        />

        <Text style={styles.label}>Notes</Text>
        <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
                <TextInput
                    style={[styles.input, styles.notesInput]}
                    value={value}
                    onChangeText={onChange}
                    multiline
                    numberOfLines={5}
                />
            )}
        />

        <CustomButton
            title={isSaving ? "Saving..." : "Save Changes"}
            onPress={handleSubmit(onSubmit)}
            disabled={isSaving}
        />

        <CustomButton
            title="Cancel"
            onPress={() => navigation.goBack()}
            disabled={isSaving}
        />
    </ScrollView>
);
}
type ProfileSwitchProps = {
    label: string;
    value: boolean;
    onValueChange: (newValue: boolean) => void;
}

function ProfileSwitch({ label, value, onValueChange }: ProfileSwitchProps) {
    return (
        <View style={styles.switchRow}>
            <Text>{label}</Text>
            <Switch value={value} onValueChange={onValueChange} />
        </View>
    );
}


const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 10,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  warning: {
    fontSize: 13,
    color: "#555",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
  },
  notesInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  error: {
    color: "#b00020",
  },
});