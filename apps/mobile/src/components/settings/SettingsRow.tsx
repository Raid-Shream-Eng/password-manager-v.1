import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  title: string;
  description?: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void;
};

export function SettingsRow({
    title,
    description,
    value,
    danger = false,
    onPress,
}:Props){
    return(
        <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed })=> [
            styles.row,
            pressed && styles.pressed
        ]}
        >
            <View style={styles.content}>
                <Text style={[styles.title, danger && styles.danger]}>
                    {title}
                </Text>
                {description && (
                    <Text style={styles.description}>
                        {description}
                    </Text>
                )}
                
            </View>
            {value && (
                <Text style={styles.value}>{value}</Text>
            )}
                
        </Pressable>
    )
}


const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  pressed: {
    opacity: 0.75,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  danger: {
    color: "#aa0000",
  },
  description: {
    fontSize: 13,
    color: "#666",
  },
  value: {
    fontSize: 14,
    color: "#555",
  },
});