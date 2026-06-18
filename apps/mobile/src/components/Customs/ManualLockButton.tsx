import { Button } from "react-native";
import { useDispatch } from "react-redux";
import { services } from "../../services/serviceContainer";
import { setLocked } from "../../store/sessionSlice";

export function ManualLockButton() {
  const dispatch = useDispatch();
  function handleLock(){
    const result = services.appLockService.lock("manual");

    if(!result.ok){
      return;
    }
    dispatch(
      setLocked({
        lockedAt: result.value.lockedAt,
        reason: result.value.reason
      })
    )
  }
  return <Button title="Lock Vault" onPress={handleLock} />;
}