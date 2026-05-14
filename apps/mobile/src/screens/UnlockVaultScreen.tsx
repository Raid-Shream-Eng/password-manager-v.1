import { useState } from "react";
import { Alert,Pressable,Text,TextInput,View } from "react-native";
import style from "./style";
import { CustomButton } from "../components/Customs/customButton";

type Props = {
    onUnlock: (masterPassword:string)=>Promise<void>
    onResetVault: ()=> void
};

export function UnlockVaultScreen({ onUnlock , onResetVault }:Props){
    const [masterPassword,setMasterPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isForgotPressed, setIsForgotPressed] = useState(false);
    const [forgotText, setForgotText] = useState("Forgot master password?");
     
    async function  handleUnlock() {
        if (!masterPassword){
            Alert.alert("entet yoiur Master Password");
            return;
        }       

        setIsSubmitting(true);

        try{
            await onUnlock(masterPassword)
        }finally{
            setMasterPassword('');
            setIsSubmitting(false);
        }
    }
    function handleForgotPressIn() {setIsForgotPressed(true);}

    function handleForgotPressOut() {setIsForgotPressed(false);}
    
    function handleForgotPress() {
        setForgotText("Forgot master password pressed");
    }

    return(
    <View>
        <Text> Unlock Vault </Text>
        <TextInput
        value={masterPassword}
        onChangeText={setMasterPassword}
        secureTextEntry
        placeholder="Master Password"
        style={style.input}
        />
        <CustomButton
        onPress={handleUnlock}
        title={isSubmitting ? "Unlocking..." : "Unlock"}
        disabled={isSubmitting}
        />
        
        <Pressable onPressIn={handleForgotPressIn} onPressOut={handleForgotPressOut} onPress={onResetVault}>    
            <Text style={isForgotPressed ? style.linkTextPressed : style.linkText}> { forgotText } </Text>
        </Pressable>
    </View>
    );

}