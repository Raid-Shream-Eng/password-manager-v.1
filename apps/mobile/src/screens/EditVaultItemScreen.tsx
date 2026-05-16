import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type {
  SiteIdentifier,
  VaultItemPayloadV1,
} from "@password-manager/shared-types";
import { normalizeDomain } from "@password-manager/password-core";
import type { EditVaultItemParams } from "../navigation/navigation";
import { services } from "../services/serviceContainer";
import type { DecryptedVaultItemV1 } from "../services/VaultItemService";
import {
  editVaultItemSchema,
  type EditVaultItemFormValues,
} from "../forms/editVaultItem.schema";
import { normalizeGenerationLabel } from "../utils/normalizeGenerationLabel";
import { buildGenerationIdentityKey } from "../utils/buildGenerationIdentityKey";

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
  const { itemId } = route.params;

  const [item, setItem] = useState<DecryptedVaultItemV1 | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditVaultItemFormValues>({
    resolver: zodResolver(editVaultItemSchema),
    defaultValues: {
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
        allowedSymbols: "!@#$%^&*_-+=?",
        passwordVersion: 1,
        avoidAmbiguousCharacters: false,
        requiredStartWithLetter: false,
      },
      notes: "",
    },
  });

  const identifierType = watch("identifierType");
  const passwordProfile = watch("passwordProfile");

  const originalGenerationKey = useMemo(() => {
    if (!item) {
      return null;
    }

    return buildGenerationIdentityKey(item.payload);
  }, [item]);

  const loadItem = useCallback(async () => {
    setIsLoading(true);

    try {
      const result = await services.vaultItemService.getItemById(itemId);

      if (!result.ok) {
        Alert.alert("Failed to load item", result.error.code);
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
        domainInput:
          payload.site.kind === "domain" ? payload.site.normalizedDomain : "",
        labelInput:
          payload.site.kind === "label" ? payload.site.generationLabel : "",
        usernameOrEmail: payload.usernameOrEmail,
        passwordProfile: payload.passwordProfile,
        notes: payload.notes ?? "",
      });
    } finally {
      setIsLoading(false);
    }
  }, [itemId, navigation, reset]);

  useEffect(() => {
    void loadItem();
  }, [loadItem]);

  function updatePasswordProfile(
    patch: Partial<EditVaultItemFormValues["passwordProfile"]>,
  ) {
    setValue("passwordProfile", {
      ...passwordProfile,
      ...patch,
    });
  }

  async function onSubmit(values: EditVaultItemFormValues) {
    if (!item) {
      return;
    }

    const siteResult = buildSiteIdentifier(values);

    if (!siteResult.ok) {
      Alert.alert("Invalid identifier", siteResult.error.code);
      return;
    }

    /**
     * With exact optional property types, an absent note must be omitted
     * instead of saved as notes: undefined.
     */
    const updatedPayload: VaultItemPayloadV1 = {
      ...item.payload,
      site: siteResult.value,
      usernameOrEmail: values.usernameOrEmail.trim(),
      passwordProfile: values.passwordProfile,
    };

    const trimmedNotes = values.notes?.trim();

    if (trimmedNotes) {
      updatedPayload.notes = trimmedNotes;
    } else {
      delete updatedPayload.notes;
    }

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

    const updatedGenerationKey = buildGenerationIdentityKey(updatedPayload);

    const passwordAffectingChange =
      originalGenerationKey !== null &&
      originalGenerationKey !== updatedGenerationKey;

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
        ],
      );

      return;
    }

    await savePayload(updatedPayload);
  }

  async function savePayload(payload: VaultItemPayloadV1) {
    if (!item) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await services.vaultItemService.updateItem({
        id: item.id,
        payload,
      });

      if (!result.ok) {
        Alert.alert("Save failed", result.error.code);
        return;
      }

      navigation.navigate("VaultItemDetails", {
        itemId: item.id,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function buildSiteIdentifier(
    values: EditVaultItemFormValues,
  ):
    | { ok: true; value: SiteIdentifier }
    | { ok: false; error: { code: string } } {
    if (values.identifierType === "domain") {
      const normalizedResult = normalizeDomain(values.domainInput ?? "");

      if (!normalizedResult.ok) {
        return {
          ok: false,
          error: {
            code: normalizedResult.error.code,
          },
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

    const labelResult = normalizeGenerationLabel(values.labelInput ?? "");

    if (!labelResult.ok) {
      return {
        ok: false,
        error: {
          code: labelResult.error.code,
        },
      };
    }

    return {
      ok: true,
      value: {
        kind: "label",
        displayName: values.displayName.trim(),
        generationLabel: labelResult.value,
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Vault Item</Text>

      <Text style={styles.warning}>
        Changing the domain, label, username, password rules, or password
        version will generate a different password.
      </Text>

      <Text style={styles.label}>Identifier Type</Text>
      <View style={styles.row}>
        <Button
          title="Domain"
          onPress={() => setValue("identifierType", "domain")}
        />
        <Button
          title="Label"
          onPress={() => setValue("identifierType", "label")}
        />
      </View>

      <Text style={styles.label}>Display Name</Text>
      <Controller
        control={control}
        name="displayName"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            style={styles.input}
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
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                style={styles.input}
              />
            )}
          />
          {errors.domainInput && (
            <Text style={styles.error}>{errors.domainInput.message}</Text>
          )}
        </>
      ) : (
        <>
          <Text style={styles.label}>Generation Label</Text>
          <Controller
            control={control}
            name="labelInput"
            render={({ field: { value, onChange } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                style={styles.input}
              />
            )}
          />
          {errors.labelInput && (
            <Text style={styles.error}>{errors.labelInput.message}</Text>
          )}
        </>
      )}

      <Text style={styles.label}>Username / Email</Text>
      <Controller
        control={control}
        name="usernameOrEmail"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            style={styles.input}
          />
        )}
      />
      {errors.usernameOrEmail && (
        <Text style={styles.error}>{errors.usernameOrEmail.message}</Text>
      )}

      <Text style={styles.sectionTitle}>Password Rules</Text>

      <Text style={styles.label}>Length</Text>
      <Controller
        control={control}
        name="passwordProfile.length"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={String(value)}
            onChangeText={(text) => {
              const parsed = Number.parseInt(text, 10);
              onChange(Number.isNaN(parsed) ? 20 : parsed);
            }}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
      {errors.passwordProfile?.length && (
        <Text style={styles.error}>{errors.passwordProfile.length.message}</Text>
      )}

      <ProfileSwitch
        label="Uppercase"
        value={passwordProfile.includeUppercase}
        onValueChange={(value) =>
          updatePasswordProfile({ includeUppercase: value })
        }
      />

      <ProfileSwitch
        label="Lowercase"
        value={passwordProfile.includeLowercase}
        onValueChange={(value) =>
          updatePasswordProfile({ includeLowercase: value })
        }
      />
      {errors.passwordProfile?.includeLowercase && (
        <Text style={styles.error}>
          {errors.passwordProfile.includeLowercase.message}
        </Text>
      )}

      <ProfileSwitch
        label="Numbers"
        value={passwordProfile.includeNumbers}
        onValueChange={(value) =>
          updatePasswordProfile({ includeNumbers: value })
        }
      />

      <ProfileSwitch
        label="Symbols"
        value={passwordProfile.includeSymbols}
        onValueChange={(value) =>
          updatePasswordProfile({ includeSymbols: value })
        }
      />

      <Text style={styles.label}>Allowed Symbols</Text>
      <Controller
        control={control}
        name="passwordProfile.allowedSymbols"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            autoCapitalize="none"
            style={styles.input}
          />
        )}
      />
      {errors.passwordProfile?.allowedSymbols && (
        <Text style={styles.error}>
          {errors.passwordProfile.allowedSymbols.message}
        </Text>
      )}

      <Text style={styles.label}>Password Version</Text>
      <Controller
        control={control}
        name="passwordProfile.passwordVersion"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={String(value)}
            onChangeText={(text) => {
              const parsed = Number.parseInt(text, 10);
              onChange(Number.isNaN(parsed) ? 1 : parsed);
            }}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
      />
      {errors.passwordProfile?.passwordVersion && (
        <Text style={styles.error}>
          {errors.passwordProfile.passwordVersion.message}
        </Text>
      )}

      <ProfileSwitch
        label="Avoid Ambiguous Characters"
        value={passwordProfile.avoidAmbiguousCharacters}
        onValueChange={(value) =>
          updatePasswordProfile({ avoidAmbiguousCharacters: value })
        }
      />

      <ProfileSwitch
        label="Require Start With Letter"
        value={passwordProfile.requiredStartWithLetter}
        onValueChange={(value) =>
          updatePasswordProfile({ requiredStartWithLetter: value })
        }
      />
      {errors.passwordProfile?.requiredStartWithLetter && (
        <Text style={styles.error}>
          {errors.passwordProfile.requiredStartWithLetter.message}
        </Text>
      )}

      <Text style={styles.label}>Encrypted Notes</Text>
      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={5}
            style={[styles.input, styles.notesInput]}
          />
        )}
      />

      <Button
        title={isSaving ? "Saving..." : "Save Changes"}
        disabled={isSaving}
        onPress={handleSubmit(onSubmit)}
      />

      <Button
        title="Cancel"
        disabled={isSaving}
        onPress={() => navigation.goBack()}
      />
    </ScrollView>
  );
}

type ProfileSwitchProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

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
