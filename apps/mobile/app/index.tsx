import { Alert, View } from "react-native";
import { CreateMasterPasswordScreen } from "../src/screens/CreateMasterPasswordScreen";
import { services } from "../src/services/serviceContainer";

export default function Index() {
  async function handelCreatingVault(masterPasword:string) {
    const result = await services.vaultCreationService.createVault(
      masterPasword,
    );
    if (!result.ok) {
      Alert.alert("Could not create vault", result.error.message);
      return;
    }

    Alert.alert("Vault created", "Your local vault was created successfully.")
  }
  return (
    <View style={{backgroundColor:"#ffcb87"}}>
      <CreateMasterPasswordScreen onCreateVault={handelCreatingVault} />
    </View>
  );
}
