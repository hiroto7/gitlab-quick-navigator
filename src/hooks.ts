import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { move } from "./lib";

export const useCurrentUrl = () => {
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
    const callback = (activeInfo: chrome.tabs.TabActiveInfo) => {
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

export const useChromeStorage = <T extends object>(
  area: chrome.storage.AreaName,
  watch: boolean,
) => {
  const [items, setItems] = useState<T>();

  const load = useCallback(async () => {
    const items = (await chrome.storage[area].get()) as T;
    setItems(items);
  }, [area]);

  const set = useCallback(
    async (items: Partial<T>) => {
      setItems((currentItems) =>
        currentItems !== undefined ? { ...currentItems, ...items } : undefined,
      );
      await chrome.storage[area].set(items);
    },
    [area],
  );

  const remove = useCallback(
    (key: keyof T & string) => chrome.storage[area].remove(key),
    [area],
  );

  useEffect(() => void load(), [load]);

  useEffect(() => {
    if (!watch) return;
    chrome.storage[area].onChanged.addListener(() => void load());
    return () => {
      chrome.storage[area].onChanged.removeListener(() => void load());
    };
  }, [area, load, watch]);

  return { items, set, remove };
};

const fetcher = async <T>(
  origin: string,
  path: string,
  token: string | undefined,
) => {
  const url = new URL(path, origin);
  const response =
    token !== undefined
      ? await fetch(url, { headers: { "PRIVATE-TOKEN": token } })
      : await fetch(url);

  const json: unknown = await response.json();
  if (!response.ok) throw json;
  return json as T;
};

const getParent = (path: string) =>
  path.includes("/") ? path.split("/").slice(0, -1).join("/") : undefined;

export const useClosestGroup = <T>(
  getEndpoint: (path: string) => string,
  origin: string | undefined,
  path: string | undefined,
  token: string | undefined,
  onSuccess: (data: T) => void,
) => {
  const {
    data,
    error,
    isValidating: isBaseValidating,
    isLoading: isBaseLoading,
  } = useSWR<T, unknown, [string, string, string | undefined] | false>(
    origin !== undefined &&
      path !== undefined && [origin, getEndpoint(path), token],
    ([origin, path, token]) => fetcher<T>(origin, path, token),
    { onSuccess },
  );

  const parent = path !== undefined ? getParent(path) : undefined;
  const {
    data: parentData,
    error: parentError,
    isValidating: isParentValidating,
    isLoading: isParentLoading,
  } = useSWR<T, unknown, [string, string, string | undefined] | false>(
    error !== undefined &&
      origin !== undefined &&
      parent !== undefined && [origin, getEndpoint(parent), token],
    ([origin, path, token]) => fetcher<T>(origin, path, token),
    { onSuccess },
  );

  const isValidating = isBaseValidating || isParentValidating;
  const isLoading =
    (isBaseLoading && parentData === undefined) ||
    (isParentLoading && data === undefined);

  if (error === undefined || parent === undefined)
    return { data, error, isValidating, isLoading };
  else
    return {
      data: parentData,
      error:
        parentError === undefined
          ? undefined
          : new AggregateError([error, parentError]),
      isValidating,
      isLoading,
    };
};

export const useDrag = <T>(currentList: readonly T[]) => {
  const [draggedItem, setDraggedItem] = useState<T>();
  const [to, setTo] = useState<number>();

  const onDragStart = useCallback((item: T) => {
    setDraggedItem(item);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggedItem(undefined);
    setTo(undefined);
  }, []);

  const onDragEnter: (index: number) => void = setTo;

  const from =
    draggedItem !== undefined ? currentList.indexOf(draggedItem) : undefined;

  const list =
    from !== undefined && from > -1 && to !== undefined
      ? move(currentList, from, to)
      : currentList;

  return {
    list,
    dragging: draggedItem !== undefined,
    onDragStart,
    onDragEnd,
    onDragEnter,
  };
};
