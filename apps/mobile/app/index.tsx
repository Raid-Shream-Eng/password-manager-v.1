import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { CreateMasterPasswordScreen } from "../src/screens/CreateMasterPasswordScreen";
import { GeneratedPasswordResultScreen } from "../src/screens/GeneratedPasswordResultScreen";
import { QuickGeneratorScreen } from "../src/screens/QuickGeneratorScreen";
import { UnlockVaultScreen } from "../src/screens/UnlockVaultScreen";
import type { GeneratedPasswordResultParams } from "../src/navigation/navigation";
import { initializeDatabase } from "../src/repositories/database";
import { services } from "../src/services/serviceContainer";

type ScreenState = "create" | "unlock" | "quick-generator" | "generated-result";

export default function Index() {
  const [screen, setScreen] = useState<ScreenState>("create");
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [generatedResultParams, setGeneratedResultParams] =
    useState<GeneratedPasswordResultParams | null>(null);

  useEffect(() => {
    async function prepareDatabase() {
      try {
        await initializeDatabase();

        const hasVaultResult = await services.vaultSessionService.hasVault();

        if (!hasVaultResult.ok) {
          Alert.alert("Database error", hasVaultResult.error.message);
          return;
        }

        setScreen(hasVaultResult.value ? "unlock" : "create");
        setIsDatabaseReady(true);
      } catch (cause) {
        console.error(cause);
        Alert.alert("Database error", "Failed to initialize local database.");
      }
    }

    prepareDatabase();
  }, []);

  async function handleCreateVault(masterPassword: string) {
    const result = await services.vaultCreationService.createVault(
      masterPassword,
    );

    if (!result.ok) {
      Alert.alert("Could not create vault", result.error.message);
      return;
    }

    Alert.alert("Vault created", "Now unlock it with the same password.");
    setScreen("unlock");
  }

  async function handleUnlock(masterPassword: string) {
    const result = await services.vaultSessionService.unlock(masterPassword);

    if (!result.ok) {
      Alert.alert("Could not unlock vault", result.error.code);
      return;
    }

    Alert.alert("Vault unlocked", "You can now use Quick Generator.");
    setScreen("quick-generator");
  }

  function handleResetVault() {
    Alert.alert(
      "Reset is not implemented",
      "This button is only here for the temporary test flow.",
    );
  }
  const quickGeneratorNavigation = {
    navigate: (screenName: string, params?: unknown) => {
      if (screenName !== "GeneratedPasswordResult") {
        Alert.alert("Navigation not implemented", screenName);
        return;
      }

      setGeneratedResultParams(params as GeneratedPasswordResultParams);
      setScreen("generated-result");
    },
  };

  const generatedResultNavigation = {
    navigate: (screenName: string) => {
      if (screenName === "SaveGeneratedProfile") {
        Alert.alert(
          "Save Profile is not implemented",
          "This is a placeholder for the next step.",
        );
        return;
      }

      Alert.alert("Navigation not implemented", screenName);
    },
    goBack: () => {
      setGeneratedResultParams(null);
      setScreen("quick-generator");
    },
  };

  if (!isDatabaseReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffcb87",
        }}
      >
        <ActivityIndicator />
        <Text>Preparing local database...</Text>
      </View>
    );
  }

  if (screen === "unlock") {
    return (
      <UnlockVaultScreen
        onUnlock={handleUnlock}
        onResetVault={handleResetVault}
      />
    );
  }

  if (screen === "quick-generator") {
    return <QuickGeneratorScreen navigation={quickGeneratorNavigation} />;
  }

  if (screen === "generated-result" && generatedResultParams) {
    return (
      <GeneratedPasswordResultScreen
        route={{ params: generatedResultParams }}
        navigation={generatedResultNavigation}
      />
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffcb87" }}>
      <CreateMasterPasswordScreen onCreateVault={handleCreateVault} />
    </ScrollView>
  );
}