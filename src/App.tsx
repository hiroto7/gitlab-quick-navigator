import { Button, Link, Progress } from "@heroui/react";
import React from "react";
import "./App.css";
import CustomAlert from "./CustomAlert";
import GroupProjectList from "./GroupProjectList";
import {
  getParent,
  useChromeStorage,
  useCurrentUrl,
  useGroup,
  useGroupProjects,
  useProject,
} from "./hooks";
import { Group, parsePathname, Project } from "./lib";

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
  const parent = path !== undefined ? getParent(path) : undefined;

  const {
    data: group,
    error: groupError,
    isValidating: isGroupValidating,
    isLoading: isGroupLoading,
  } = useGroup(options && url.origin, path, options?.token);

  const {
    data: parentGroup,
    error: parentGroupError,
    isValidating: isParentGroupValidating,
    isLoading: isParentGroupLoading,
  } = useGroup(options && url.origin, parent, options?.token);

  const {
    data: groupProjects,
    error: groupProjectsError,
    isValidating: isGroupProjectsValidating,
    isLoading: isGroupProjectsLoading,
  } = useGroupProjects(options && url.origin, path, options?.token);

  const {
    data: parentGroupProjects,
    error: parentGroupProjectsError,
    isValidating: isParentGroupProjectsValidating,
    isLoading: isParentGroupProjectsLoading,
  } = useGroupProjects(options && url.origin, parent, options?.token);

  const {
    data: project,
    error: projectError,
    isValidating: isProjectValidating,
    isLoading: isProjectLoading,
  } = useProject(options && url.origin, path, options?.token);

  return (
    <>
      <Progress
        size="sm"
        color="default"
        radius="none"
        isIndeterminate
        className={
          !isGroupValidating &&
          !isParentGroupLoading &&
          !isGroupProjectsLoading &&
          !isParentGroupProjectsLoading &&
          !isProjectLoading
            ? "invisible"
            : undefined
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
      ) : (groupError && parentGroupError) ||
        (groupProjectsError && parentGroupProjectsError) ? (
        <div className="m-2">
          <Alert3
            origin={url.origin}
            onSetToken={onSetToken}
            onDeleteToken={onDeleteToken}
          />
        </div>
      ) : url.search !== "" ? (
        <div className="m-2">
          <Alert4 />
        </div>
      ) : (
        <></>
      )}
      <GroupProjectList
        starredGroups={starredGroups}
        starredProjects={starredProjects}
        currentGroup={!isGroupLoading ? group : "loading"}
        currentParentGroup={!isParentGroupLoading ? parentGroup : "loading"}
        currentGroupProjects={
          !isGroupProjectsLoading ? groupProjects : "loading"
        }
        currentProject={!isProjectLoading ? project : "loading"}
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
