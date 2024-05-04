import { useCallback, useEffect, useMemo, useState } from "react";

export const useCurrentUrl = () => {
  const [href, setHref] = useState<string>();
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
    })();
  }, []);

  useEffect(() => {
    const callback = (
      updatedTabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
    ) => {
      if (updatedTabId !== currentTabId) return;
      if (changeInfo.url !== undefined) setHref(changeInfo.url);
    };

    chrome.tabs.onUpdated.addListener(callback);
    return () => {
      chrome.tabs.onUpdated.removeListener(callback);
    };
  });

  return url;
};

export const useChromeStorage = (
  area: chrome.storage.AreaName,
  watch: boolean,
) => {
  const [items, setItems] = useState<Record<string, unknown>>();

  const load = useCallback(async () => {
    const items = await chrome.storage[area].get();
    setItems(items);
  }, [area]);

  useEffect(() => void load(), [load]);

  useEffect(() => {
    if (!watch) return;
    chrome.storage[area].onChanged.addListener(() => void load());
    return () => {
      chrome.storage[area].onChanged.removeListener(() => void load());
    };
  }, [area, load, watch]);

  return items;
};
