import { useState } from "react";
import { Alert,Button,Pressable,Text,TextInput,View } from "react-native";
import style from "./style";
import { CustomButton } from "../components/Customs/customButton";
import { setUnlocked } from "../store/sessionSlice";

type Props = {
    onUnlock: (masterPassword:string)=>Promise<void>
    navigation: {
        navigate: (screen: string) => void;
    }
};

export function UnlockVaultScreen({ onUnlock , navigation }:Props){
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
        
        <Pressable onPressIn={handleForgotPressIn} onPressOut={handleForgotPressOut} onPress={() => {
    navigation.navigate("ResetVaultWarning");
  }}>    
            <Text style={isForgotPressed ? style.linkTextPressed : style.linkText}> { forgotText } </Text>
        </Pressable> 
        <Button
        title="Forgot master password?"
        color="#aa0000"
        onPress={() => {
    navigation.navigate("ResetVaultWarning");
  }}
        disabled={isSubmitting}
        />
    </View>
    );

}