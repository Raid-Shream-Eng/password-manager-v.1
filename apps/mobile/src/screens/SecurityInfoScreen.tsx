import { ScrollView, StyleSheet, Text } from "react-native";

export function SecurityInfoScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Security Information</Text>

      <Text style={styles.sectionTitle}>Offline-first vault</Text>
      <Text style={styles.body}>
        Your vault is created locally on this device. The MVP does not require
        an account or backend sync.
      </Text>

      <Text style={styles.sectionTitle}>Master password</Text>
      <Text style={styles.body}>
        Your master password unlocks your vault. It is not stored and cannot be
        recovered in the MVP.
      </Text>

      <Text style={styles.sectionTitle}>Generated passwords</Text>
      <Text style={styles.body}>
        Generated passwords are deterministic and regenerated when needed. They
        are not stored in the vault.
      </Text>

      <Text style={styles.sectionTitle}>Encrypted metadata</Text>
      <Text style={styles.body}>
        Saved site profiles, usernames, password rules, and notes are stored as
        encrypted vault metadata.
      </Text>

      <Text style={styles.sectionTitle}>Vault reset</Text>
      <Text style={styles.body}>
        If you forget your master password, the only MVP option is vault reset.
        Resetting deletes access to your existing encrypted vault data.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
  },
});