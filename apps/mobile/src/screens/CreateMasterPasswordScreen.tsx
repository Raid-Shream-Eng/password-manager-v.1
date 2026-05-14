import { useState } from "react";
import {Alert,Text,TextInput,View,} from "react-native";
import MasterButton from "../components/Customs/customButton";
import style from "./style";
type Props = {
    onCreateVault: (masterPassword: string)=> Promise<void>;
};
export function CreateMasterPasswordScreen({onCreateVault}: Props){
    const [masterPassword, setMasterPassword ] = useState("");
    const [confirmPassword, setConfirmPassword ] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleCreateVault(){

        if (masterPassword.length < 12) {
            Alert.alert(
           " Weak master Password",
           "Use at least 12 characters. A long passphrase is recommended."
            );
            return
        }

        if (masterPassword !== confirmPassword){
            Alert.alert("Passwords do not match");
            return;
        }

        setIsSubmitting(true);

        try {
            await onCreateVault(masterPassword);

        } finally {
            setMasterPassword("");
            setConfirmPassword("");
            setIsSubmitting(false);
        }
    }



        return(
            <View style={style.container}>

            <Text style={style.title}>Create Master Password</Text>

            <Text style={style.warning}>  We cannot recover your master password if you forget it. </Text>

            <TextInput
            value={masterPassword}
            onChangeText={setMasterPassword}
            secureTextEntry
            placeholder="Master Password"
            style={style.input}
            />

            <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm Password"
            style={style.input}
            />

            <MasterButton 
            onPress={handleCreateVault}
            title={ isSubmitting ? "Creating..." :  "Create Vault" }
            color={ isSubmitting ? "#81712a" : "#fffedb"}
            backgroundColor={ isSubmitting ? "#21815e" : "#235241"}
            />

            </View>
        );
    
}