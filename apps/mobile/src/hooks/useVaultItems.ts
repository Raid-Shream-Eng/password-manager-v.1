import { useCallback, useEffect, useState } from "react";
import type { DecryptedVaultItemV1 } from "../services/VaultItemService";
import { services } from "../services/serviceContainer";

export function useVaultItems() {
  const [items, setItems] = useState<DecryptedVaultItemV1[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setErrorCode(null);

    try {
      const result = await services.vaultItemService.listActiveItems();

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

  return {
    items,
    isLoading,
    errorCode,
    reload: loadItems,
  };
}