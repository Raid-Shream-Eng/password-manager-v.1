import { StyleSheet } from "react-native";

export default StyleSheet.create({
    input:{
        borderWidth: 1,
        borderColor: "#383838",
        borderRadius: 8,
        marginVertical: 12,
        color : "#666",
        padding:10,
        fontSize:20,
        fontWeight:"600"
    },
    container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 16,
    },
    warning: {
        fontSize: 14,
        marginBottom: 24,
    },
    linkText:{
        color:"#00b7ff",
        fontStyle: "italic",
        fontWeight:"200"
    },
    linkTextPressed:{
        color:"#5ec5ec",
        fontStyle: "italic",
        fontWeight:"200"
    },

})