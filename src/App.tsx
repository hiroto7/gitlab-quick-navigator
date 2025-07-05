import { Button, Link, Progress, Spinner, Tab, Tabs } from "@heroui/react";
import React, { useState } from "react";
import "./App.css";
import CustomAlert from "./CustomAlert";
import FeatureList, { SkeletonFeatureList } from "./FeatureList";
import GroupProjectList from "./GroupProjectList";
import {
  useChromeStorage,
  useClosestGroup,
  useCurrentUrl,
  useLoadingUrl,
} from "./hooks";
import { findFeatures, Group, parsePathname, Project, StoredData } from "./lib";

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
    description={
      <>
        有効にすると、今後 <span className="break-all">{host}/api/v4</span>{" "}
        以下からグループやプロジェクトの一覧を取得するようになります。GitLab以外のサイトでは有効にしないでください。
      </>
    }
    endContent={
      <Button size="sm" color="primary" onPress={onEnable}>
        有効にする
      </Button>
    }
  />
);

const Alert2: React.FC = () => (
  <CustomAlert
    color="warning"
    title="このページのURLからグループやプロジェクトを特定できません"
  />
);

const Alert3: React.FC<{
  origin: string;
  onSetToken: (token: string) => void;
  onDeleteToken: () => void;
}> = ({ origin, onSetToken, onDeleteToken }) => (
  <CustomAlert
    color="warning"
    title="このページでグループやプロジェクトの一覧を取得できません"
    description="このページのURLに対応していないか権限がありません。プライベートな項目を表示するには、アクセストークンを設定してください。"
    endContent={
      <>
        <Button
          as={Link}
          size="sm"
          color="warning"
          variant="flat"
          showAnchorIcon
          isExternal
          href={`${origin}/-/user_settings/personal_access_tokens?name=GitLab+Quick+Navigator&scopes=read_api`}
        >
          GitLabでトークンを発行
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
      </>
    }
  />
);

const Alert4: React.FC = () => (
  <CustomAlert color="primary" title="現在のURLのパラメーターを引き継ぎます" />
);

const TabTitle: React.FC<{ children: string; isLoading: boolean }> = ({
  children,
  isLoading: loading,
}) => (
  <div className="flex items-center gap-2">
    <span>{children}</span>
    {loading && <Spinner size="sm" variant="gradient" />}
  </div>
);

const parseLoadingPathname = ({
  loadingPathname,
  currentPath,
  currentGroupFeature,
  currentProjectFeature,
}: {
  loadingPathname: string;
  currentPath: string | undefined;
  currentGroupFeature: string | undefined;
  currentProjectFeature: string | undefined;
}) => {
  const { path, feature } = parsePathname(loadingPathname);

  const { group: groupFeature, project: projectFeature } =
    feature !== undefined ? findFeatures(feature) : {};

  const loadingPath = path !== currentPath ? path : undefined;
  const loadingGroupFeature =
    groupFeature !== currentGroupFeature ? groupFeature : undefined;
  const loadingProjectFeature =
    projectFeature !== currentProjectFeature ? projectFeature : undefined;

  return { loadingPath, loadingGroupFeature, loadingProjectFeature };
};

