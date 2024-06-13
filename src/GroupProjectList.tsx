import {
  Avatar,
  Button,
  Listbox,
  ListboxItem,
  ListboxSection,
  Skeleton,
} from "@nextui-org/react";
import React, { useCallback, useState } from "react";
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
  move,
} from "./lib";

const GroupProjectList: React.FC<{
  path: string;
  feature: string | undefined;
  search: string;
  starredGroups: Group[];
  starredProjects: Project[];
  currentGroup: Group | undefined;
  currentGroupProjects: Project[] | undefined;
}> = ({
  path,
  feature,
  search,
  starredGroups,
  starredProjects,
  currentGroup: group,
  currentGroupProjects: projects,
}) => {
  const [draggedGroup, setDraggedGroup] = useState<Group>();
  const [draggedProject, setDraggedProject] = useState<Project>();
  const [nextStarredGroups, setNextStarredGroups] = useState<Group[]>();
  const [nextStarredProjects, setNextStarredProjects] = useState<Project[]>();

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
      onDragStart,
      onDragEnd,
      onDragEnter,
      onDrop,
    }: {
      key: string;
      name: string;
      avatar: string | null;
      base: string;
      featurePath: string | undefined;
      featureName: string | undefined;
      starred: boolean;
      onStar: (starred: boolean) => void;
      onDragStart: () => void;
      onDragEnd: () => void;
      onDragEnter: (() => void) | undefined;
      onDrop: () => void;
    }) => {
      const href =
        featurePath !== undefined ? `${base}/-/${featurePath}${search}` : base;

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
          draggable={starred}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragEnter={onDragEnter}
          onDrop={onDrop}
        >
          {name}
        </ListboxItem>
      );
    },
    [search],
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

  const allKeys = [
    ...[...starredGroups, ...(group !== undefined ? [group] : [])].map(
      (group) => group.full_path,
    ),
    ...[...starredProjects, ...(projects ?? [])].map(
      (project) => project.path_with_namespace,
    ),
  ];

  return (
    <Listbox
      selectionMode="single"
      selectedKeys={[path]}
      disabledKeys={[
        "skeleton",
        ...(nextStarredGroups !== undefined
          ? allKeys.filter(
              (key) =>
                nextStarredGroups.find((group) => group.full_path === key) ===
                undefined,
            )
          : []),
        ...(nextStarredProjects !== undefined
          ? allKeys.filter(
              (key) =>
                nextStarredProjects.find(
                  (project) => project.path_with_namespace === key,
                ) === undefined,
            )
          : []),
      ]}
      aria-label="Group and Projects"
    >
      <ListboxSection title="Group" showDivider>
        {[
          ...(nextStarredGroups ?? starredGroups).map((group, index) => ({
            group,
            starred: true,
            onDragEnter: () => {
              const draggedIndex = nextStarredGroups!.indexOf(draggedGroup!);
              setNextStarredGroups(
                move(nextStarredGroups!, draggedIndex, index),
              );
            },
          })),
          ...(group !== undefined
            ? starredGroups.find((starredGroup) => starredGroup.id === group.id)
              ? []
              : [{ group, starred: false, onDragEnter: undefined }]
            : [undefined]),
        ].map((item) => {
          if (item === undefined)
            return (
              <ListboxItem key="skeleton" textValue="Loading...">
                <Skeleton className="h-8 w-full" />
              </ListboxItem>
            );

          const { group, starred, onDragEnter } = item;

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
            onDragStart: () => {
              setDraggedGroup(group);
              setNextStarredGroups([...starredGroups]);
            },
            onDragEnd: () => {
              setDraggedGroup(undefined);
              setNextStarredGroups(undefined);
            },
            onDragEnter,
            onDrop: () =>
              void chrome.storage.local.set({ groups: nextStarredGroups }),
          });
        })}
      </ListboxSection>
      <ListboxSection title="Projects">
        {[
          ...(nextStarredProjects ?? starredProjects).map((project, index) => ({
            project,
            starred: true,
            onDragEnter: () => {
              const draggedIndex = nextStarredProjects!.indexOf(
                draggedProject!,
              );
              setNextStarredProjects(
                move(nextStarredProjects!, draggedIndex, index),
              );
            },
          })),
          ...(projects
            ?.filter(
              (project) =>
                starredProjects.find(
                  (starredProject) => starredProject.id === project.id,
                ) === undefined,
            )
            .map((project) => ({
              project,
              starred: false,
              onDragEnter: undefined,
            })) ?? [undefined]),
        ].map((item) => {
          if (item === undefined)
            return (
              <ListboxItem key="skeleton" textValue="Loading...">
                <Skeleton className="h-8 w-full" />
              </ListboxItem>
            );

          const { project, starred, onDragEnter } = item;

          const projectFeature: (typeof PROJECT_FEATURES)[number] | undefined =
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
            onDragStart: () => {
              setDraggedProject(project);
              setNextStarredProjects([...starredProjects]);
            },
            onDragEnd: () => {
              setDraggedProject(undefined);
              setNextStarredProjects(undefined);
            },
            onDragEnter,
            onDrop: () =>
              void chrome.storage.local.set({ projects: nextStarredProjects }),
          });
        })}
      </ListboxSection>
    </Listbox>
  );
};

export default GroupProjectList;
