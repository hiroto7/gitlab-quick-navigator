import { Button, Link, Progress } from "@heroui/react";
import React from "react";
import "./App.css";
import CustomAlert, { CustomAlertFooter } from "./CustomAlert";
import GroupProjectList from "./GroupProjectList";
import { useChromeStorage, useClosestGroup, useCurrentUrl } from "./hooks";
import { Group, parsePathname, Project } from "./lib";

const groupDetailEndpoint = (path: string) =>
  `/api/v4/groups/${encodeURIComponent(path)}?with_projects=false`;

const groupProjectsEndpoint = (path: string) =>
  `/api/v4/groups/${encodeURIComponent(path)}/projects?order_by=last_activity_at`;

const Alert1: React.FC<{ host: string; onEnable: () => void }> = ({
  host,
  onEnable,
}) => (
  <CustomAlert
    color="primary"
    title="このサイトでGitLab Quick Navigatorを有効にしますか？"
    description={`${host} でポップアップを開くたび、 /api/v4 以下のエンドポイントからGroupやProjectの一覧を取得するようになります。GitLab以外のサイトでは有効にしないでください。`}
    endContent={
      <CustomAlertFooter>
        <Button size="sm" color="primary" onPress={onEnable}>
          有効にする
        </Button>
      </CustomAlertFooter>
    }
  />
);

const Alert2: React.FC = () => (
  <CustomAlert
    color="warning"
    title="このページのURLからGroupやProjectを特定できません"
    description="GroupまたはProjectのページでポップアップを開くと、そのページのGroupやProjectの一覧を表示します。"
  />
);

const Alert3: React.FC<{
  origin: string;
  onSetToken: (token: string) => void;
  onDeleteToken: () => void;
}> = ({ origin, onSetToken, onDeleteToken }) => (
  <CustomAlert
    color="warning"
    title="このページでGroupやProjectの一覧を取得できません"
    description="このページのURLに対応していないか、権限がありません。プライベートなGroupやProjectを表示するには、アクセストークンを設定してください。"
    endContent={
      <CustomAlertFooter>
        <Button
          as={Link}
          size="sm"
          color="warning"
          variant="flat"
          showAnchorIcon
          isExternal
          href={`${origin}/-/user_settings/personal_access_tokens?name=GitLab+Quick+Navigator&scopes=read_api`}
        >
          トークンを発行
        </Button>
        <Button
          size="sm"
          color="warning"
          onPress={() => {
            const token = prompt(
              `${origin} 用のアクセストークンを入力してください。read_apiスコープが必要です。`,
            );
            if (token === null) return;

            if (token !== "") onSetToken(token);
            else onDeleteToken();
          }}
        >
          トークンを設定
        </Button>
      </CustomAlertFooter>
    }
  />
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
          <Alert1 host={url.host} onEnable={onEnable} />
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
