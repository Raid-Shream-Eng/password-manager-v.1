import { StyleSheet } from "react-native";
import { palette } from "../theme/theme";

export default StyleSheet.create({
    input:{
        borderWidth: 1,
        borderColor: palette.deepGreen,
        borderRadius: 8,
        marginVertical: 12,
        color : palette.green,
        padding:10,
        fontSize:20,
        fontWeight:"600"
    },
    container: {
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
        color: palette.purple,
        fontStyle: "italic",
        fontWeight:"200"
    },
    linkTextPressed:{
        color: palette.green,
        fontStyle: "italic",
        fontWeight:"200"
    },

    TestContainer: {
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
        borderColor: palette.sage,
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
        color: "#B3261E",
    },
    QuuickGeneratorPreview: {
        fontSize: 13,
        color: palette.deepGreen,
    },
    GeneratedPasswordResultContainer: {
    
    padding: 24,
    gap: 16,
  },
  GeneratedPasswordResultTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
  },
  GeneratedPasswordResultCard: {
    borderWidth: 1,
    borderColor: palette.sage,
    borderRadius: 8,
    padding: 16,
    gap: 6,
  },
  GeneratedPasswordResultLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.deepGreen,
  },
  GeneratedPasswordResultValue: {
    color:palette.sage,
    fontSize: 16,
    marginBottom: 8,
  },
  GeneratedPasswordResultPasswordBox: {
    borderWidth: 1,
    borderColor: palette.sage,
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
    color: palette.deepGreen,
  },
  GeneratedPasswordResultActions: {
    gap: 10,
  },
  GeneratedPasswordResultWarning: {
    marginTop: 16,
    fontSize: 13,
    color: palette.deepGreen,
  },
  VaultListScreenContainer: {
    padding: 24,
    gap: 12,
  },
  VaultListScreenTitle: {
    fontSize: 26,
    fontWeight: "700",
  },
  VaultListScreenSearchInput: {
    borderWidth: 1,
    borderColor: palette.sage,
    borderRadius: 8,
    padding: 12,
  },
  VaultListScreenRow: {
    borderBottomWidth: 1,
    borderBottomColor: palette.sage,
    paddingVertical: 14,
  },
  VaultListScreenRowTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  VaultListScreenRowSubtitle: {
    fontSize: 13,
    color: palette.deepGreen,
    marginTop: 3,
  },
  VaultListScreenEmpty: {
    marginTop: 24,
    color: palette.deepGreen,
  },
  VaultListScreenError: {
    color: "#B3261E",
  },
})