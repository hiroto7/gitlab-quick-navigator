import {
  Avatar,
  Button,
  Link,
  Listbox,
  ListboxItem,
  ListboxSection,
  Skeleton,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import "./App.css";
import { Group, Project } from "./types";
import { useChromeStorage, useCurrentUrl } from "./hooks";

const re =
  /^\/(?:groups\/)?(?<path>[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*(?:\/[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*)*)(?:\/-\/(?<feature>[a-z_]+)\/?)?/;

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

const getListboxItem = ({
  key,
  name,
  avatar,
  base,
  feature,
  search,
}: {
  key: string;
  name: string;
  avatar: string | null;
  base: string;
  feature: string | undefined;
  search: string;
}) => {
  const href = feature !== undefined ? `${base}/-/${feature}${search}` : base;

  return (
    <ListboxItem
      key={key}
      href={href}
      onPress={() => chrome.tabs.update({ url: href })}
      description={
        feature !== undefined
          ? capitalize(feature).replace("_", " ")
          : undefined
      }
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
};

const capitalize = (text: string) =>
  text.slice(0, 1).toUpperCase() + text.slice(1);

const App: React.FC = () => {
  const [error, setError] = useState(false);
  const [group, setGroup] = useState<Group>();
  const [projects, setProjects] = useState<Project[]>();

  const url = useCurrentUrl();

  const { path, feature } =
    url !== undefined
      ? parsePathname(url.pathname)
      : { path: undefined, feature: undefined };

  const tokens = useChromeStorage("local") as
    | Record<string, string>
    | undefined;

  useEffect(() => {
    (async () => {
      setError(false);
      if (
        url?.origin !== undefined &&
        path !== undefined &&
        tokens !== undefined
      )
        try {
          const group = await getClosestGroup(
            (path) => fetchGroupDetail(url.origin, path, tokens[url.origin]),
            path,
          );
          setGroup(group);
        } catch (error) {
          console.error(error);
          setError(true);
        }
    })();
  }, [url?.origin, path, tokens]);

  useEffect(() => {
    (async () => {
      setError(false);
      if (
        url?.origin !== undefined &&
        path !== undefined &&
        tokens !== undefined
      )
        try {
          const projects = await getClosestGroup(
            (path) => fetchGroupProjects(url.origin, path, tokens[url.origin]),
            path,
          );
          setProjects(projects);
        } catch (error) {
          console.error(error);
          setError(true);
        }
    })();
  }, [url?.origin, path, tokens]);

  if (url === undefined) return;
  if (path === undefined)
    return (
      <div className="p-2">
        <p>
          <strong className="text-danger">
            このページはGitLab上のGroupでもProjectでもありません。
          </strong>
        </p>
      </div>
    );
  if (error)
    return (
      <div className="p-2 flex flex-col gap-2">
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

            if (token !== "")
              await chrome.storage.local.set({
                [url.origin]: token,
              });
            else await chrome.storage.local.remove(url.origin);
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
            feature: feature === "project_members" ? "group_members" : feature,
            search: url.search,
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
            feature: feature === "group_members" ? "project_members" : feature,
            search: url.search,
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

export default App;
