import {
  Avatar,
  Button,
  Listbox,
  ListboxItem,
  ListboxSection,
  Skeleton,
} from "@heroui/react";
import React, { useCallback, useState } from "react";
import { Spinner } from "@heroui/react";
import { useDrag } from "./hooks";
import { StarIcon, StarredIcon } from "./icons";
import {
  GROUP_FEATURE_NAMES,
  Group,
  GroupFeature,
  PROJECT_FEATURE_NAMES,
  Project,
  ProjectFeature,
  findGroupFeature,
  findProjectFeature,
  getFeatureName,
} from "./lib";

const GroupProjectList: React.FC<{
  path: string | undefined;
  feature: string | undefined;
  search: string;
  starredGroups: readonly Group[];
  starredProjects: readonly Project[];
  currentGroup: Group | "loading" | undefined;
  currentGroupProjects: readonly Project[] | "loading" | undefined;
  onStarredGroupsUpdate: (groups: readonly Group[]) => void;
  onStarredProjectsUpdate: (projects: readonly Project[]) => void;
}> = ({
  path,
  feature,
  search,
  starredGroups: currentStarredGroups,
  starredProjects: currentStarredProjects,
  currentGroup: group,
  currentGroupProjects: projects,
  onStarredGroupsUpdate,
  onStarredProjectsUpdate,
}) => {
  const {
    list: starredGroups,
    dragging: isDraggingGroup,
    onDragStart: onGroupDragStart,
    onDragEnter: onGroupDragEnter,
    onDragEnd: onGroupDragEnd,
  } = useDrag(currentStarredGroups);
  const {
    list: starredProjects,
    dragging: isDraggingProject,
    onDragStart: onProjectDragStart,
    onDragEnter: onProjectDragEnter,
    onDragEnd: onProjectDragEnd,
  } = useDrag(currentStarredProjects);

  const [pressedKey, setPressedKey] = useState<string>();

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
          onPress={() => {
            setPressedKey(key);
            void chrome.tabs.update({ url: href });
          }}
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
          data-loading={pressedKey === key && pressedKey !== path}
          endContent={
            <>
              <Spinner
                size="sm"
                variant="gradient"
                className="group-data-[loading=false]:hidden"
              />
              <Button
                isIconOnly
                variant="light"
                size="sm"
                color={starred ? "success" : undefined}
                className="hidden group-data-[hover=true]:inline-flex group-data-[loading=true]:inline-flex group-data-[selected=true]:inline-flex group-data-[starred=true]:inline-flex"
                onPress={() => {
                  onStar(!starred);
                }}
              >
                {starred ? <StarredIcon /> : <StarIcon />}
              </Button>
            </>
          }
          draggable={starred}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragEnter={onDragEnter}
          onDrop={onDrop}
          classNames={{
            title: "truncate",
            wrapper: "items-stretch overflow-x-hidden",
          }}
        >
          {name}
        </ListboxItem>
      );
    },
    [search, pressedKey, path],
  );

  const groupFeature: GroupFeature | undefined =
    feature !== undefined ? findGroupFeature(feature) : undefined;

  const allKeys = [
    ...[...starredGroups, ...(typeof group === "object" ? [group] : [])].map(
      (group) => group.full_path,
    ),
    ...[
      ...starredProjects,
      ...(typeof projects === "object" ? projects : []),
    ].map((project) => project.path_with_namespace),
  ];

  const groupItems = [
    ...starredGroups.map((group, index) => ({
      group,
      starred: true,
      onDragEnter: () => {
        onGroupDragEnter(index);
      },
    })),
    ...(typeof group === "object"
      ? starredGroups.find((starredGroup) => starredGroup.id === group.id)
        ? []
        : [{ group, starred: false, onDragEnter: undefined }]
      : group === "loading"
        ? [group]
        : []),
  ];

  const projectItems = [
    ...starredProjects.map((project, index) => ({
      project,
      starred: true,
      onDragEnter: () => {
        onProjectDragEnter(index);
      },
    })),
    ...(typeof projects === "object"
      ? projects
          .filter(
            (project) =>
              starredProjects.find(
                (starredProject) => starredProject.id === project.id,
              ) === undefined,
          )
          .map((project) => ({
            project,
            starred: false,
            onDragEnter: undefined,
          }))
      : projects === "loading"
        ? [projects]
        : []),
  ];

  if (groupItems.length === 0 && projectItems.length === 0) return undefined;

  return (
    <Listbox
      selectionMode="single"
      selectedKeys={path !== undefined ? [path] : []}
      disabledKeys={[
        "skeleton",
        ...(isDraggingGroup
          ? allKeys.filter(
              (key) =>
                starredGroups.find((group) => group.full_path === key) ===
                undefined,
            )
          : []),
        ...(isDraggingProject
          ? allKeys.filter(
              (key) =>
                starredProjects.find(
                  (project) => project.path_with_namespace === key,
                ) === undefined,
            )
          : []),
      ]}
      aria-label="Group and Projects"
    >
      <ListboxSection title="Groups" showDivider>
        {groupItems.map((item) => {
          if (item === "loading")
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
            onStar: (starred) =>
              onStarredGroupsUpdate(
                starred
                  ? [...starredGroups, group]
                  : starredGroups.filter(
                      (starredGroup) => starredGroup.id !== group.id,
                    ),
              ),
            onDragStart: () => {
              onGroupDragStart(group);
            },
            onDragEnd: onGroupDragEnd,
            onDragEnter,
            onDrop: () => onStarredGroupsUpdate(starredGroups),
          });
        })}
      </ListboxSection>
      <ListboxSection title="Projects">
        {projectItems.map((item) => {
          if (item === "loading")
            return (
              <ListboxItem key="skeleton" textValue="Loading...">
                <Skeleton className="h-8 w-full" />
              </ListboxItem>
            );

          const { project, starred, onDragEnter } = item;

          const projectFeature: ProjectFeature | undefined =
            feature !== undefined
              ? findProjectFeature(feature, project)
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
              projectFeature === "issues" && project.open_issues_count > 0
                ? `Issues (${project.open_issues_count.toLocaleString()})`
                : projectFeature !== undefined
                  ? getFeatureName(projectFeature, PROJECT_FEATURE_NAMES)
                  : undefined,
            starred: starred,
            onStar: (starred) =>
              onStarredProjectsUpdate(
                starred
                  ? [...starredProjects, project]
                  : starredProjects.filter(
                      (starredProject) => starredProject.id !== project.id,
                    ),
              ),
            onDragStart: () => {
              onProjectDragStart(project);
            },
            onDragEnd: onProjectDragEnd,
            onDragEnter,
            onDrop: () => onStarredProjectsUpdate(starredProjects),
          });
        })}
      </ListboxSection>
    </Listbox>
  );
};

export default GroupProjectList;
