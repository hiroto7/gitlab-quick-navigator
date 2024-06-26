import { Button, Link, Progress } from "@nextui-org/react";
import React from "react";
import "./App.css";
import { useChromeStorage, useClosestGroup, useCurrentUrl } from "./hooks";
import { Group, Project } from "./lib";
import GroupProjectList from "./GroupProjectList";

const re =
  /^\/(?:groups\/)?(?<path>[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*(?:\/[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*)*)(?:\/-\/(?<feature>[a-z_]+(?:\/[a-z_]+)*))?/;

const parsePathname = (pathname: string) => {
  const array = re.exec(pathname);
  const { path, feature } = array?.groups ?? {};
  return { path, feature };
};

const groupDetailEndpoint = (path: string) =>
  `/api/v4/groups/${encodeURIComponent(path)}?with_projects=false`;

const groupProjectsEndpoint = (path: string) =>
  `/api/v4/groups/${encodeURIComponent(path)}/projects?order_by=last_activity_at`;

const Main: React.FC<{
  options: { token?: string } | undefined;
  url: URL;
  starredGroups: Group[];
  starredProjects: Project[];
  onEnable: () => void;
  onSetToken: (token: string) => void;
  onDeleteToken: () => void;
}> = ({
  options,
  url,
  starredGroups,
  starredProjects,
  onEnable,
  onSetToken,
  onDeleteToken,
}) => {
  const { path, feature } = parsePathname(url.pathname);

  const {
    data: group,
    error: groupError,
    isValidating: isGroupValidating,
    isLoading: isGroupLoading,
  } = useClosestGroup<Group>(groupDetailEndpoint, url.origin, path, options);
  const {
    data: projects,
    error: projectsError,
    isValidating: isProjectsValidating,
    isLoading: isProjectsLoading,
  } = useClosestGroup<Project[]>(
    groupProjectsEndpoint,
    url.origin,
    path,
    options,
  );

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
      {options === undefined ? (
        <div className="m-2 flex flex-col gap-2 rounded-medium bg-content1 p-2">
          <p className="text-small font-bold">
            このサイトでGitLab Quick Navigatorを有効にしますか？
          </p>
          <p className="text-tiny">
            有効にすると、このサイト ({url.origin})
            でGroupやProjectの一覧を表示します。
          </p>
          <p className="text-tiny">
            ポップアップを開くたびに /api/v4
            以下のエンドポイントへリクエストが発生するため、GitLab以外のサイトでは有効にしないでください。
          </p>
          <Button size="sm" color="primary" className="grow" onPress={onEnable}>
            有効にする
          </Button>
        </div>
      ) : path === undefined ? (
        <div className="m-2 flex flex-col gap-2 rounded-medium bg-content1 p-2">
          <p className="text-small font-bold text-warning">
            このページのURLからGroupやProjectを特定できません
          </p>
          <p className="text-tiny">
            GroupまたはProjectのページでポップアップを開くと、そのページのGroupやProjectの一覧を表示します。
          </p>
        </div>
      ) : groupError || projectsError ? (
        <div className="m-2 flex flex-col gap-2 rounded-medium bg-content1 p-2">
          <p className="text-small font-bold text-warning">
            このページでGroupやProjectの一覧を取得できません
          </p>
          <p className="text-tiny">
            このページのURLに対応していないか、権限がありません。プライベートなGroupやProjectを表示するには、アクセストークンを設定してください。
          </p>
          <Button
            size="sm"
            color="primary"
            onPress={() => {
              const token = prompt(
                `${url.origin} 用のアクセストークンを入力してください。read_apiスコープが必要です。`,
              );
              if (token === null) return;

              if (token !== "") onSetToken(token);
              else onDeleteToken();
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
      ) : (
        <></>
      )}
      <GroupProjectList
        starredGroups={starredGroups}
        starredProjects={starredProjects}
        currentGroup={!isGroupLoading ? group : "loading"}
        currentGroupProjects={!isProjectsLoading ? projects : "loading"}
        path={path}
        feature={feature}
        search={url.search}
      />
    </>
  );
};

const App: React.FC = () => {
  const url = useCurrentUrl();
  const storedData = useChromeStorage<{
    origins?: Record<string, { token?: string }>;
    groups?: Group[];
    projects?: Project[];
  }>("local", true);

  if (url === undefined || storedData === undefined) return;

  const { origins, groups, projects } = storedData;

  return (
    <Main
      url={url}
      options={origins?.[url.origin]}
      starredGroups={groups ?? []}
      starredProjects={projects ?? []}
      onEnable={() =>
        void chrome.storage.local.set({
          origins: { ...origins, [url.origin]: {} },
        })
      }
      onSetToken={(token) =>
        void chrome.storage.local.set({
          origins: { ...origins, [url.origin]: { token } },
        })
      }
      onDeleteToken={() =>
        void chrome.storage.local.set({
          origins: { ...origins, [url.origin]: {} },
        })
      }
    />
  );
};

export default App;
