import { use, useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Group, move, Project } from "./lib";

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

export const getParent = (path: string) =>
  path.includes("/") ? path.split("/").slice(0, -1).join("/") : undefined;

const useGitLab = <T>(
  getEndpoint: (path: string) => string,
  origin: string | undefined,
  path: string | undefined,
  token: string | undefined,
) =>
  useSWR<T, unknown, [string, string, string | undefined] | false>(
    origin !== undefined &&
      path !== undefined && [origin, getEndpoint(path), token],
    ([origin, path, token]) => fetcher<T>(origin, path, token),
  );

export const useGroup = (
  origin: string | undefined,
  groupPath: string | undefined,
  token: string | undefined,
) =>
  useGitLab<Group>(
    (path) => `/api/v4/groups/${encodeURIComponent(path)}?with_projects=false`,
    origin,
    groupPath,
    token,
  );

export const useGroupProjects = (
  origin: string | undefined,
  groupPath: string | undefined,
  token: string | undefined,
) =>
  useGitLab<readonly Project[]>(
    (path) =>
      `/api/v4/groups/${encodeURIComponent(path)}/projects?order_by=last_activity_at`,
    origin,
    groupPath,
    token,
  );

export const useProject = (
  origin: string | undefined,
  projectPath: string | undefined,
  token: string | undefined,
) =>
  useGitLab<Project>(
    (path) => `/api/v4/projects/${encodeURIComponent(path)}`,
    origin,
    projectPath,
    token,
  );

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
