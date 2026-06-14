import { Pressable, View, Text } from "react-native";
import { useAppTheme } from "../../theme/theme";
import style from "./style";


type ButtonProps = {
  title : string;
  onPress: () => void | Promise<void>;
  color?: string;
  backgroundColor?: string;
  disabled?: boolean | undefined;
  fontWeight?: "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "black" | "thin" | "ultralight" | "condensed" | "bold" | "heavy" | "medium" | "light" | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 ; 
};
export const CustomButton = (Props:ButtonProps) => {
  const theme = useAppTheme();
  return (
  <Pressable disabled={Props.disabled} onPress={Props.onPress}  style={{padding:1, margin:1,alignItems:'center',justifyContent:'center'}}>
    <View
  style={[
    style.ButtonContainer,
    {
      backgroundColor:
        Props.backgroundColor ??
        (Props.disabled ? theme.colors.surfaceSoft : theme.colors.primary),
      borderColor: theme.colors.border,
      opacity: Props.disabled ? 0.6 : 1,
    },
  ]}
>
  <Text
    style={[
      style.ButtonText,
      {
        color: Props.color ?? theme.colors.primaryText,
        fontWeight: Props.fontWeight ?? "700",
      },
    ]}
  >
    {Props.title}
  </Text>
</View>
  </Pressable>
  )
};
