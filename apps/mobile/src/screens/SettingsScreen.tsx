import { Alert,
    ScrollView,
    StyleSheet,
    Text,
 } from "react-native";
 import { useDispatch, useSelector } from "react-redux";
 import {
  setLanguage,
  setLockTimeoutSeconds,
  setThemeMode,
  type AppLanguage,
  type LockTimeoutSeconds,
  type ThemeMode,
} from "../store/settingsSlice";
import { setLocked } from "../store/sessionSlice";
import { services } from "../services/serviceContainer";
import { SettingsSection } from "../components/settings/SettingsSection";
import { SettingsRow } from "../components/settings/SettingsRow";

type RootState = {
    settings:{
    lockTimeoutSeconds: LockTimeoutSeconds;
    themeMode: ThemeMode;
    language: AppLanguage;
    };
};
type Props = {
    navigation: {
        navigate: (screen: string) => void;
    };
};

const lockTimeoutOptions: LockTimeoutSeconds[] = [
    30,
    60,
    120,
    300,
    600,
    900,
];

const themeOptions: ThemeMode[]= ["system","light","dark"];

const languageOptions: AppLanguage[]= ["system","en","ar"];

export function SettingsScreen({navigation}: Props){
    const dispatch = useDispatch();

    const settings = useSelector((state: RootState)=> state.settings);

    function handleManualLock(){
        const result = services.appLockService.lock("manual");

        if(!result.ok){
            Alert.alert("Lock failed", result.error.code);
            return;
        }

        dispatch(
            setLocked({
                lockedAt: result.value.lockedAt,
                reason: result.value.reason,
            })
        );
    }
    function cycleLockTimeout() {
        const currentIndex = lockTimeoutOptions.indexOf(
            settings.lockTimeoutSeconds
        );
        const next = 
        lockTimeoutOptions[
            (currentIndex+1)% lockTimeoutOptions.length
        ] ?? 60;
    
        dispatch(setLockTimeoutSeconds(next));
    }

    function cycleThemeMode(){
        const currentIndex = themeOptions.indexOf(settings.themeMode);

        const next = themeOptions[(currentIndex + 1)% themeOptions.length] ?? "system";
        dispatch(setThemeMode(next));
    }

    function cycleLanguage(){
        const currentIndex = languageOptions.indexOf(settings.language);

        const next = languageOptions[(currentIndex + 1)% languageOptions.length] ?? "system";
        dispatch(setLanguage(next));
    }
   return(
    <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <SettingsSection title="Appearance">
            <SettingsRow
            title="Theme"
            description="Use system, light, or dark mode."
            value={settings.themeMode}
            onPress={cycleThemeMode}
            />

            <SettingsRow
            title="Language"
            description="Use system language, English, or Arabic."
            value={settings.language}
            onPress={cycleLanguage}
            />
        </SettingsSection> 

        <SettingsSection title="Security">
            <SettingsRow 
            title="Auto-lock timeout"
            description="Lock the vault after inactivity."
            value={`${settings.lockTimeoutSeconds}s`}
            onPress={cycleLockTimeout}
            />
            <SettingsRow
            title="Lock vault now"
            description="Immediately clear the unlocked vault session."
            onPress={handleManualLock}
            />

            <SettingsRow
            title="Recently Deleted"
            description="Restore or permanently delete soft-deleted items."
            onPress={() => navigation.navigate("RecentlyDeleted")}
            />
        </SettingsSection>

        <SettingsSection title="Information">
            <SettingsRow
            title="Security information"
            description="Read how the vault protects your data."
            onPress={() => navigation.navigate("SecurityInfo")}
            />
        </SettingsSection>

        <SettingsSection title="Danger Zone">
            <SettingsRow
            title="Reset vault"
            description="Delete the local encrypted vault. This cannot be undone."
            danger
            onPress={() => navigation.navigate("ResetVaultWarning")}
            />
      </SettingsSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
});
