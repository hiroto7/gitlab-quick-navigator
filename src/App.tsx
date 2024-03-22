import {
  Avatar,
  Listbox,
  ListboxItem,
  ListboxSection,
  Skeleton,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import "./App.css";
import { Group, Project } from "./types";
import { useCurrentUrl } from "./hooks";

const re =
  /^\/(?:groups\/)?(?<path>[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*(?:\/[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*)*)(?:\/-\/(?<feature>[a-z_]+)\/?)?/;

const parsePathname = (pathname: string) => {
  const array = re.exec(pathname);
  const { path, feature } = array?.groups ?? {};
  return { path, feature };
};

const requestJson = async (url: URL): Promise<unknown> => {
  const response = await fetch(url);

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

const fetchGroupDetail = async (origin: string, path: string) => {
  const encodedPath = encodeURIComponent(path);
  return (await requestJson(
    new URL(`/api/v4/groups/${encodedPath}?with_projects=false`, origin)
  )) as Group;
};

const fetchGroupProjects = async (origin: string, path: string) => {
  const encodedPath = encodeURIComponent(path);
  return (await requestJson(
    new URL(`/api/v4/groups/${encodedPath}/projects`, origin)
  )) as Project[];
};

const parent = (path: string) => path.split("/").slice(0, -1).join("/");

const getClosestGroup = async <T,>(
  fetcher: (origin: string, path: string) => Promise<T>,
  origin: string,
  path: string
) => {
  try {
    return await fetcher(origin, path);
  } catch {
    return await fetcher(origin, parent(path));
  }
};

const getListboxItem = ({
  key,
  name,
  avatar,
  href,
}: {
  key: string;
  name: string;
  avatar: string | null;
  href: string;
}) => (
  <ListboxItem
    key={key}
    href={href}
    onPress={() => chrome.tabs.update({ url: href })}
    startContent={
      <Avatar
        isBordered
        radius="sm"
        size="sm"
        name={name}
        {...(avatar !== null ? { src: avatar } : {})}
      />
    }
  >
    {name}
  </ListboxItem>
);

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

  useEffect(() => {
    (async () => {
      setError(false);
      if (url?.origin !== undefined && path !== undefined)
        try {
          const group = await getClosestGroup(
            fetchGroupDetail,
            url.origin,
            path
          );
          setGroup(group);
        } catch (error) {
          console.error(error);
          setError(true);
        }
    })();
  }, [url?.origin, path]);

  useEffect(() => {
    (async () => {
      setError(false);
      if (url?.origin !== undefined && path !== undefined)
        try {
          const projects = await getClosestGroup(
            fetchGroupProjects,
            url.origin,
            path
          );
          setProjects(projects);
        } catch (error) {
          console.error(error);
          setError(true);
        }
    })();
  }, [url?.origin, path]);

  if (url === undefined) return;
  if (path === undefined)
    return (
      <strong className="text-danger">
        このページはGitLab上のGroupでもProjectでもありません。
      </strong>
    );
  if (error)
    return (
      <strong className="text-danger">
        GroupおよびProjectの一覧を取得できません。このページはGitLab上のGroupでもProjectでもない可能性があります。
      </strong>
    );

  return (
    <Listbox
      selectionMode="single"
      selectedKeys={[path]}
      disabledKeys={["skeleton"]}
      topContent={
        feature !== undefined ? (
          <p>
            ほかのGroupまたはProjectの
            <strong className="text-primary">
              {capitalize(feature).replace("_", " ")}
            </strong>
            に移動
          </p>
        ) : undefined
      }
    >
      <ListboxSection title="Group" showDivider>
        {group !== undefined ? (
          getListboxItem({
            key: group.full_path,
            href:
              feature !== undefined
                ? `${group.web_url}/-/${feature}${url.search}`
                : group.web_url,
            name: group.name,
            avatar: group.avatar_url,
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
            href:
              feature !== undefined
                ? `${project.web_url}/-/${feature}${url.search}`
                : project.web_url,
            name: project.name,
            avatar: project.avatar_url,
          })
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
