import { useState, useEffect } from "react";
import { Alert, View, Text, ActivityIndicator } from "react-native";
import { CreateMasterPasswordScreen } from "../src/screens/CreateMasterPasswordScreen";
import { DevVaultItemTestScreen } from "../src/screens/DevVaultItemTestScreen";
import { UnlockVaultScreen } from "../src/screens/UnlockVaultScreen";
import { services } from "../src/services/serviceContainer";
import { initializeDatabase } from "../src/repositories/database";
import { ResetVaultWarningScreen } from "../src/screens/ResetVaultWarningScreen";

type ScreenState = "create" | "unlock" | "dev-test"| "reset-vault-warning" ;

export default function Index() {
  const [screen, setScreen] = useState<ScreenState>("create");
  const [isDatabaseReady,setIsDatabaseReady] = useState(false);
  const unlockNavigation = {
  navigate: (screenName: string) => {
    if (screenName === "ResetVaultWarning") {
      setScreen("reset-vault-warning");
      return;
    }

    Alert.alert("Navigation not implemented", screenName);
  },
};
  useEffect(()=> {
    async function prepareDatabase() {
      try {
        await initializeDatabase();

        const hasVaultResult = await services.vaultSessionService.hasVault();

        if (!hasVaultResult
          .ok){
          Alert.alert("Database error", hasVaultResult.error.message);
          return;
        }
        setScreen(hasVaultResult.value ? "unlock" : "create");
        setIsDatabaseReady(true);
      } catch (cause) { 
        console.error(cause);
        Alert.alert("Database error","Failed to initialize local database.");
      }
    }
    prepareDatabase();
  }, [])

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

    Alert.alert("Vault unlocked", "You can now test encrypted vault items.");
    setScreen("dev-test");
  }

  function handleResetVault() {
    Alert.alert(
      "Reset is not implemented",
      "This button is only here for the temporary test flow.",
    );
  }
  
  if (screen === "reset-vault-warning") {
  return (
    <ResetVaultWarningScreen
      navigation={{
        navigate: () => setScreen("create"),
        goBack: () => setScreen("unlock"),
      }}
    />
  );
  }

  if (!isDatabaseReady) {
    return (
      <View
      style={{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#ffcb87'
      }}>
        <ActivityIndicator />
        <Text>Preparing local databace...</Text>
      </View>
    )
  }
  if (screen === "unlock") {
    return (
      <UnlockVaultScreen
        onUnlock={handleUnlock}
        navigation={unlockNavigation}
      />
    );
  }

  if (screen === "dev-test") {
    return <DevVaultItemTestScreen />;
  }

  return (
    <View style={{ backgroundColor: "#ffcb87" }}>
      <CreateMasterPasswordScreen onCreateVault={handleCreateVault} />
    </View>
  );
  
}