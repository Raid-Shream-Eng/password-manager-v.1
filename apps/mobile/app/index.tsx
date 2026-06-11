import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
function ScreenFrame({ children }: { children: React.ReactNode }) {
  return <View style={styles.screenFrame}>{children}</View>;
}

const styles = StyleSheet.create({
  screenFrame: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 15,
    marginBottom:10,
  },
});

export default function Index() {
  const [generatedResultParams, setGeneratedResultParams] =
    useState<GeneratedPasswordResultParams | null>(null);
  const [saveProfileParams, setSaveProfileParams] =
    useState<SaveGeneratedProfileParams | null>(null);
  const [vaultItemId, setVaultItemId] = useState<string | null>(null);
  const [screen, setScreen] = useState<ScreenState>("create");
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
   const screenTitle: Record<ScreenState, string> = {
  create: "Create Vault",
  unlock: "Unlock Vault",
  "quick-generator": "Quick Generator",
  "generated-result": "Generated Password",
  "save-profile": "Save Profile",
  "vault-list": "Vault",
  "vault-details": "Vault Details",
  "edit-vault-item": "Edit Vault Item",
  "recently-deleted": "Recently Deleted",
};
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
  function handleHeaderBack() {
  if (screen === "quick-generator") {
    setScreen("vault-list");
    return;
  }

  if (screen === "generated-result") {
    setGeneratedResultParams(null);
    setScreen("quick-generator");
    return;
  }

  if (screen === "save-profile") {
    setScreen("generated-result");
    return;
  }

  if (screen === "vault-details") {
    setScreen("vault-list");
    return;
  }

  if (screen === "edit-vault-item") {
    setScreen("vault-details");
    return;
  }

  if (screen === "recently-deleted") {
    setScreen("vault-list");
  }
}
const CanShowHeaderBack = screen !== "create" && screen !== "unlock" && screen !== "vault-list";

const headerOptions = {
  title: screenTitle[screen],
  headerTitleAlign: "center" as const,
  headerBackVisible: false,
  ...(CanShowHeaderBack
    ? {
        headerLeft: () => (
          <Pressable
            onPress={handleHeaderBack}
            style={{ paddingHorizontal: 12 }}
          >
            <Text style={{ fontSize: 16 }}>Back</Text>
          </Pressable>
        ),
      }
    : {}),
};

const header = <Stack.Screen options={headerOptions} />;
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
    <>
    {header} 
      <ScreenFrame>
        <UnlockVaultScreen
          onUnlock={handleUnlock}
          onResetVault={handleResetVault}
        />
      </ScreenFrame>
    </>
    );
  }

  if (screen === "quick-generator") {
    return <>
     {header}
      <ScreenFrame>
         <QuickGeneratorScreen navigation={quickGeneratorNavigation} />
      </ScreenFrame>
    </>;
  }

  if (screen === "generated-result" && generatedResultParams) {
    return (<>
    {header}
     <ScreenFrame>
      <GeneratedPasswordResultScreen
        route={{ params: generatedResultParams }}
        navigation={generatedResultNavigation}
      />
      </ScreenFrame>
      </>
    );
  }

  if (screen === "vault-list") {
    return <>{header}<VaultListScreen navigation={vaultListNavigation} /></>;
  }
  if (screen === "save-profile" && saveProfileParams) {
  return (<>
  {header}
   <ScreenFrame>
    <SaveGeneratedProfileScreen
      route={{ params: saveProfileParams }}
      navigation={saveProfileNavigation}
    />
    </ScreenFrame>
    </>
  );
}

if (screen === "vault-details" && vaultItemId) {
  return (<>
  {header}
   <ScreenFrame>
    <VaultItemDetailsScreen
      route={{ params: { itemId: vaultItemId } }}
      navigation={vaultDetailsNavigation}
    />
    </ScreenFrame>
    </>
  );
}

if (screen === "edit-vault-item" && vaultItemId) {
  return (
  <>
  {header}
   <ScreenFrame>
    <EditVaultItemScreen
      route={{ params: { itemId: vaultItemId } }}
      navigation={editVaultItemNavigation}
    />
    </ScreenFrame>
  </>
  );
}

if (screen === "recently-deleted") {
  const recentlyDeletedNavigation = {
  goBack: () => {
    setScreen("vault-list");
  },
};
  return <>{header}<RecentlyDeletedScreen navigation={recentlyDeletedNavigation} /></>;
}
  return (
  <>
    {header}
     <ScreenFrame>
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: "#ffcb87" }}>
      <CreateMasterPasswordScreen onCreateVault={handleCreateVault} />
    </ScrollView></ScreenFrame>
  </>
  );

}