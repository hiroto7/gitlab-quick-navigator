import {
  Avatar,
  Listbox,
  ListboxItem,
  ListboxSection,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import "./App.css";
import { Group, Project } from "./types";
import { useCurrentUrl } from "./hooks";

const re =
  /^\/(?:groups\/)?(?<path>[a-zA-Z0-9]+(?:[a-zA-Z0-9_.-][a-zA-Z0-9]+)*(?:\/[a-zA-Z0-9]+(?:[a-zA-Z0-9_.-][a-zA-Z0-9]+)*)*)(?:\/-\/(?<feature>[a-z]+)\/?)?/;

const parsePathname = (pathname: string) => {
  const array = re.exec(pathname);
  const { path, feature } = array?.groups ?? {};
  return { path, feature };
};

const requestJson = async (url: URL): Promise<unknown> => {
  const response = await fetch(url);
  const json = await response.json();

  if (response.ok) {
    return json;
  } else {
    throw json;
  }
};

const getGroupDetailsAndProjects = async (origin: string, path: string) => {
  const encodedPath = encodeURIComponent(path);

  const [group, projects] = (await Promise.all([
    requestJson(new URL(`/api/v4/groups/${encodedPath}`, origin)),
    requestJson(new URL(`/api/v4/groups/${encodedPath}/projects`, origin)),
  ])) as [Group, Project[]];

  return { group, projects };
};

const parent = (path: string) => path.split("/").slice(0, -1).join("/");

const getClosestGroup = async (origin: string, path: string) => {
  try {
    return await getGroupDetailsAndProjects(origin, path);
  } catch {
    return await getGroupDetailsAndProjects(origin, parent(path));
  }
};

const navigate = (url: string) => chrome.tabs.update({ url });

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
      if (url !== undefined && path !== undefined)
        try {
          const { group, projects } = await getClosestGroup(url.origin, path);
          setGroup(group);
          setProjects(projects);
        } catch (error) {
          console.error(error);
          setError(true);
        }
    })();
  }, [url, path]);

  if (url === undefined) return;
  if (path === undefined) return "このページはGroupでもProjectでもありません";
  if (error) return "error";
  if (group === undefined || projects === undefined) return "loading";

  return (
    <Listbox selectionMode="single" selectedKeys={[path]}>
      <ListboxSection title="Group" showDivider>
        <ListboxItem
          key={group.full_path}
          onPress={() =>
            navigate(
              feature !== undefined
                ? `${group.web_url}/-/${feature}${url.search}`
                : group.web_url
            )
          }
          startContent={
            <Avatar isBordered radius="sm" src={group.avatar_url} />
          }
        >
          {group.name}
        </ListboxItem>
      </ListboxSection>
      <ListboxSection title="Projects">
        {projects.map((project) => (
          <ListboxItem
            key={project.path_with_namespace}
            onPress={() =>
              navigate(
                feature !== undefined
                  ? `${project.web_url}/-/${feature}${url.search}`
                  : project.web_url
              )
            }
            startContent={
              <Avatar isBordered radius="sm" src={project.avatar_url} />
            }
          >
            {project.name}
          </ListboxItem>
        ))}
      </ListboxSection>
    </Listbox>
  );
};

export default App;
