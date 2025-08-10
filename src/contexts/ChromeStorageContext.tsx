import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { State } from "swr";
import { StoredData } from "../lib";

const createChromeStorageContext = <T,>(
  area: chrome.storage.AreaName,
  watch: boolean,
) => {
  const ChromeStorageContext = createContext<
    | {
        items: T;
        set: (items: Partial<T>) => Promise<void>;
        remove: (key: keyof T & string) => Promise<void>;
      }
    | undefined
  >(undefined);

  const useChromeStorage = () => useContext(ChromeStorageContext)!;

  const ChromeStorageProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    const [items, setItems] = useState<T>();

    const load = useCallback(async () => {
      const items = (await chrome.storage[area].get()) as T;
      setItems(items);
    }, []);

    const set = useCallback(async (items: Partial<T>) => {
      setItems((currentItems) =>
        currentItems !== undefined ? { ...currentItems, ...items } : undefined,
      );
      await chrome.storage[area].set(items);
    }, []);

    const remove = useCallback(
      (key: keyof T & string) => chrome.storage[area].remove(key),
      [],
    );

    useEffect(() => void load(), [load]);

    useEffect(() => {
      if (!watch) return;
      chrome.storage[area].onChanged.addListener(() => void load());
      return () => {
        chrome.storage[area].onChanged.removeListener(() => void load());
      };
    }, [load]);

    if (items === undefined) return <></>;

    return (
      <ChromeStorageContext value={{ items, set, remove }}>
        {children}
      </ChromeStorageContext>
    );
  };

  return { useChromeStorage, ChromeStorageProvider };
};

export const {
  useChromeStorage: useChromeLocalStorage,
  ChromeStorageProvider: ChromeLocalStorageProvider,
} = createChromeStorageContext<StoredData>("local", true);

export const {
  useChromeStorage: useChromeSessionStorage,
  ChromeStorageProvider: ChromeSessionStorageProvider,
} = createChromeStorageContext<Record<string, State>>("session", false);
