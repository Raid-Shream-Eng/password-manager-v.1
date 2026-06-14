import { useColorScheme } from "react-native";

export const palette = {
      purple: "#766DA7",
      dark: "#15191E",
      green: "#7A9663",
      deepGreen: "#556842",
      sage: "#A0AE91",
};

export const lightTheme = {
  colors: {
    background: "#F7F8F5",
    surface: "#FFFFFF",
    surfaceSoft: "#EEF2EA",
    text: "#15191E",
    mutedText: "#556842",
    primary: palette.purple,
    primaryText: "#FFFFFF",
    accent: palette.green,
    accentDark: palette.deepGreen,
    border: "#D8DED1",
    danger: "#B3261E",
  },
};

export const darkTheme = {
  colors: {
    background: palette.dark,
    surface: "#20252B",
    surfaceSoft: "#2A3036",
    text: "#F7F8F5",
    mutedText: palette.sage,
    primary: palette.purple,
    primaryText: "#FFFFFF",
    accent: palette.sage,
    accentDark: palette.green,
    border: "#3B4438",
    danger: "#FFB4AB",
  },
};

export function useAppTheme() {
  const scheme = useColorScheme();
  return scheme === "dark" ? darkTheme : lightTheme;
}