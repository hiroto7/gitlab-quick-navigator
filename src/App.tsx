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

const Alert1: React.FC<{ origin: string; onEnable: () => void }> = ({
  origin,
  onEnable,
}) => (
  <div className="flex flex-col gap-2 rounded-medium border-small border-divider bg-content2 p-2">
    <p className="text-small font-bold">
      このサイトでGitLab Quick Navigatorを有効にしますか？
    </p>
    <p className="text-tiny">
      有効にすると、このサイト ({origin}) でGroupやProjectの一覧を表示します。
    </p>
    <p className="text-tiny">
      ポップアップを開くたびに /api/v4
      以下のエンドポイントへリクエストが発生するため、GitLab以外のサイトでは有効にしないでください。
    </p>
    <Button size="sm" color="primary" className="grow" onPress={onEnable}>
      有効にする
    </Button>
  </div>
);

const Alert2: React.FC = () => (
  <div className="flex flex-col gap-2 rounded-medium border-small border-divider bg-content2 p-2">
    <p className="text-small font-bold text-warning">
      このページのURLからGroupやProjectを特定できません
    </p>
    <p className="text-tiny">
      GroupまたはProjectのページでポップアップを開くと、そのページのGroupやProjectの一覧を表示します。
    </p>
  </div>
);

const Alert3: React.FC<{
  origin: string;
  onSetToken: (token: string) => void;
  onDeleteToken: () => void;
}> = ({ origin, onSetToken, onDeleteToken }) => (
  <div className="flex flex-col gap-2 rounded-medium border-small border-divider bg-content2 p-2">
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
          `${origin} 用のアクセストークンを入力してください。read_apiスコープが必要です。`,
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
        href={`${origin}/-/user_settings/personal_access_tokens?name=GitLab+Quick+Navigator&scopes=read_api`}
      >
        アクセストークンを発行
      </Link>
    </p>
  </div>
);

const Main: React.FC<{
  options: { token?: string } | undefined;
  url: URL;
  starredGroups: readonly Group[];
  starredProjects: readonly Project[];
  onEnable: () => void;
  onSetToken: (token: string) => void;
  onDeleteToken: () => void;
  onStarredGroupsUpdate: (groups: readonly Group[]) => void;
  onStarredProjectsUpdate: (projects: readonly Project[]) => void;
}> = ({
  options,
  url,
  starredGroups,
  starredProjects,
  onEnable,
  onSetToken,
  onDeleteToken,
  onStarredGroupsUpdate,
  onStarredProjectsUpdate,
}) => {
  const { path, feature } = parsePathname(url.pathname);

  const {
    data: group,
    error: groupError,
    isValidating: isGroupValidating,
    isLoading: isGroupLoading,
  } = useClosestGroup<Group>(
    groupDetailEndpoint,
    options && url.origin,
    path,
    options?.token,
    (loadedGroup) =>
      onStarredGroupsUpdate(
        starredGroups.map((starredGroup) =>
          starredGroup.id === loadedGroup.id ? loadedGroup : starredGroup,
        ),
      ),
  );
  const {
    data: projects,
    error: projectsError,
    isValidating: isProjectsValidating,
    isLoading: isProjectsLoading,
  } = useClosestGroup<readonly Project[]>(
    groupProjectsEndpoint,
    options && url.origin,
    path,
    options?.token,
    (loadedProjects) =>
      onStarredProjectsUpdate(
        starredProjects.map(
          (starredProject) =>
            loadedProjects.find(
              (loadedProject) => starredProject.id === loadedProject.id,
            ) ?? starredProject,
        ),
      ),
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
        <div className="m-2">
          <Alert1 origin={url.origin} onEnable={onEnable} />
        </div>
      ) : path === undefined ? (
        <div className="m-2">
          <Alert2 />
        </div>
      ) : groupError || projectsError ? (
        <div className="m-2">
          <Alert3
            origin={url.origin}
            onSetToken={onSetToken}
            onDeleteToken={onDeleteToken}
          />
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
        onStarredGroupsUpdate={onStarredGroupsUpdate}
        onStarredProjectsUpdate={onStarredProjectsUpdate}
      />
    </>
  );
};

const App: React.FC = () => {
  const url = useCurrentUrl();
  const { items: storedData, set } = useChromeStorage<{
    origins?: Record<string, { token?: string }>;
    groups?: readonly Group[];
    projects?: readonly Project[];
  }>("local", true);

  if (url === undefined || storedData === undefined) return;

  const { origins, groups, projects } = storedData;

  return (
    <Main
      url={url}
      options={origins?.[url.origin]}
      starredGroups={groups ?? []}
      starredProjects={projects ?? []}
      onEnable={() => void set({ origins: { ...origins, [url.origin]: {} } })}
      onSetToken={(token) =>
        void set({ origins: { ...origins, [url.origin]: { token } } })
      }
      onDeleteToken={() =>
        void set({ origins: { ...origins, [url.origin]: {} } })
      }
      onStarredGroupsUpdate={(groups) => void set({ groups })}
      onStarredProjectsUpdate={(projects) => void set({ projects })}
    />
  );
};

export default App;
