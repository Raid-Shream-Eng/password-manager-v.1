import { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { useDispatch } from "react-redux";
import {
  services,
} from "../services/serviceContainer";
import {
  VAULT_RESET_CONFIRMATION_PHRASE,
} from "../services/VaultResetService";
import { setLocked } from "../store/sessionSlice";

type Props = {
  navigation: {
    navigate: (screen: string) => void;
    goBack: () => void;
  };
};

export function ResetVaultWarningScreen({ navigation }: Props) {
    const dispatch = useDispatch();

    const [confirmationPhrase, setConfirmationPhrase] = useState("");
    const [isResetting, setIsResetting] = useState(false);

    const canReset =
        confirmationPhrase === VAULT_RESET_CONFIRMATION_PHRASE;

    async function handleReset() {
        if (!canReset) {
        Alert.alert(
            "Confirmation required",
            `Type ${VAULT_RESET_CONFIRMATION_PHRASE} to continue.`
        );
        return;
        }

        setIsResetting(true);
        
    try {
      const result = await services.vaultResetService.resetVault({
        confirmationPhrase,
      });

      if (!result.ok) {
        Alert.alert("Reset failed", result.error.code);
        return;
      }

      dispatch(
        setLocked({
          lockedAt: new Date().toISOString(),
          reason: "reset",
        })
      );

      setConfirmationPhrase("");

      Alert.alert(
        "Vault reset complete",
        "Your local vault has been deleted.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("create"),
          },
        ]
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reset Vault</Text>

      <Text style={styles.danger}>
        We cannot recover your master password.
      </Text>

      <Text style={styles.body}>
        Resetting your vault will permanently remove access to all saved site
        profiles, encrypted notes, password history, and local history.
      </Text>

      <Text style={styles.body}>
        This cannot be undone.
      </Text>

      <Text style={styles.body}>
        To continue, type:
      </Text>

      <Text style={styles.phrase}>
        {VAULT_RESET_CONFIRMATION_PHRASE}
      </Text>

      <TextInput
        value={confirmationPhrase}
        onChangeText={setConfirmationPhrase}
        autoCapitalize="characters"
        placeholder={VAULT_RESET_CONFIRMATION_PHRASE}
        style={styles.input}
      />

      <Button
        title={isResetting ? "Resetting..." : "Delete My Vault"}
        color="#aa0000"
        disabled={!canReset || isResetting}
        onPress={handleReset}
      />

      <Button
        title="Cancel"
        disabled={isResetting}
        onPress={() => navigation.goBack()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  danger: {
    color: "#",
    fontSize: 17,
    fontWeight: "700",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  phrase: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aa0000",
    borderRadius: 8,
    padding: 12,
  },
});