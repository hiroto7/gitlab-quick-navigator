import { useCallback, useContext, useState } from "react";
import useSWR from "swr";
import { CurrentUrlContext } from "./contexts/CurrentUrlContext";
import { move } from "./lib";

export const useCurrentUrl = () => useContext(CurrentUrlContext)!;

export const useLoadingUrl = () => {
  const currentUrl = useCurrentUrl();
  const currentHref = currentUrl.href;

  const [previousHref, setPreviousHref] = useState(currentHref);
  const [loadingUrl, setLoadingUrl] = useState<URL>();

  if (previousHref !== currentHref) {
    setPreviousHref(currentHref);
    setLoadingUrl(undefined);
  }

  const navigate = (url: string) => {
    void chrome.tabs.update({ url });
    setLoadingUrl(new URL(url));
  };

  return { navigate, loadingUrl };
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
