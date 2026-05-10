import { useState } from "react";
import {
    Alert,Button,StyleSheet,
    Text,TextInput,View,
} from "react-native"
type Prors = {
    onCreateVault: (masterPassword: string)=> Promise<void>;
};
export function CreateMAsterPasswordScreen({onCreateVault}: Prors){
    const [master]
}