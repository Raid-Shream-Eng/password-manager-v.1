import { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { CustomButton } from "../components/Customs/customButton";
import { useClipboardTimeout } from "../hooks/useClipboardTimeout";
import type { VaultItemDetailsParams } from "../navigation/navigation";
import type { DecryptedVaultItemV1 } from "../services/VaultItemService";
import { services } from "../services/serviceContainer";
import { buildGenerationInputFromVaultItem } from "../utils/buildGenerationInputFromVaultItem";
import Style from "./style";

type Props = {
  route: {
    params: VaultItemDetailsParams;
  };
  navigation: {
    navigate: (screen: string, params?: unknown) => void;
    goBack: () => void;
  };
};

export function VaultItemDetailsScreen({ route, navigation }: Props) {
  const { itemId } = route.params;

  const [item, setItem] = useState<DecryptedVaultItemV1 | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * This only clears the generated password from local screen state.
   * It must not load vault items or call storage.
   */
  const clearGeneratedPassword = useCallback(() => {
    setGeneratedPassword(null);
    setIsRevealed(false);
  }, []);

  const { isCopied, remainingSeconds, copyWithTimeout, clearClipboard } =
    useClipboardTimeout({
      timeoutMs: 60_000,
      onTimeout: clearGeneratedPassword,
    });

  /**
   * This loads the decrypted vault item metadata after unlock.
   * It is separate from clearGeneratedPassword so each function has one job.
   */
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
    } finally {
      setIsLoading(false);
    }
  }, [itemId, navigation]);

  useEffect(() => {
    void loadItem();

    return () => {
      clearGeneratedPassword();
      void clearClipboard();
    };
  }, [loadItem, clearGeneratedPassword, clearClipboard]);

  async function handleGeneratePassword() {
    if (!item) {
      return;
    }

    setIsGenerating(true);

    try {
      const generationInput = buildGenerationInputFromVaultItem(item.payload);

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
  }

  async function handleCopyPassword() {
    if (!item) {
      return;
    }

    setIsGenerating(true);

    try {
      const generationInput = buildGenerationInputFromVaultItem(item.payload);

      const result = await services.generatorService.generateFromInput(
        generationInput,
      );

      if (!result.ok) {
        Alert.alert("Generation failed", result.error.code);
        return;
      }

      setGeneratedPassword(result.value);
      await copyWithTimeout(result.value);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleRevealToggle() {
    setIsRevealed((current) => !current);
  }

  async function handleSoftDelete() {
    Alert.alert("Delete item?", "This item will move to Recently Deleted.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await services.vaultItemService.softDeleteItem(itemId);

          if (!result.ok) {
            Alert.alert("Delete failed", result.error.code);
            return;
          }

          clearGeneratedPassword();
          navigation.goBack();
        },
      },
    ]);
  }

  if (isLoading || !item) {
    return (
      <View style={Style.GeneratedPasswordResultContainer}>
        <Text>Loading item...</Text>
      </View>
    );
  }

  const site = item.payload.site;
  const target =
    site.kind === "domain" ? site.normalizedDomain : site.generationLabel;

  const passwordDisplay =
    generatedPassword && isRevealed ? generatedPassword : "********************";

  return (
    <ScrollView contentContainerStyle={Style.GeneratedPasswordResultContainer}>
      <Text style={Style.GeneratedPasswordResultTitle}>{site.displayName}</Text>

      <View style={Style.GeneratedPasswordResultCard}>
        <Text style={Style.GeneratedPasswordResultLabel}>Identifier</Text>
        <Text style={Style.GeneratedPasswordResultValue}>{target}</Text>

        <Text style={Style.GeneratedPasswordResultLabel}>Username / Email</Text>
        <Text style={Style.GeneratedPasswordResultValue}>
          {item.payload.usernameOrEmail}
        </Text>

        <Text style={Style.GeneratedPasswordResultLabel}>Password Version</Text>
        <Text style={Style.GeneratedPasswordResultValue}>
          {item.payload.passwordProfile.passwordVersion}
        </Text>

        <Text style={Style.GeneratedPasswordResultLabel}>Length</Text>
        <Text style={Style.GeneratedPasswordResultValue}>
          {item.payload.passwordProfile.length}
        </Text>

        {item.payload.notes && (
          <>
            <Text style={Style.GeneratedPasswordResultLabel}>
              Encrypted Notes
            </Text>
            <Text style={Style.GeneratedPasswordResultValue}>
              {item.payload.notes}
            </Text>
          </>
        )}
      </View>

      <View style={Style.GeneratedPasswordResultPasswordBox}>
        <Text style={Style.GeneratedPasswordResultPasswordText}>
          {passwordDisplay}
        </Text>
      </View>

      {isCopied && remainingSeconds !== null && (
        <Text style={Style.GeneratedPasswordResultCopiedText}>
          Copied. Clipboard clear will be attempted in {remainingSeconds} seconds.
        </Text>
      )}

      <View style={Style.GeneratedPasswordResultActions}>
        <CustomButton
          title="Generate"
          onPress={handleGeneratePassword}
          disabled={isGenerating}
        />

        <CustomButton
          title="Copy"
          onPress={handleCopyPassword}
          disabled={isGenerating}
        />

        <CustomButton
          title={isRevealed ? "Hide" : "Reveal"}
          onPress={handleRevealToggle}
          disabled={!generatedPassword || isGenerating}
        />

        <CustomButton
          title="Edit"
          onPress={() => navigation.navigate("EditVaultItem", { itemId })}
        />

        <CustomButton
          title="Delete"
          onPress={handleSoftDelete}
          backgroundColor="#aa0000"
          color="#fff"
          fontWeight="700"
        />
      </View>

      <Text style={Style.GeneratedPasswordResultWarning}>
        This password is regenerated from encrypted metadata. The generated
        password itself is not stored.
      </Text>
    </ScrollView>
  );
}
