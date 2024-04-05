import {
  Avatar,
  Button,
  Link,
  Listbox,
  ListboxItem,
  ListboxSection,
  Skeleton,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
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
} from "./lib";

const re =
  /^\/(?:groups\/)?(?<path>[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*(?:\/[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*)*)(?:\/-\/(?<feature>[a-z_]+(?:\/[a-z_]+)*))?/;

const parsePathname = (pathname: string) => {
  const array = re.exec(pathname);
  const { path, feature } = array?.groups ?? {};
  return { path, feature };
};

const requestJson = async (
  url: URL,
  token: string | undefined,
): Promise<unknown> => {
  const headers = token !== undefined ? { "PRIVATE-TOKEN": token } : undefined;
  const response = await fetch(
    url,
    headers !== undefined ? { headers } : undefined,
  );

  if (response.ok) {
    return await response.json();
  } else {
    const text = await response.text();
    try {
      throw JSON.parse(text);
    } catch {
      throw text;
    }
  }
};

const fetchGroupDetail = async (
  origin: string,
  path: string,
  token: string | undefined,
) => {
  const encodedPath = encodeURIComponent(path);
  return (await requestJson(
    new URL(`/api/v4/groups/${encodedPath}?with_projects=false`, origin),
    token,
  )) as Group;
};

const fetchGroupProjects = async (
  origin: string,
  path: string,
  token: string | undefined,
) => {
  const encodedPath = encodeURIComponent(path);
  return (await requestJson(
    new URL(
      `/api/v4/groups/${encodedPath}/projects?order_by=last_activity_at`,
      origin,
    ),
    token,
  )) as Project[];
};

const parent = (path: string) => path.split("/").slice(0, -1).join("/");

const getClosestGroup = async <T,>(
  fetcher: (path: string) => Promise<T>,
  path: string,
) => {
  const paths = path.includes("/") ? [path, parent(path)] : [path];
  const errors: unknown[] = [];

  for (const path of paths)
    try {
      return await fetcher(path);
    } catch (error) {
      errors.push(error);
    }

  throw AggregateError(errors);
};

const Main: React.FC<{ url: URL; token: string | undefined }> = ({
  url,
  token,
}) => {
  const [error, setError] = useState(false);
  const [group, setGroup] = useState<Group>();
  const [projects, setProjects] = useState<Project[]>();

  const { path, feature } = parsePathname(url.pathname);

  useEffect(() => {
    (async () => {
      setError(false);
      if (path !== undefined)
        try {
          const group = await getClosestGroup(
            (path) => fetchGroupDetail(url.origin, path, token),
            path,
          );
          setGroup(group);
        } catch (error) {
          console.error(error);
          setError(true);
        }
    })();
  }, [url.origin, path, token]);

  useEffect(() => {
    (async () => {
      setError(false);
      if (path !== undefined)
        try {
          const projects = await getClosestGroup(
            (path) => fetchGroupProjects(url.origin, path, token),
            path,
          );
          setProjects(projects);
        } catch (error) {
          console.error(error);
          setError(true);
        }
    })();
  }, [url?.origin, path, token]);

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
  if (error)
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

  const groupFeature =
    feature !== undefined
      ? feature.startsWith("project_members")
        ? "group_members"
        : GROUP_FEATURES.findLast((groupFeature) =>
            feature.startsWith(groupFeature),
          )
      : undefined;

  const projectFeature =
    feature !== undefined
      ? feature.startsWith("group_members")
        ? "project_members"
        : PROJECT_FEATURES.findLast((projectFeature) =>
            feature.startsWith(projectFeature),
          )
      : undefined;

  return (
    <Listbox
      selectionMode="single"
      selectedKeys={[path]}
      disabledKeys={["skeleton"]}
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
          <ListboxItem key="skeleton">
            <Skeleton className="h-8 w-full" />
          </ListboxItem>
        )}
      </ListboxSection>
      <ListboxSection title="Projects">
        {projects?.map((project) =>
          getListboxItem({
            key: project.path_with_namespace,
            base: project.web_url,
            name: project.name,
            avatar: project.avatar_url,
            feature:
              projectFeature !== undefined
                ? getFeature(projectFeature, PROJECT_FEATURE_NAMES)
                : undefined,
          }),
        ) ?? (
          <ListboxItem key="skeleton">
            <Skeleton className="h-8 w-full" />
          </ListboxItem>
        )}
      </ListboxSection>
    </Listbox>
  );
};

const App: React.FC = () => {
  const url = useCurrentUrl();
  const options = useChromeStorage("local") as
    | Record<string, { token?: string }>
    | undefined;

  if (url === undefined || options === undefined) return;

  const siteOptions = options[url.origin];

  if (siteOptions !== undefined)
    return <Main url={url} token={siteOptions.token} />;
  else
    return (
      <div className="flex flex-col gap-2 p-2 text-small">
        <p>
          このサイト ({url.origin}) でGitLab Quick Navigatorを使用しますか？
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
