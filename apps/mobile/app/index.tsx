import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { CreateMasterPasswordScreen } from "../src/screens/CreateMasterPasswordScreen";
import { GeneratedPasswordResultScreen } from "../src/screens/GeneratedPasswordResultScreen";
import { QuickGeneratorScreen } from "../src/screens/QuickGeneratorScreen";
import { UnlockVaultScreen } from "../src/screens/UnlockVaultScreen";
import type { GeneratedPasswordResultParams, SaveGeneratedProfileParams } from "../src/navigation/navigation";
import { initializeDatabase } from "../src/repositories/database";
import { services } from "../src/services/serviceContainer";
import { SaveGeneratedProfileScreen } from "../src/screens/SaveGeneratedProfileScreen";
import { VaultListScreen } from "../src/screens/VaultListScreen";
import { VaultItemDetailsScreen } from "../src/screens/VaultItemDetailsScreen"; 
import { EditVaultItemScreen } from "../src/screens/EditVaultItemScreen";
import { RecentlyDeletedScreen } from "../src/screens/RecentlyDeletedScreen";

type ScreenState =
  | "create"
  | "unlock"
  | "quick-generator"
  | "generated-result"
  | "save-profile"
  | "vault-list"
  | "vault-details"
  | "edit-vault-item"
  | "recently-deleted";

export default function Index() {
  const [generatedResultParams, setGeneratedResultParams] =
    useState<GeneratedPasswordResultParams | null>(null);
  const [saveProfileParams, setSaveProfileParams] =
    useState<SaveGeneratedProfileParams | null>(null);
  const [vaultItemId, setVaultItemId] = useState<string | null>(null);
  const [screen, setScreen] = useState<ScreenState>("create");
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
 
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
      if (screenName === "GeneratedPasswordResult") {
        setGeneratedResultParams(params as GeneratedPasswordResultParams);
        setScreen("generated-result");
        return;
      }
      Alert.alert("Navigation not implemented", screenName);
    },
  };

  const generatedResultNavigation = {
    navigate: (screenName: string, params?: unknown) => {
      if (screenName === "SaveGeneratedProfile") {
        setSaveProfileParams(params as SaveGeneratedProfileParams);
        setScreen("save-profile");
        return;
      }

      Alert.alert("Navigation not implemented", screenName);
    },
    goBack: () => {
      setGeneratedResultParams(null);
      setScreen("quick-generator");
    },
  };

  const vaultListNavigation = {
  navigate: (screenName: string, params?: unknown) => {
    if (screenName === "QuickGenerator") {
      setScreen("quick-generator");
      return;
    }

    if (screenName === "VaultItemDetails") {
      const itemId = (params as { itemId: string }).itemId;
      setVaultItemId(itemId);
      setScreen("vault-details");
      return;
    }

    if (screenName === "RecentlyDeleted") {
      setScreen("recently-deleted");
      return;
    }
    Alert.alert("Navigation not implemented", screenName);
  },
};

    const saveProfileNavigation = {
  navigate: (screenName: string, params?: unknown) => {
    if (screenName === "VaultItemDetails") {
      const itemId = (params as { itemId: string }).itemId;
      setVaultItemId(itemId);
      setScreen("vault-details");
      return;
    }

    Alert.alert("Navigation not implemented", screenName);
  },
  goBack: () => {
    setScreen("generated-result");
  },
};

const vaultDetailsNavigation = {
  navigate: (screenName: string, params?: unknown) => {
    if (screenName === "EditVaultItem") {
      const itemId = (params as { itemId: string }).itemId;
      setVaultItemId(itemId);
      setScreen("edit-vault-item");
      return;
    }

    Alert.alert("Navigation not implemented", screenName);
  },
  goBack: () => {
    setScreen("vault-list");
  },
};

const editVaultItemNavigation = {
  navigate: (screenName: string, params?: unknown) => {
    if (screenName === "VaultItemDetails") {
      const itemId = (params as { itemId: string }).itemId;
      setVaultItemId(itemId);
      setScreen("vault-details");
      return;
    }

    Alert.alert("Navigation not implemented", screenName);
  },
  goBack: () => {
    setScreen("vault-details");
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

  if (screen === "vault-list") {
    return <VaultListScreen navigation={vaultListNavigation} />;
  }
  if (screen === "save-profile" && saveProfileParams) {
  return (
    <SaveGeneratedProfileScreen
      route={{ params: saveProfileParams }}
      navigation={saveProfileNavigation}
    />
  );
}

if (screen === "vault-details" && vaultItemId) {
  return (
    <VaultItemDetailsScreen
      route={{ params: { itemId: vaultItemId } }}
      navigation={vaultDetailsNavigation}
    />
  );
}

if (screen === "edit-vault-item" && vaultItemId) {
  return (
    <EditVaultItemScreen
      route={{ params: { itemId: vaultItemId } }}
      navigation={editVaultItemNavigation}
    />
  );
}

if (screen === "recently-deleted") {
  return <RecentlyDeletedScreen />;
}
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#ffcb87" }}>
      <CreateMasterPasswordScreen onCreateVault={handleCreateVault} />
    </ScrollView>
  );
}