import {
  Button,
  Link,
  ProgressBar,
  Spinner,
  Tabs,
  type Key,
} from "@heroui/react";
import React, { useState } from "react";
import "./App.css";
import { useChromeLocalStorage } from "./contexts/ChromeStorageContext";
import CustomAlert from "./CustomAlert";
import FeatureList, { SkeletonFeatureList } from "./FeatureList";
import GroupProjectList from "./GroupProjectList";
import { useClosestGroup, useCurrentUrl, useLoadingUrl } from "./hooks";
import { findFeatures, Group, parsePathname, Project } from "./lib";

const groupDetailEndpoint = (path: string) =>
  `/api/v4/groups/${encodeURIComponent(path)}?with_projects=false`;

const groupProjectsEndpoint = (path: string) =>
  `/api/v4/groups/${encodeURIComponent(path)}/projects?order_by=last_activity_at`;

const Alert1: React.FC<{
  host: string;
  isCollapsible: boolean;
  onEnable: () => void;
}> = ({ host, isCollapsible, onEnable }) => (
  <CustomAlert
    color="primary"
    title="このサイトでGitLab Quick Navigatorを有効にしますか？"
    isCollapsible={isCollapsible}
    description={
      <>
        有効にすると、今後 <span className="break-all">{host}/api/v4</span>{" "}
        以下からグループやプロジェクトの一覧を取得するようになります。GitLab以外のサイトでは有効にしないでください。
      </>
    }
    endContent={
      <Button size="sm" variant="primary" onPress={onEnable}>
        有効にする
      </Button>
    }
  />
);

const Alert2: React.FC = () => (
  <CustomAlert
    color="warning"
    title="このページのURLからグループやプロジェクトを特定できません"
    isCollapsible={false}
  />
);

const Alert3: React.FC<{
  origin: string;
  isCollapsible: boolean;
  onSetToken: (token: string) => void;
  onDeleteToken: () => void;
}> = ({ origin, isCollapsible, onSetToken, onDeleteToken }) => (
  <CustomAlert
    color="warning"
    title="このページでグループやプロジェクトの一覧を取得できません"
    description="このページのURLに対応していないか権限がありません。プライベートな項目を表示するには、アクセストークンを設定してください。"
    isCollapsible={isCollapsible}
    endContent={
      <>
        <Link
          href={`${origin}/-/user_settings/personal_access_tokens?name=GitLab+Quick+Navigator&scopes=read_api`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md px-3 py-1.5 text-sm"
        >
          GitLabでトークンを発行
          <Link.Icon />
        </Link>
        <Button
          size="sm"
          variant="secondary"
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
  <CustomAlert
    color="primary"
    title="現在のURLのパラメーターを引き継ぎます"
    isCollapsible={false}
  />
);

const TabTitle: React.FC<{ children: string; isLoading: boolean }> = ({
  children,
  isLoading: loading,
}) => (
  <div className="flex items-center gap-2">
    <span>{children}</span>
    {loading && <Spinner color="current" size="sm" />}
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

const App: React.FC = () => {
  const currentUrl = useCurrentUrl();
  const {
    items: {
      origins = {},
      groups: starredGroups = [],
      projects: starredProjects = [],
      autoTabSwitch = false,
      selectedTab: storedSelectedTab = "groups-and-projects",
    },
    set,
  } = useChromeLocalStorage();

  const { path: currentPath, feature: currentFeature } = parsePathname(
    currentUrl.pathname,
  );

  const { loadingUrl, navigate } = useLoadingUrl();
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
      void set({
        groups: starredGroups.map((starredGroup) =>
          starredGroup.id === loadedGroup.id ? loadedGroup : starredGroup,
        ),
      }),
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
      void set({
        projects: starredProjects.map(
          (starredProject) =>
            loadedProjects.find(
              (loadedProject) => starredProject.id === loadedProject.id,
            ) ?? starredProject,
        ),
      }),
  );

  const groupOrProject =
    [...starredProjects, ...(projects ?? [])]
      .map((project) => ({ item: project, type: "project" }) as const)
      .find(({ item }) => item.path_with_namespace === path) ??
    [...starredGroups, ...(group !== undefined ? [group] : [])]
      .map((group) => ({ item: group, type: "group" }) as const)
      .find(({ item }) => item.full_path === path);

  const shouldShowContent =
    projects !== undefined ||
    group !== undefined ||
    isProjectsLoading ||
    isGroupLoading ||
    starredGroups.length > 0 ||
    starredProjects.length > 0;

  const [selectedTab, setTab] = useState<"groups-and-projects" | "features">(
    storedSelectedTab,
  );

  const isFeatureTabEnabled =
    groupOrProject !== undefined || isGroupLoading || isProjectsLoading;
  const tab = isFeatureTabEnabled ? selectedTab : "groups-and-projects";

  return (
    <>
      <ProgressBar
        size="sm"
        color="default"
        isIndeterminate
        {...(!isGroupValidating && !isProjectsValidating
          ? { className: "invisible" }
          : {})}
        aria-label="Loading..."
      >
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      {options === undefined ? (
        <div className="m-2">
          <Alert1
            host={url.host}
            isCollapsible={shouldShowContent}
            onEnable={() =>
              void set({ origins: { ...origins, [url.origin]: {} } })
            }
          />
        </div>
      ) : path === undefined ? (
        <div className="m-2">
          <Alert2 />
        </div>
      ) : groupError || projectsError ? (
        <div className="m-2">
          <Alert3
            origin={url.origin}
            isCollapsible={shouldShowContent}
            onSetToken={(token) =>
              void set({ origins: { ...origins, [url.origin]: { token } } })
            }
            onDeleteToken={() =>
              void set({ origins: { ...origins, [url.origin]: {} } })
            }
          />
        </div>
      ) : url.search !== "" ? (
        <div className="m-2">
          <Alert4 />
        </div>
      ) : (
        <></>
      )}

      {shouldShowContent && (
        <Tabs
          className="p-2"
          selectedKey={tab}
          onSelectionChange={(key: Key) => {
            const selectedTab = String(key) as
              | "groups-and-projects"
              | "features";
            setTab(selectedTab);
            void set({ selectedTab });
          }}
          disabledKeys={!isFeatureTabEnabled ? ["features"] : []}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Navigation sections">
              <Tabs.Tab id="groups-and-projects">
                <TabTitle isLoading={loadingPath !== undefined}>
                  Groups & Projects
                </TabTitle>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="features">
                <TabTitle
                  isLoading={
                    loadingGroupFeature !== undefined ||
                    loadingProjectFeature !== undefined
                  }
                >
                  Features
                </TabTitle>
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel id="groups-and-projects" className="p-0">
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
                if (autoTabSwitch) {
                  setTab("features");
                  scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              onStarredGroupsUpdate={(groups) => void set({ groups })}
              onStarredProjectsUpdate={(projects) => void set({ projects })}
            />
          </Tabs.Panel>
          <Tabs.Panel id="features" className="p-0">
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
                  if (autoTabSwitch) {
                    setTab("groups-and-projects");
                    scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              />
            ) : (
              <SkeletonFeatureList />
            )}
          </Tabs.Panel>
        </Tabs>
      )}
    </>
  );
};

export default App;
