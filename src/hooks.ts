import { useCallback, useEffect, useMemo, useState } from "react";

export const useCurrentUrl = () => {
  const [href, setHref] = useState<string>();
  const url = useMemo(
    () => (href !== undefined ? new URL(href) : undefined),
    [href],
  );

  useEffect(() => {
    (async () => {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      setHref(tabs[0]?.url);
    })();
  }, []);

  useEffect(() => {
    const callback = (
      _tabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
    ) => {
      if (changeInfo.url !== undefined) setHref(changeInfo.url);
    };

    chrome.tabs.onUpdated.addListener(callback);
    return () => chrome.tabs.onUpdated.removeListener(callback);
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

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!watch) return;
    chrome.storage[area].onChanged.addListener(load);
    return () => chrome.storage[area].onChanged.removeListener(load);
  }, [area, load, watch]);

  return items;
};
