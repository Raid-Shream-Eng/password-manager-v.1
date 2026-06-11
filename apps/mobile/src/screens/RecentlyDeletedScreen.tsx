import { 
    Alert,
    Button,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
}  from 'react-native';
import type { DecryptedVaultItemV1 } from '../services/VaultItemService'; 
import { services } from '../services/serviceContainer';
import { useDeletedVaultItems } from '../hooks/useDeletedVaultItems';
import { CustomButton } from '../components/Customs/customButton';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

export function RecentlyDeletedScreen({ navigation }:Props) {
    const { items, isLoading, errorCode, reload } = useDeletedVaultItems();

    async function handleRestore(item: DecryptedVaultItemV1) {
        const result = await services.vaultItemService.restoreItem(item.id);
        if(!result.ok){
            Alert.alert("Restore failed", result.error.code);
            return
        }
        await reload();        
    }

    async function handlePermanentDelete(item: DecryptedVaultItemV1) {
        Alert.alert("Are you sure you want to permanently delete this item?","This action cannot be Undone.", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                const result = await services.vaultItemService.permanentlyDeleteItem(item.id);

                    if (!result.ok){
                        Alert.alert("Delete failed", result.error.code);
                        return;
                    }

                    await reload();
                },
            },
        ]);
    }
    return (
        <View style={Styles.container}>
            <Text style={Styles.title}>
                Recently Deleted
            </Text>
            <Text style={Styles.warning}>
                Items here are soft-deleted. Permanent deletion cannot be undone.
            </Text>
            {errorCode && (<Text style={Styles.error}> Error: {errorCode}</Text>)}
            <FlatList
            data={items}
            keyExtractor={(item)=> item.id}
            refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={reload}/>
            }
            ListEmptyComponent={
                <Text style={Styles.empty}>
                    {isLoading ? "Loading..." : "No deleted items."} 
                </Text>
            }
            renderItem={({ item })=>(
                <DeletedItemRow
                item={item}
                onRestore={()=> handleRestore(item)}
                onPermanentDelete={()=>handlePermanentDelete(item)}
                />
            )}
            />
            <CustomButton title="Back to Vault" onPress={navigation.goBack} />
        </View>
    );
}

type DeletedItemRowProps = {
    item: DecryptedVaultItemV1;
    onRestore: () => void;
    onPermanentDelete: () => void;
}

function DeletedItemRow({item,onRestore,onPermanentDelete}:DeletedItemRowProps) {
    const site = item.payload.site;

    const target = 
    site.kind === "domain"
    ? site.normalizedDomain 
    : site.generationLabel;

    return (
        <View style={Styles.row}>
            <Text style={Styles.rowTitle}>{site.displayName}</Text>
            <Text style={Styles.rowSubtitle}>{target}</Text>
            <Text style={Styles.rowSubtitle}>{item.payload.usernameOrEmail}</Text>
            {item.record.deletedAt && (
                <Text style={Styles.deletedAt}>
                    Deleted At: {item.record.deletedAt}
                </Text>
            )}
            
            <View style={Styles.actions}>
                <CustomButton title='Restore' onPress={onRestore} />
                <CustomButton title='Delete Permanently' onPress={onPermanentDelete} color='#a00'/>
            </View>
        </View>
    )
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  warning: {
    fontSize: 13,
    color: "#555",
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 14,
    gap: 4,
  },
  rowTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  rowSubtitle: {
    fontSize: 13,
    color: "#555",
  },
  deletedAt: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  actions: {
    marginTop: 8,
    gap: 8,
  },
  empty: {
    marginTop: 24,
    color: "#555",
  },
  error: {
    color: "#b00020",
  },
});