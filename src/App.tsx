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
  url: URL;
  token: string | undefined;
  path: string;
  feature: string | undefined;
  starredGroups: Group[];
  starredProjects: Project[];
  onSetToken: (token: string) => void;
  onDeleteToken: () => void;
}> = ({
  url,
  token,
  path,
  feature,
  starredGroups,
  starredProjects,
  onSetToken,
  onDeleteToken,
}) => {
  const {
    data: group,
    error: groupError,
    isValidating: isGroupValidating,
  } = useClosestGroup<Group>(groupDetailEndpoint, url.origin, path, token);
  const {
    data: projects,
    error: projectsError,
    isValidating: isProjectsValidating,
  } = useClosestGroup<Project[]>(
    groupProjectsEndpoint,
    url.origin,
    path,
    token,
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
      <GroupProjectList
        starredGroups={starredGroups}
        starredProjects={starredProjects}
        currentGroup={group}
        currentGroupProjects={projects}
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

  const siteOptions = origins?.[url.origin];
  if (siteOptions === undefined)
    return (
      <div className="flex flex-col gap-2 p-2 text-small">
        <p>
          <strong>
            このサイト ({url.origin}) でGitLab Quick Navigatorを有効にしますか？
          </strong>
        </p>
        <p>
          有効にすると、このサイトでポップアップを開くたびに /api/v4
          以下のエンドポイントへリクエストが発生します。GitLab以外のサイトでは使用しないでください。
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="grow"
            onPress={() => {
              close();
            }}
          >
            キャンセル
          </Button>
          <Button
            size="sm"
            color="primary"
            className="grow"
            onPress={() =>
              void chrome.storage.local.set({
                origins: { ...origins, [url.origin]: {} },
              })
            }
          >
            有効にする
          </Button>
        </div>
      </div>
    );

  const { path, feature } = parsePathname(url.pathname);
  if (path === undefined)
    return (
      <div className="flex flex-col gap-2 p-2 text-small">
        <p>
          <strong className="text-danger">
            このページのURLからGroupまたはProjectを特定できません。
          </strong>
        </p>
        <p>
          GitLab上のGroupまたはProjectのページでポップアップを開いてください。
        </p>
      </div>
    );

  return (
    <Main
      url={url}
      token={siteOptions.token}
      path={path}
      feature={feature}
      starredGroups={groups ?? []}
      starredProjects={projects ?? []}
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
