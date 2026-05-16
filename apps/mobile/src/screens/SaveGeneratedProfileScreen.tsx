import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomButton } from "../components/Customs/customButton";
import {
  saveGeneratedProfileSchema,
  type SaveGeneratedProfileFormValues,
} from "../forms/saveGeneratedProfile.schema";
import type { SaveGeneratedProfileParams } from "../navigation/navigation";
import { services } from "../services/serviceContainer";
import Style from "./style";

type Props = {
  route: { params: SaveGeneratedProfileParams };
  navigation: {
    navigate: (screen: string, params?: unknown) => void;
    goBack: () => void;
  };
};

export function SaveGeneratedProfileScreen({ route, navigation }: Props) {
  const { displayName, site, usernameOrEmail, passwordProfile } = route.params;
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit } = useForm<SaveGeneratedProfileFormValues>({
    resolver: zodResolver(saveGeneratedProfileSchema),
    defaultValues: { notes: "" },
  });

  async function onSubmit(values: SaveGeneratedProfileFormValues) {
    setIsSaving(true);

    try {
      const notes = values.notes?.trim();

const createInput = {
  site,
  usernameOrEmail,
  passwordProfile,
};

const result = await services.vaultItemService.createItem(
  notes
    ? {
        ...createInput,
        notes,
      }
    : createInput,
);

      if (!result.ok) {
        Alert.alert(
          result.error.code === "DUPLICATE_VAULT_ITEM"
            ? "Duplicate item"
            : "Save failed",
          result.error.message,
        );
        return;
      }

      navigation.navigate("VaultItemDetails", { itemId: result.value.id });
    } finally {
      setIsSaving(false);
    }
  }

  const targetValue =
    site.kind === "domain" ? site.normalizedDomain : site.generationLabel;

  return (
    <ScrollView contentContainerStyle={Style.GeneratedPasswordResultContainer}>
      <Text style={Style.GeneratedPasswordResultTitle}>Save Profile</Text>

      <View style={Style.GeneratedPasswordResultCard}>
        <Text>{displayName}</Text>
        <Text>{targetValue}</Text>
        <Text>{usernameOrEmail}</Text>
        <Text>Password version: {passwordProfile.passwordVersion}</Text>
      </View>

      <Text>
        This saves encrypted profile metadata only. The generated password is
        not stored.
      </Text>

      <Controller
        control={control}
        name="notes"
        render={({ field: { value, onChange } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="Optional encrypted notes"
            multiline
            numberOfLines={5}
            style={Style.QuuickGeneratorInput}
          />
        )}
      />

      <CustomButton
        title={isSaving ? "Saving..." : "Save Encrypted Profile"}
        disabled={isSaving}
        onPress={handleSubmit(onSubmit)}
        backgroundColor="#000"
        color="#fff"
        fontWeight="700"
      />

      <CustomButton
        title="Cancel"
        disabled={isSaving}
        onPress={navigation.goBack}
      />
    </ScrollView>
  );
}