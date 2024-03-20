import { useEffect, useState } from "react";
import "./App.css";
import { Group, Project } from "./types";
import { useCurrentUrl } from "./hooks";

const re =
  /^\/(?:groups\/)?(?<path>[a-zA-Z0-9](?:[a-zA-Z0-9_.-][a-zA-Z0-9]+)*(?:\/[a-zA-Z0-9](?:[a-zA-Z0-9_.-][a-zA-Z0-9]+)*)*)(?:\/-\/(?<feature>[a-z]+)\/?)?/;

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

const Link: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <a href={href} onClick={() => chrome.tabs.update({ url: href })}>
    {children}
  </a>
);

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
    <ul style={{ textWrap: "nowrap" }}>
      <li>
        Group
        <ul>
          <li>
            <Link
              href={
                feature !== undefined
                  ? `${group.web_url}/-/${feature}${url.search}`
                  : group.web_url
              }
            >
              {group.name}
            </Link>
            {group.full_path === path ? "✅" : <></>}
          </li>
        </ul>
      </li>
      <li>
        Projects
        <ul>
          {projects.map((project) => (
            <li key={project.web_url}>
              <Link
                href={
                  feature !== undefined
                    ? `${project.web_url}/-/${feature}${url.search}`
                    : project.web_url
                }
              >
                {project.name}
              </Link>
              {project.path_with_namespace === path ? "✅" : <></>}
            </li>
          ))}
        </ul>
      </li>
    </ul>
  );
};

export default App;
