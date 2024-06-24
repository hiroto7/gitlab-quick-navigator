import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { move } from "./lib";

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

export const useChromeStorage = <T extends Record<string, unknown>>(
  area: chrome.storage.AreaName,
  watch: boolean,
) => {
  const [items, setItems] = useState<T>();

  const load = useCallback(async () => {
    const items = (await chrome.storage[area].get()) as T;
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
  origin: string,
  path: string | undefined,
  options: { token?: string } | undefined,
) => {
  const {
    data,
    error,
    isValidating: isBaseValidating,
    isLoading: isBaseLoading,
  } = useSWR<T, unknown, [string, string, string | undefined] | undefined>(
    path !== undefined && options !== undefined
      ? [origin, getEndpoint(path), options.token]
      : undefined,
    ([origin, path, token]) => fetcher<T>(origin, path, token),
  );

  const parent = path !== undefined ? getParent(path) : undefined;
  const {
    data: parentData,
    error: parentError,
    isValidating: isParentValidating,
    isLoading: isParentLoading,
  } = useSWR<T, unknown, [string, string, string | undefined] | undefined>(
    error !== undefined && parent !== undefined && options !== undefined
      ? [origin, getEndpoint(parent), options.token]
      : undefined,
    ([origin, path, token]) => fetcher<T>(origin, path, token),
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

export const useDrag = <T>(currentList: T[]) => {
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
