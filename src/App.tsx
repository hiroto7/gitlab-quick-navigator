import {
  Avatar,
  Button,
  Link,
  Listbox,
  ListboxItem,
  ListboxSection,
  Progress,
  Skeleton,
} from "@nextui-org/react";
import React, { useCallback } from "react";
import "./App.css";
import { useChromeStorage, useClosestGroup, useCurrentUrl } from "./hooks";
import { StarIcon, StarredIcon } from "./icons";
import {
  GROUP_FEATURES,
  GROUP_FEATURE_NAMES,
  Group,
  PROJECT_FEATURES,
  PROJECT_FEATURE_NAMES,
  Project,
  getFeatureName,
  isProjectFeatureAvailable,
} from "./lib";

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

  const getListboxItem = useCallback(
    ({
      key,
      name,
      avatar,
      base,
      featurePath,
      featureName,
      starred,
      onStar,
    }: {
      key: string;
      name: string;
      avatar: string | null;
      base: string;
      featurePath: string | undefined;
      featureName: string | undefined;
      starred: boolean;
      onStar: (starred: boolean) => void;
    }) => {
      const href =
        featurePath !== undefined
          ? `${base}/-/${featurePath}${url.search}`
          : base;

      return (
        <ListboxItem
          key={key}
          href={href}
          onPress={() => void chrome.tabs.update({ url: href })}
          description={featureName}
          startContent={
            <Avatar
              isBordered
              radius="sm"
              size="sm"
              name={name}
              {...(avatar !== null ? { src: avatar } : {})}
              className="flex-shrink-0"
            />
          }
          data-starred={starred}
          endContent={
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="hidden group-data-[hover=true]:inline-flex group-data-[selected=true]:inline-flex group-data-[starred=true]:inline-flex"
              onPress={() => {
                onStar(!starred);
              }}
            >
              {starred ? <StarredIcon /> : <StarIcon />}
            </Button>
          }
        >
          {name}
        </ListboxItem>
      );
    },
    [url.search],
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

  const groupFeature: (typeof GROUP_FEATURES)[number] | undefined =
    feature !== undefined
      ? feature.startsWith("project_members")
        ? "group_members"
        : feature.startsWith("analytics/issues_analytics")
          ? "issues_analytics"
          : GROUP_FEATURES.findLast((groupFeature) =>
              feature.startsWith(groupFeature),
            )
      : undefined;

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
      <Listbox
        selectionMode="single"
        selectedKeys={[path]}
        disabledKeys={["skeleton"]}
        aria-label="Group and Projects"
      >
        <ListboxSection title="Group" showDivider>
          {[
            ...starredGroups.map((group) => ({ group, starred: true })),
            ...(group !== undefined
              ? starredGroups.find(
                  (starredGroup) => starredGroup.id === group.id,
                )
                ? []
                : [{ group, starred: false }]
              : [undefined]),
          ].map((item) => {
            if (item === undefined)
              return (
                <ListboxItem key="skeleton" textValue="Loading...">
                  <Skeleton className="h-8 w-full" />
                </ListboxItem>
              );

            const { group, starred } = item;

            return getListboxItem({
              key: group.full_path,
              base: group.web_url,
              name: group.name,
              avatar: group.avatar_url,
              featurePath: groupFeature,
              featureName:
                groupFeature !== undefined
                  ? getFeatureName(groupFeature, GROUP_FEATURE_NAMES)
                  : undefined,
              starred: starred,
              onStar: (starred) => {
                if (starred)
                  void chrome.storage.local.set({
                    groups: [...starredGroups, group],
                  });
                else
                  void chrome.storage.local.set({
                    groups: starredGroups.filter(
                      (starredGroup) => starredGroup.id !== group.id,
                    ),
                  });
              },
            });
          })}
        </ListboxSection>
        <ListboxSection title="Projects">
          {[
            ...starredProjects.map((project) => ({ project, starred: true })),
            ...(projects
              ?.filter(
                (project) =>
                  starredProjects.find(
                    (starredProject) => starredProject.id === project.id,
                  ) === undefined,
              )
              .map((project) => ({ project, starred: false })) ?? [undefined]),
          ].map((item) => {
            if (item === undefined)
              return (
                <ListboxItem key="skeleton" textValue="Loading...">
                  <Skeleton className="h-8 w-full" />
                </ListboxItem>
              );

            const { project, starred } = item;

            const projectFeature:
              | (typeof PROJECT_FEATURES)[number]
              | undefined =
              feature !== undefined
                ? feature.startsWith("group_members")
                  ? "project_members"
                  : feature.startsWith("issues_analytics")
                    ? "analytics/issues_analytics"
                    : PROJECT_FEATURES.findLast(
                        (projectFeature) =>
                          (feature.startsWith(projectFeature) &&
                            isProjectFeatureAvailable[projectFeature]?.(
                              project,
                            )) ??
                          true,
                      )
                : undefined;

            return getListboxItem({
              key: project.path_with_namespace,
              base: project.web_url,
              name: project.name,
              avatar: project.avatar_url,
              featurePath:
                projectFeature !== undefined &&
                ["tree", "network", "graphs"].includes(projectFeature)
                  ? `${projectFeature}/${project.default_branch}`
                  : projectFeature,
              featureName:
                projectFeature !== undefined
                  ? getFeatureName(projectFeature, PROJECT_FEATURE_NAMES)
                  : undefined,
              starred: starred,
              onStar: (starred) => {
                if (starred)
                  void chrome.storage.local.set({
                    projects: [...starredProjects, project],
                  });
                else
                  void chrome.storage.local.set({
                    projects: starredProjects.filter(
                      (starredProject) => starredProject.id !== project.id,
                    ),
                  });
              },
            });
          })}
        </ListboxSection>
      </Listbox>
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
