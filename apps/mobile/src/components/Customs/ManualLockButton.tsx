import { Button } from "react-native";
import { useAppLock } from "../../hooks/useAppLock";

export function ManualLockButton() {
  const { lock } = useAppLock();

  return <Button title="Lock Vault" onPress={() => lock("manual")} />;
}