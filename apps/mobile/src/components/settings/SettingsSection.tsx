import { StyleSheet, Text, View } from "react-native";

type Props = {
    title: string;
    children: React.ReactNode;
};

export function SettingsSection({title,children}: Props){
    return(
        <View style={styles.section}>
            <Text style={styles.title}>
                {title}
            </Text>
            <View style={styles.card}>
                {children}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    section:{
        gap:8,
    },
    title: {
        fontSize:14,
        fontWeight: "700",
        color:"#666",
        textTransform:"uppercase",
    },
    card:{
        borderWidth:1,
        borderRadius:12,
        borderColor:"#ddd",
        overflow:"hidden",
    },
});