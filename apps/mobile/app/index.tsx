import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { CreateMasterPasswordScreen } from "../src/screens/CreateMasterPasswordScreen";
import { EditVaultItemScreen } from "../src/screens/EditVaultItemScreen";
import { GeneratedPasswordResultScreen } from "../src/screens/GeneratedPasswordResultScreen";
import { QuickGeneratorScreen } from "../src/screens/QuickGeneratorScreen";
import { RecentlyDeletedScreen } from "../src/screens/RecentlyDeletedScreen";
import { SaveGeneratedProfileScreen } from "../src/screens/SaveGeneratedProfileScreen";
import { UnlockVaultScreen } from "../src/screens/UnlockVaultScreen";
import { VaultItemDetailsScreen } from "../src/screens/VaultItemDetailsScreen";
import { VaultListScreen } from "../src/screens/VaultListScreen";
import type {
  EditVaultItemParams,
  GeneratedPasswordResultParams,
  SaveGeneratedProfileParams,
  VaultItemDetailsParams,
} from "../src/navigation/navigation";
import { initializeDatabase } from "../src/repositories/database";
import { services } from "../src/services/serviceContainer";

type ScreenState =
  | "create"
  | "unlock"
  | "vault-list"
  | "quick-generator"
  | "generated-result"
  | "save-generated-profile"
  | "vault-item-details"
  | "edit-vault-item"
  | "recently-deleted";

export default function Index() {
  const [screen, setScreen] = useState<ScreenState>("create");
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [generatedResultParams, setGeneratedResultParams] =
    useState<GeneratedPasswordResultParams | null>(null);
  const [saveGeneratedProfileParams, setSaveGeneratedProfileParams] =
    useState<SaveGeneratedProfileParams | null>(null);
  const [vaultItemDetailsParams, setVaultItemDetailsParams] =
    useState<VaultItemDetailsParams | null>(null);
  const [editVaultItemParams, setEditVaultItemParams] =
    useState<EditVaultItemParams | null>(null);

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

    Alert.alert("Vault unlocked", "You can now manage your vault.");
    setScreen("vault-list");
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
    navigate: (screenName: string, params?: unknown) => {
      if (screenName === "SaveGeneratedProfile") {
        setSaveGeneratedProfileParams(params as SaveGeneratedProfileParams);
        setScreen("save-generated-profile");
        return;
      }

      Alert.alert("Navigation not implemented", screenName);
    },
    goBack: () => {
      setGeneratedResultParams(null);
      setScreen("quick-generator");
    },
  };

  const saveGeneratedProfileNavigation = {
    navigate: (screenName: string, params?: unknown) => {
      if (screenName === "VaultItemDetails") {
        setVaultItemDetailsParams(params as VaultItemDetailsParams);
        setSaveGeneratedProfileParams(null);
        setGeneratedResultParams(null);
        setScreen("vault-item-details");
        return;
      }

      Alert.alert("Navigation not implemented", screenName);
    },
    goBack: () => {
      setSaveGeneratedProfileParams(null);
      setScreen("generated-result");
    },
  };

  const vaultListNavigation = {
    navigate: (screenName: string, params?: unknown) => {
      if (screenName === "VaultItemDetails") {
        setVaultItemDetailsParams(params as VaultItemDetailsParams);
        setScreen("vault-item-details");
        return;
      }

      if (screenName === "QuickGenerator") {
        setScreen("quick-generator");
        return;
      }

      if (screenName === "RecentlyDeleted") {
        setScreen("recently-deleted");
        return;
      }

      Alert.alert("Navigation not implemented", screenName);
    },
  };

  const vaultItemDetailsNavigation = {
    navigate: (screenName: string, params?: unknown) => {
      if (screenName === "EditVaultItem") {
        setEditVaultItemParams(params as EditVaultItemParams);
        setScreen("edit-vault-item");
        return;
      }

      Alert.alert("Navigation not implemented", screenName);
    },
    goBack: () => {
      setVaultItemDetailsParams(null);
      setScreen("vault-list");
    },
  };

  const editVaultItemNavigation = {
    navigate: (screenName: string, params?: unknown) => {
      if (screenName === "VaultItemDetails") {
        setVaultItemDetailsParams(params as VaultItemDetailsParams);
        setEditVaultItemParams(null);
        setScreen("vault-item-details");
        return;
      }

      Alert.alert("Navigation not implemented", screenName);
    },
    goBack: () => {
      setEditVaultItemParams(null);
      setScreen("vault-item-details");
    },
  };

  const recentlyDeletedNavigation = {
    goBack: () => {
      setScreen("vault-list");
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

  if (screen === "save-generated-profile" && saveGeneratedProfileParams) {
    return (
      <SaveGeneratedProfileScreen
        route={{ params: saveGeneratedProfileParams }}
        navigation={saveGeneratedProfileNavigation}
      />
    );
  }

  if (screen === "vault-list") {
    return <VaultListScreen navigation={vaultListNavigation} />;
  }

  if (screen === "vault-item-details" && vaultItemDetailsParams) {
    return (
      <VaultItemDetailsScreen
        route={{ params: vaultItemDetailsParams }}
        navigation={vaultItemDetailsNavigation}
      />
    );
  }

  if (screen === "edit-vault-item" && editVaultItemParams) {
    return (
      <EditVaultItemScreen
        route={{ params: editVaultItemParams }}
        navigation={editVaultItemNavigation}
      />
    );
  }

  if (screen === "recently-deleted") {
    return <RecentlyDeletedScreen navigation={recentlyDeletedNavigation} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffcb87", padding:45, margin:30,}}>
      <CreateMasterPasswordScreen onCreateVault={handleCreateVault} />
    </ScrollView>
  );
}
