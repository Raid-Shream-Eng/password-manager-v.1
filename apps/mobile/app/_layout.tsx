import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "../src/store";

export default function RootLayout() {
  return (
    <Provider store={store} >
      <SafeAreaProvider>
          <StatusBar barStyle="default" />
          <Stack />
      </SafeAreaProvider>
    </Provider>
  );
}