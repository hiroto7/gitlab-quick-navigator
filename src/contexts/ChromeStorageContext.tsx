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

    const getItems = useCallback(() => chrome.storage[area].get(), []);

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

    useEffect(() => {
      let isMounted = true;
      void getItems().then((items) => {
        if (isMounted) setItems(items as T);
      });
      return () => {
        isMounted = false;
      };
    }, [getItems]);

    useEffect(() => {
      if (!watch) return;
      const listener = () => {
        void getItems().then((items) => setItems(items as T));
      };
      chrome.storage[area].onChanged.addListener(listener);
      return () => {
        chrome.storage[area].onChanged.removeListener(listener);
      };
    }, [getItems]);

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
