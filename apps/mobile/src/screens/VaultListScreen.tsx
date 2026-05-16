import { useMemo, useState } from "react";
import {
  Button,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useVaultItems } from "../hooks/useVaultItems";
import type { DecryptedVaultItemV1 } from "../services/VaultItemService";
import Style from "./style";

type Props = {
  navigation: {
    navigate: (screen: string, params?: unknown) => void;
  };
};

export function VaultListScreen({ navigation }: Props) {
  const { items, isLoading, errorCode, reload } = useVaultItems();
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) => {
      const site = item.payload.site;
      const target =
        site.kind === "domain" ? site.normalizedDomain : site.generationLabel;

      return (
        site.displayName.toLowerCase().includes(query) ||
        target.toLowerCase().includes(query) ||
        item.payload.usernameOrEmail.toLowerCase().includes(query)
      );
    });
  }, [items, search]);

  function handleOpenItem(item: DecryptedVaultItemV1) {
    navigation.navigate("VaultItemDetails", {
      itemId: item.id,
    });
  }

  function handleAddItem() {
    navigation.navigate("QuickGenerator");
  }

  return (
    <View style={Style.VaultListScreenContainer}>
      <Text style={Style.VaultListScreenTitle}>Vault</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search after unlock"
        autoCapitalize="none"
        style={Style.VaultListScreenSearchInput}
      />

      <Button title="Add Item" onPress={handleAddItem} />
      <Button
        title="Recently Deleted"
        onPress={() => navigation.navigate("RecentlyDeleted")}
      />

      {errorCode && (
        <Text style={Style.VaultListScreenError}>Error: {errorCode}</Text>
      )}

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={reload} />
        }
        ListEmptyComponent={
          <Text style={Style.VaultListScreenEmpty}>
            {isLoading ? "Loading..." : "No vault items yet."}
          </Text>
        }
        renderItem={({ item }) => (
          <VaultListRow item={item} onPress={() => handleOpenItem(item)} />
        )}
      />
    </View>
  );
}

type VaultListRowProps = {
  item: DecryptedVaultItemV1;
  onPress: () => void;
};

function VaultListRow({ item, onPress }: VaultListRowProps) {
  const site = item.payload.site;
  const target =
    site.kind === "domain" ? site.normalizedDomain : site.generationLabel;

  return (
    <TouchableOpacity style={Style.VaultListScreenRow} onPress={onPress}>
      <Text style={Style.VaultListScreenRowTitle}>{site.displayName}</Text>
      <Text style={Style.VaultListScreenRowSubtitle}>{target}</Text>
      <Text style={Style.VaultListScreenRowSubtitle}>
        {item.payload.usernameOrEmail}
      </Text>
    </TouchableOpacity>
  );
}
