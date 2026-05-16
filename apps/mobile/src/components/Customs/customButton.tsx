import { Pressable, View, Text } from "react-native";
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
  return (
  <Pressable disabled={Props.disabled} onPress={Props.onPress}  style={{padding:10, margin:10,alignItems:'center',justifyContent:'center'}}>
    <View style={[style.ButtonContainer,{backgroundColor: Props.backgroundColor}]}>
        <Text style={{fontWeight: Props.fontWeight,color:Props.color}}>
            {Props.title}
        </Text>
    </View>
  </Pressable>
  )
};
