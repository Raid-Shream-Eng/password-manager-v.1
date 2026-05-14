import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { CustomButton } from "../components/Customs/customButton"
import Style from "./style";
import { defaultPasswordProfileV1 } from "@password-manager/shared-types";
import { services } from "../services/serviceContainer";

export function DevVaultItemTestScreen(){
    const [lastItemId , setLastItemId] = useState<string| null>(null);

    async function handleCreateTestItem() {
        const result = await services.vaultItemService.createItem({
            site: {
                kind: "domain",
                displayName: "Example",
                normalizedDomain: "example.com",
            },
            usernameOrEmail: "raid@example.com",
            passwordProfile: defaultPasswordProfileV1,
            notes: "Encrypted test note",
        });
        if (!result.ok){
            Alert.alert("Error", result.error.code);
            return;
        }

        setLastItemId(result.value.id);
        {
        Alert.alert("No item created yet");
        return;    
        }
    }
    async function handleReadTestItem() {
        if (!lastItemId){
            Alert.alert("No item created yet");
            return;
        }

        const result = await services.vaultItemService.getItemById(lastItemId);

        if (!result.ok) {
            Alert.alert("Error", result.error.code);
            return;
        }

        if (result.value) {
            Alert.alert("Not Found");
            return;
        }
        Alert.alert("Decrypted Item",
            `${result.value.payload.site.displayName}\n${result.value.payload.usernameOrEmail}`,
        );
    }

    async function handleListTestItem() {
        const result = await services.vaultItemService.listActiveItems();

        if (!result.ok) {
            Alert.alert("Error", result.error.code)
            return;
        }

        Alert.alert("Active Items", String(result.value.length));
    }

    return(
        <View style={Style.TestContainer}>
            <Text style={Style.TestTitle}>Dev Vault Item Test</Text>

            <CustomButton title="Create Test Item" onPress={handleCreateTestItem}/>
            <CustomButton title="Read Last Item" onPress={handleReadTestItem}/>
            <CustomButton title="ListTestItem" onPress={handleListTestItem}/>

        </View>
    )
}  