const Main: React.FC<{
  origins: Record<string, { token?: string }>;
  url: URL;
  starredGroups: readonly Group[];
  starredProjects: readonly Project[];
  autoTabSwitch: boolean;
  onEnable: (origin: string) => void;
  onSetToken: (origin: string, token: string) => void;
  onDeleteToken: (origin: string) => void;
  onStarredGroupsUpdate: (groups: readonly Group[]) => void;
  onStarredProjectsUpdate: (projects: readonly Project[]) => void;
}> = ({
  origins,
  url: currentUrl,
  starredGroups,
  starredProjects,
  autoTabSwitch,
  onEnable,
  onSetToken,
  onDeleteToken,
  onStarredGroupsUpdate,
  onStarredProjectsUpdate,
}) => {
  const { path: currentPath, feature: currentFeature } = parsePathname(
    currentUrl.pathname,
  );

  const { loadingUrl, navigate } = useLoadingUrl(currentUrl);
  const url = loadingUrl ?? currentUrl;

  const options = origins[url.origin];

  const { group: currentGroupFeature, project: currentProjectFeature } =
    currentFeature !== undefined ? findFeatures(currentFeature) : {};

  const { loadingPath, loadingGroupFeature, loadingProjectFeature } =
    loadingUrl !== undefined
      ? parseLoadingPathname({
          loadingPathname: loadingUrl.pathname,
          currentPath,
          currentGroupFeature,
          currentProjectFeature,
        })
      : {};

  const path = loadingPath ?? currentPath;
  const groupFeature = loadingGroupFeature ?? currentGroupFeature;
  const projectFeature = loadingProjectFeature ?? currentProjectFeature;

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

  const groupOrProject =
    [...starredProjects, ...(projects ?? [])]
      .map((project) => ({ item: project, type: "project" }) as const)
      .find(({ item }) => item.path_with_namespace === path) ??
    [...starredGroups, ...(group !== undefined ? [group] : [])]
      .map((group) => ({ item: group, type: "group" }) as const)
      .find(({ item }) => item.full_path === path);

  const [selectedTab, setTab] = useState<"groups-and-projects" | "features">(
    "groups-and-projects",
  );
  const isFeatureTabEnabled =
    groupOrProject !== undefined || isGroupLoading || isProjectsLoading;
  const tab = isFeatureTabEnabled ? selectedTab : "groups-and-projects";

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
          <Alert1 host={url.host} onEnable={() => onEnable(url.origin)} />
        </div>
      ) : path === undefined ? (
        <div className="m-2">
          <Alert2 />
        </div>
      ) : groupError || projectsError ? (
        <div className="m-2">
          <Alert3
            origin={url.origin}
            onSetToken={(token) => onSetToken(url.origin, token)}
            onDeleteToken={() => onDeleteToken(url.origin)}
          />
        </div>
      ) : url.search !== "" ? (
        <div className="m-2">
          <Alert4 />
        </div>
      ) : (
        <></>
      )}

      <Tabs
        fullWidth
        classNames={{ base: "p-2" }}
        selectedKey={tab}
        onSelectionChange={(key) =>
          setTab(key as "groups-and-projects" | "features")
        }
        disabledKeys={!isFeatureTabEnabled ? ["features"] : []}
      >
        <Tab
          title={
            <TabTitle isLoading={loadingPath !== undefined}>
              Groups & Projects
            </TabTitle>
          }
          key="groups-and-projects"
        >
          <GroupProjectList
            starredGroups={starredGroups}
            starredProjects={starredProjects}
            currentGroup={!isGroupLoading ? group : "loading"}
            currentGroupProjects={!isProjectsLoading ? projects : "loading"}
            path={currentPath}
            groupFeature={groupFeature}
            projectFeature={projectFeature}
            search={url.search}
            loadingPath={loadingPath}
            onNavigate={(url) => {
              navigate(url);
              if (autoTabSwitch) setTab("features");
            }}
            onStarredGroupsUpdate={onStarredGroupsUpdate}
            onStarredProjectsUpdate={onStarredProjectsUpdate}
          />
        </Tab>
        <Tab
          title={
            <TabTitle
              isLoading={
                loadingGroupFeature !== undefined ||
                loadingProjectFeature !== undefined
              }
            >
              Features
            </TabTitle>
          }
          key="features"
        >
          {groupOrProject !== undefined ? (
            <FeatureList
              groupOrProject={groupOrProject}
              currentGroupFeature={currentGroupFeature}
              currentProjectFeature={currentProjectFeature}
              loadingGroupFeature={loadingGroupFeature}
              loadingProjectFeature={loadingProjectFeature}
              search={url.search}
              onNavigate={(url) => {
                navigate(url);
                if (autoTabSwitch) setTab("groups-and-projects");
              }}
            />
          ) : (
            <SkeletonFeatureList />
          )}
        </Tab>
      </Tabs>
    </>
  );
};

const App: React.FC = () => {
  const url = useCurrentUrl();
  const { items: storedData, set } = useChromeStorage<StoredData>(
    "local",
    true,
  );

  if (url === undefined || storedData === undefined) return;

  const {
    origins = {},
    groups = [],
    projects = [],
    autoTabSwitch = false,
  } = storedData;

  return (
    <Main
      url={url}
      origins={origins}
      starredGroups={groups}
      starredProjects={projects}
      autoTabSwitch={autoTabSwitch}
      onEnable={(origin) => void set({ origins: { ...origins, [origin]: {} } })}
      onSetToken={(origin, token) =>
        void set({ origins: { ...origins, [origin]: { token } } })
      }
      onDeleteToken={(origin) =>
        void set({ origins: { ...origins, [origin]: {} } })
      }
      onStarredGroupsUpdate={(groups) => void set({ groups })}
      onStarredProjectsUpdate={(projects) => void set({ projects })}
    />
  );
};

export default App;
