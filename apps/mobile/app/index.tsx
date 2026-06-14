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
import { ResetVaultWarningScreen } from "../src/screens/ResetVaultWarningScreen";
import { useAppTheme } from "../src/theme/theme";
import { useAppLock } from "../src/hooks/useAppLock";
import { ManualLockButton } from "../src/components/Customs/ManualLockButton";
import { useDispatch, useSelector } from "react-redux";
import { setUnlocked } from "../src/store/sessionSlice";
import type { RootState } from "../src/store";

type ScreenState =
  | "create"
  | "unlock"
  | "quick-generator"
  | "reset-vault-warning"
  | "generated-result"
  | "save-profile"
  | "vault-list"
  | "vault-details"
  | "edit-vault-item"
  | "recently-deleted";


  function UnlockedSessionBoundary({children}: {children: React.ReactNode}) {

    const { resetInactivityTimer } = useAppLock();

    return (
      <View style={{flex:1}} onTouchStart={resetInactivityTimer}>
        {children}
      </View>
    )
  }

function ScreenFrame({   children,
  backgroundColor,
}: {
  children: React.ReactNode;
  backgroundColor: string;
}) {
  return <View style={[styles.screenFrame, {backgroundColor} ]}>{children}</View>;
}

const styles = StyleSheet.create({
  screenFrame: {
    flex:1,
    paddingVertical: 24,
    paddingHorizontal: 15,
    marginBottom:10,
  },
});


export default function Index() {
  const theme = useAppTheme();
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
  "reset-vault-warning": "Reset Vault",
  "generated-result": "Generated Password",
  "save-profile": "Save Profile",
  "vault-list": "Vault",
  "vault-details": "Vault Details",
  "edit-vault-item": "Edit Vault Item",
  "recently-deleted": "Recently Deleted",
};
const unlockNavigation = {
  navigate: (screenName: string) => {
    if (screenName === "ResetVaultWarning") {
      setScreen("reset-vault-warning");
      return;
    }

    Alert.alert("Navigation not implemented", screenName);
  },
};
  const dispatch = useDispatch();
  const isUnlocked = useSelector((state: RootState)=>state.session.isUnlocked);

  useEffect(()=>{
    if (!isDatabaseReady) {
      return;
    }
    if (  !isUnlocked &&  screen !== "create" &&  screen !== "unlock" &&  screen !== "reset-vault-warning") {
      setGeneratedResultParams(null);
      setSaveProfileParams(null);
      setVaultItemId(null);
      setScreen("unlock");
    }
  },[isUnlocked, isDatabaseReady, screen])
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

const canShowManualLock = screen !== "create" && screen !== "unlock";

const headerOptions = {
  headerStyle: {
  backgroundColor: theme.colors.surface,
},
headerTintColor: theme.colors.text,
headerTitleStyle: {
  color: theme.colors.text,
  fontWeight: "700" as const,
},
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
            <Text style={{ fontSize: 16 ,color: theme.colors.text }}>Back</Text>
          </Pressable>
        ),
      }
    : {}),
    ...(canShowManualLock
      ?{
        headerRight: ()=> <ManualLockButton/>
      } : {}),
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

    dispatch(setUnlocked({unlockedAt: new Date().toISOString()}));
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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.colors.background,
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
      <ScreenFrame backgroundColor={theme.colors.background}>
        <UnlockVaultScreen
          onUnlock={handleUnlock}
          navigation={unlockNavigation}
        />
      </ScreenFrame>
    </>
    );
  }

  if (screen === "reset-vault-warning") {
  const resetVaultNavigation = {
    navigate: (screenName: string) => {
      if (screenName === "create") {
        setScreen("create");
        return;
      }

      Alert.alert("Navigation not implemented", screenName);
    },
    goBack: () => {
      setScreen("unlock");
    },
  };

  return (
    <>
      {header}
      <ScreenFrame backgroundColor={theme.colors.background}>
        <ResetVaultWarningScreen navigation={resetVaultNavigation} />
      </ScreenFrame>
    </>
  );
}

  if (screen === "quick-generator") {
    return <UnlockedSessionBoundary>
     {header}
      <ScreenFrame backgroundColor={theme.colors.background}>
         <QuickGeneratorScreen navigation={quickGeneratorNavigation} />
      </ScreenFrame>
    </UnlockedSessionBoundary>;
  }

  if (screen === "generated-result" && generatedResultParams) {
    return (<UnlockedSessionBoundary>
    {header}
     <ScreenFrame backgroundColor={theme.colors.background}>
      <GeneratedPasswordResultScreen
        route={{ params: generatedResultParams }}
        navigation={generatedResultNavigation}
      />
      </ScreenFrame>
      </UnlockedSessionBoundary>
    );
  }

  if (screen === "vault-list") {
    return <UnlockedSessionBoundary>{header}<VaultListScreen navigation={vaultListNavigation} /></UnlockedSessionBoundary>;
  }
  if (screen === "save-profile" && saveProfileParams) {
  return (<UnlockedSessionBoundary>
  {header}
   <ScreenFrame backgroundColor={theme.colors.background}>
    <SaveGeneratedProfileScreen
      route={{ params: saveProfileParams }}
      navigation={saveProfileNavigation}
    />
    </ScreenFrame>
    </UnlockedSessionBoundary>
  );
}

if (screen === "vault-details" && vaultItemId) {
  return (<UnlockedSessionBoundary>
  {header}
   <ScreenFrame backgroundColor={theme.colors.background}>
    <VaultItemDetailsScreen
      route={{ params: { itemId: vaultItemId } }}
      navigation={vaultDetailsNavigation}
    />
    </ScreenFrame>
    </UnlockedSessionBoundary>
  );
}

if (screen === "edit-vault-item" && vaultItemId) {
  return (
  <UnlockedSessionBoundary>
  {header}
   <ScreenFrame backgroundColor={theme.colors.background}>
    <EditVaultItemScreen
      route={{ params: { itemId: vaultItemId } }}
      navigation={editVaultItemNavigation}
    />
    </ScreenFrame>
  </UnlockedSessionBoundary>
  );
}

if (screen === "recently-deleted") {
  const recentlyDeletedNavigation = {
  goBack: () => {
    setScreen("vault-list");
  },
};
  return <UnlockedSessionBoundary>{header}<RecentlyDeletedScreen navigation={recentlyDeletedNavigation} /></UnlockedSessionBoundary>;
}
  return (
  <>
    {header}
     <ScreenFrame backgroundColor={theme.colors.background}>
    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: "#ffcb87" }}>
      <CreateMasterPasswordScreen onCreateVault={handleCreateVault} />
    </ScrollView>
    </ScreenFrame>
  </>
  );

}