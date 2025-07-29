import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const CurrentUrlContext = createContext<URL | undefined>(undefined);

export const useCurrentUrl = () => useContext(CurrentUrlContext)!;

export const CurrentUrlProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [href, setHref] = useState<string>();
  const [currentWindowId, setCurrentWindowId] = useState<number>();
  const [currentTabId, setCurrentTabId] = useState<number>();
  const url = useMemo(
    () => (href !== undefined ? new URL(href) : undefined),
    [href],
  );

  useEffect(() => {
    void (async () => {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tab = tabs[0];
      setHref(tab?.url);
      setCurrentTabId(tab?.id);
      setCurrentWindowId(tab?.windowId);
    })();
  }, []);

  useEffect(() => {
    const callback = (activeInfo: chrome.tabs.OnActivatedInfo) => {
      if (activeInfo.windowId !== currentWindowId) return;
      const tabId = activeInfo.tabId;
      setCurrentTabId(tabId);
      void (async () => {
        const tab = await chrome.tabs.get(tabId);
        if (tab?.url !== "") setHref(tab?.url);
      })();
    };

    chrome.tabs.onActivated.addListener(callback);
    return () => {
      chrome.tabs.onActivated.removeListener(callback);
    };
  });

  useEffect(() => {
    const callback = (
      updatedTabId: number,
      changeInfo: chrome.tabs.OnUpdatedInfo,
    ) => {
      if (updatedTabId !== currentTabId) return;
      if (changeInfo.url !== undefined) setHref(changeInfo.url);
    };

    chrome.tabs.onUpdated.addListener(callback);
    return () => {
      chrome.tabs.onUpdated.removeListener(callback);
    };
  });

  if (url === undefined) return <></>;
  return <CurrentUrlContext value={url}>{children}</CurrentUrlContext>;
};
