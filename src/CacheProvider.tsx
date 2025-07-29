import { Cache, SWRConfig, State } from "swr";
import React from "react";
import { useChromeSessionStorage } from "./contexts/ChromeStorageContext";

const getProvider = (stored: Record<string, State>) => (): Cache => {
  const map = new Map(Object.entries(stored));
  return {
    keys: map.keys.bind(map),
    get: map.get.bind(map),
    set: (key, value) => {
      map.set(key, value);
      void chrome.storage.session.set({ [key]: value });
    },
    delete: (key) => {
      map.delete(key);
      void chrome.storage.session.remove(key);
    },
  };
};

const CacheProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { items: cache } = useChromeSessionStorage();

  return (
    <SWRConfig value={{ provider: getProvider(cache) }}>{children}</SWRConfig>
  );
};

export default CacheProvider;
