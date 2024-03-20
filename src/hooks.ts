import { useEffect, useMemo, useState } from "react";

export const useCurrentUrl = () => {
  const [href, setHref] = useState<string>();
  const url = useMemo(
    () => (href !== undefined ? new URL(href) : undefined),
    [href]
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
      changeInfo: chrome.tabs.TabChangeInfo
    ) => {
      if (changeInfo.url !== undefined) setHref(changeInfo.url);
    };

    chrome.tabs.onUpdated.addListener(callback);
    return () => chrome.tabs.onUpdated.removeListener(callback);
  });

  return url;
};
