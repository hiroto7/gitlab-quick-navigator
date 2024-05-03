import {
  Avatar,
  Button,
  Link,
  Listbox,
  ListboxItem,
  ListboxSection,
  Progress,
  Skeleton,
} from "@nextui-org/react";
import { useCallback } from "react";
import "./App.css";
import { useChromeStorage, useCurrentUrl } from "./hooks";
import {
  Feature,
  GROUP_FEATURES,
  GROUP_FEATURE_NAMES,
  Group,
  PROJECT_FEATURES,
  PROJECT_FEATURE_NAMES,
  Project,
  getFeature,
  isProjectFeatureAvailable,
} from "./lib";
import useSWR, { Cache, SWRConfig, SWRResponse, State } from "swr";

const re =
  /^\/(?:groups\/)?(?<path>[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*(?:\/[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*)*)(?:\/-\/(?<feature>[a-z_]+(?:\/[a-z_]+)*))?/;

const parsePathname = (pathname: string) => {
  const array = re.exec(pathname);
  const { path, feature } = array?.groups ?? {};
  return { path, feature };
};

const fetcher = async (url: string, token: string | undefined) => {
  const response =
    token !== undefined
      ? await fetch(url, { headers: { "PRIVATE-TOKEN": token } })
      : await fetch(url);

  const json: unknown = await response.json();
  if (!response.ok) throw json;
  return json;
};

const useGroupDetail = (
  origin: string,
  path: string | undefined,
  token: string | undefined,
): Pick<SWRResponse<Group>, "data" | "error" | "isValidating"> => {
  const { data, error, isValidating } = useSWR(
    path !== undefined && [
      `${origin}/api/v4/groups/${encodeURIComponent(path)}?with_projects=false`,
      token,
    ],
    (args) => fetcher(...args),
  );

  return { data: data as Group | undefined, error, isValidating };
};

const useGroupProjects = (
  origin: string,
  path: string | undefined,
  token: string | undefined,
): Pick<SWRResponse<Project[]>, "data" | "error" | "isValidating"> => {
  const { data, error, isValidating } = useSWR(
    path !== undefined && [
      `${origin}/api/v4/groups/${encodeURIComponent(path)}/projects?order_by=last_activity_at`,
      token,
    ],
    (args) => fetcher(...args),
  );

  return { data: data as Project[] | undefined, error, isValidating };
};

const useClosestGroup = <T,>(
  useGroup: (
    path: string | undefined,
  ) => Pick<SWRResponse<T>, "data" | "error" | "isValidating">,
  path: string | undefined,
) => {
  const parent = path !== undefined ? getParent(path) : undefined;
  const { data, error, isValidating: isBaseValidating } = useGroup(path);
  const {
    data: parentData,
    error: parentError,
    isValidating: isParentValidating,
  } = useGroup(error !== undefined ? parent : undefined);

  const isValidating = isBaseValidating || isParentValidating;

  if (error === undefined || parent === undefined)
    return { data, error, isValidating };
  else
    return {
      data: parentData,
      error:
        parentError === undefined
          ? undefined
          : new AggregateError([error, parentError]),
      isValidating,
    };
};

const getParent = (path: string) =>
  path.includes("/") ? path.split("/").slice(0, -1).join("/") : undefined;
const Main: React.FC<{ url: URL; token: string | undefined }> = ({
  url,
  token,
}) => {
  const { path, feature } = parsePathname(url.pathname);

  const {
    data: group,
    error: groupError,
    isValidating: isGroupValidating,
  } = useClosestGroup((path) => useGroupDetail(url.origin, path, token), path);
  const {
    data: projects,
    error: projectsError,
    isValidating: isProjectsValidating,
  } = useClosestGroup(
    (path) => useGroupProjects(url.origin, path, token),
    path,
  );

  const getListboxItem = useCallback(
    ({
      key,
      name,
      avatar,
      base,
      feature,
    }: {
      key: string;
      name: string;
      avatar: string | null;
      base: string;
      feature: Feature | undefined;
    }) => {
      const href =
        feature !== undefined ? `${base}/-/${feature.path}${url.search}` : base;

      return (
        <ListboxItem
          key={key}
          href={href}
          onPress={() => chrome.tabs.update({ url: href })}
          description={feature?.name}
          startContent={
            <Avatar
              isBordered
              radius="sm"
              size="sm"
              name={name}
              {...(avatar !== null ? { src: avatar } : {})}
              className="flex-shrink-0"
            />
          }
        >
          {name}
        </ListboxItem>
      );
    },
    [url.search],
  );

  if (path === undefined)
    return (
      <div className="p-2 text-small">
        <p>
          <strong className="text-danger">
            このページはGitLab上のGroupでもProjectでもありません。
          </strong>
        </p>
      </div>
    );
  if (groupError || projectsError)
    return (
      <div className="flex flex-col gap-2 p-2 text-small">
        <p>
          <strong className="text-danger">
            GroupやProjectの一覧を取得できません。
          </strong>
        </p>
        <p>
          このページがGitLab上のGroupでもProjectでもないか、権限がありません。プライベートなGroupやProjectで使うには、アクセストークンを設定してください。
        </p>
        <Button
          size="sm"
          color="primary"
          onPress={async () => {
            const token = prompt(
              `${url.origin} 用のアクセストークンを入力してください。read_apiスコープが必要です。`,
            );
            if (token === null) return;

            await chrome.storage.local.set({
              [url.origin]: token !== "" ? { token } : {},
            });
          }}
        >
          アクセストークンを設定
        </Button>
        <p>
          <Link
            size="sm"
            showAnchorIcon
            isExternal
            href={`${url.origin}/-/user_settings/personal_access_tokens?name=GitLab+Quick+Navigator&scopes=read_api`}
          >
            アクセストークンを発行
          </Link>
        </p>
      </div>
    );

  const groupFeature: (typeof GROUP_FEATURES)[number] | undefined =
    feature !== undefined
      ? feature.startsWith("project_members")
        ? "group_members"
        : feature.startsWith("analytics/issues_analytics")
          ? "issues_analytics"
          : GROUP_FEATURES.findLast((groupFeature) =>
              feature.startsWith(groupFeature),
            )
      : undefined;

  return (
    <>
      <Progress
        size="sm"
        color="default"
        radius="none"
        isIndeterminate
        className={
          !isGroupValidating && !isProjectsValidating ? "invisible" : undefined
        }
        aria-label="Loading..."
      />
      <Listbox
        selectionMode="single"
        selectedKeys={[path]}
        disabledKeys={["skeleton"]}
        aria-label="Group and Projects"
      >
        <ListboxSection title="Group" showDivider>
          {group !== undefined ? (
            getListboxItem({
              key: group.full_path,
              base: group.web_url,
              name: group.name,
              avatar: group.avatar_url,
              feature:
                groupFeature !== undefined
                  ? getFeature(groupFeature, GROUP_FEATURE_NAMES)
                  : undefined,
            })
          ) : (
            <ListboxItem key="skeleton" textValue="Loading...">
              <Skeleton className="h-8 w-full" />
            </ListboxItem>
          )}
        </ListboxSection>
        <ListboxSection title="Projects">
          {projects?.map((project) => {
            const projectFeature:
              | (typeof PROJECT_FEATURES)[number]
              | undefined =
              feature !== undefined
                ? feature.startsWith("group_members")
                  ? "project_members"
                  : feature.startsWith("issues_analytics")
                    ? "analytics/issues_analytics"
                    : PROJECT_FEATURES.findLast(
                        (projectFeature) =>
                          (feature.startsWith(projectFeature) &&
                            isProjectFeatureAvailable[projectFeature]?.(
                              project,
                            )) ??
                          true,
                      )
                : undefined;

            return getListboxItem({
              key: project.path_with_namespace,
              base: project.web_url,
              name: project.name,
              avatar: project.avatar_url,
              feature:
                projectFeature !== undefined
                  ? getFeature(projectFeature, PROJECT_FEATURE_NAMES)
                  : undefined,
            });
          }) ?? (
            <ListboxItem key="skeleton" textValue="Loading...">
              <Skeleton className="h-8 w-full" />
            </ListboxItem>
          )}
        </ListboxSection>
      </Listbox>
    </>
  );
};

const getProvider = (stored: Record<string, State>) => (): Cache => {
  const map = new Map(Object.entries(stored));
  return {
    keys: map.keys.bind(map),
    get: map.get.bind(map),
    set: (key, value) => {
      map.set(key, value);
      chrome.storage.session.set({ [key]: value });
    },
    delete: (key) => {
      map.delete(key);
      chrome.storage.session.remove(key);
    },
  };
};

const App: React.FC = () => {
  const url = useCurrentUrl();
  const options = useChromeStorage("local", true) as
    | Record<string, { token?: string }>
    | undefined;
  const cache = useChromeStorage("session", false) as
    | Record<string, State>
    | undefined;

  if (url === undefined || options === undefined || cache === undefined) return;

  const siteOptions = options[url.origin];

  if (siteOptions !== undefined)
    return (
      <SWRConfig value={{ provider: getProvider(cache) }}>
        <Main url={url} token={siteOptions.token} />
      </SWRConfig>
    );
  else
    return (
      <div className="flex flex-col gap-2 p-2 text-small">
        <p>
          <strong>
            このサイト ({url.origin}) でGitLab Quick Navigatorを使用しますか？
          </strong>
        </p>
        <p>
          有効にすると、このサイトでポップアップを開くたびに /api/v4
          以下のエンドポイントへリクエストが発生します。
        </p>
        <Button
          size="sm"
          color="primary"
          onPress={() => chrome.storage.local.set({ [url.origin]: {} })}
        >
          有効にする
        </Button>
      </div>
    );
};

export default App;
