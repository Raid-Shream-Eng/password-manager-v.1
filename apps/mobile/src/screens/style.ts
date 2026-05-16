import { StyleSheet } from "react-native";
import { GeneratorService } from "../services/GeneratorService";

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

    TestContainer: {
        flex: 1,
        padding: 24,
        gap: 12,
        justifyContent: "center",
    },
    TestTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 16,
    },
    QuuickGeneratorContainer: {
        padding: 24,
        gap: 10,
    },
    QuuickGeneratorLitle: {
        fontSize: 26,
        fontWeight: "700",
        marginBottom: 12,
    },
    QuuickGeneratorSectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        marginTop: 20,
        marginBottom: 8,
    },
    QuuickGeneratorLabel: {
        fontSize: 14,
        fontWeight: "600",
        marginTop: 8,
    },
    QuuickGeneratorInput: {
        borderWidth: 1,
        borderColor: "#999",
        borderRadius: 8,
        padding: 12,
    },
    QuuickGeneratorRow: {
        flexDirection: "row",
        gap: 12,
    },
    QuuickGeneratorSwitchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    QuuickGeneratorError: {
        color: "#b00020",
    },
    QuuickGeneratorPreview: {
        fontSize: 13,
        color: "#555",
    },
    GeneratedPasswordResultContainer: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  GeneratedPasswordResultTitle: {
    fontSize: 26,
    fontWeight: "700",
  },
  GeneratedPasswordResultCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    gap: 6,
  },
  GeneratedPasswordResultLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  GeneratedPasswordResultValue: {
    fontSize: 16,
    marginBottom: 8,
  },
  GeneratedPasswordResultPasswordBox: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  GeneratedPasswordResultPasswordText: {
    fontSize: 20,
    fontWeight: "700",
  },
  GeneratedPasswordResultCopiedText: {
    fontSize: 14,
    color: "#555",
  },
  GeneratedPasswordResultActions: {
    gap: 10,
  },
  GeneratedPasswordResultWarning: {
    marginTop: 16,
    fontSize: 13,
    color: "#555",
  },
})