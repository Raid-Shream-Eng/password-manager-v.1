import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { DecryptedVaultItemV1 } from "../services/VaultItemService";
import { services } from "../services/serviceContainer";
import Style from "./style";

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export function RecentlyDeletedScreen({ navigation }: Props) {
  const [items, setItems] = useState<DecryptedVaultItemV1[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);

    try {
      const result = await services.vaultItemService.listDeletedItems();

      if (!result.ok) {
        setErrorCode(result.error.code);
        return;
      }

      setItems(result.value);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  /**
   * Deleted records stay encrypted; restore only clears the record tombstone.
   */
  async function handleRestore(item: DecryptedVaultItemV1) {
    const result = await services.vaultItemService.restoreItem(item.id);

    if (!result.ok) {
      Alert.alert("Restore failed", result.error.code);
      return;
    }

    await loadItems();
  }

  function handlePermanentDelete(item: DecryptedVaultItemV1) {
    Alert.alert(
      "Permanently delete item?",
      "This cannot be undone. The encrypted vault record will be removed.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            const result =
              await services.vaultItemService.permanentlyDeleteItem(item.id);

            if (!result.ok) {
              Alert.alert("Permanent delete failed", result.error.code);
              return;
            }

            await loadItems();
          },
        },
      ],
    );
  }

  return (
    <View style={Style.VaultListScreenContainer}>
      <Text style={Style.VaultListScreenTitle}>Recently Deleted</Text>

      <Text style={Style.GeneratedPasswordResultWarning}>
        Deleted items stay here until you restore them or permanently delete
        them.
      </Text>

      <Button title="Back to Vault" onPress={navigation.goBack} />

      {errorCode && (
        <Text style={Style.VaultListScreenError}>Error: {errorCode}</Text>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadItems} />
        }
        ListEmptyComponent={
          <Text style={Style.VaultListScreenEmpty}>
            {isLoading ? "Loading..." : "No deleted vault items."}
          </Text>
        }
        renderItem={({ item }) => (
          <RecentlyDeletedRow
            item={item}
            onRestore={() => handleRestore(item)}
            onPermanentDelete={() => handlePermanentDelete(item)}
          />
        )}
      />
    </View>
  );
}

type RecentlyDeletedRowProps = {
  item: DecryptedVaultItemV1;
  onRestore: () => void;
  onPermanentDelete: () => void;
};

function RecentlyDeletedRow({
  item,
  onRestore,
  onPermanentDelete,
}: RecentlyDeletedRowProps) {
  const site = item.payload.site;
  const target =
    site.kind === "domain" ? site.normalizedDomain : site.generationLabel;

  return (
    <TouchableOpacity style={Style.VaultListScreenRow} activeOpacity={1}>
      <Text style={Style.VaultListScreenRowTitle}>{site.displayName}</Text>
      <Text style={Style.VaultListScreenRowSubtitle}>{target}</Text>
      <Text style={Style.VaultListScreenRowSubtitle}>
        {item.payload.usernameOrEmail}
      </Text>
      <View style={Style.RecentlyDeletedActions}>
        <Button title="Restore" onPress={onRestore} />
        <Button title="Delete Forever" color="#aa0000" onPress={onPermanentDelete} />
      </View>
    </TouchableOpacity>
  );
}
