import {
  Avatar,
  Button,
  Listbox,
  ListboxItem,
  ListboxSection,
  Skeleton,
  Spinner,
} from "@heroui/react";
import React, { useCallback } from "react";
import { useDrag } from "./hooks";
import { StarIcon, StarredIcon } from "./icons";
import {
  GROUP_FEATURE_NAMES,
  Group,
  GroupFeature,
  PROJECT_FEATURE_NAMES,
  Project,
  ProjectFeature,
  generateHref,
  getFeatureName,
  getProjectFeaturePath,
  isProjectFeatureAvailable,
} from "./lib";

const GroupProjectList: React.FC<{
  path: string | undefined;
  groupFeature: GroupFeature | undefined;
  projectFeature: ProjectFeature | undefined;
  search: string;
  starredGroups: readonly Group[];
  starredProjects: readonly Project[];
  currentGroup: Group | "loading" | undefined;
  currentGroupProjects: readonly Project[] | "loading" | undefined;
  loadingPath: string | undefined;
  onNavigate: (url: string) => void;
  onStarredGroupsUpdate: (groups: readonly Group[]) => void;
  onStarredProjectsUpdate: (projects: readonly Project[]) => void;
}> = ({
  path,
  groupFeature,
  projectFeature,
  search,
  starredGroups: currentStarredGroups,
  starredProjects: currentStarredProjects,
  currentGroup: group,
  currentGroupProjects: projects,
  loadingPath,
  onNavigate,
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

  const loadingItem = (
    <ListboxItem
      key="skeleton"
      textValue="Loading..."
      startContent={
        <Avatar
          isBordered
          radius="sm"
          size="sm"
          className="flex-shrink-0"
          icon={<Skeleton className="h-full w-full" />}
        />
      }
    >
      <Skeleton className="h-5 w-full" />
    </ListboxItem>
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
      isLoading,
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
      isLoading: boolean;
      onStar: (starred: boolean) => void;
      onDragStart: () => void;
      onDragEnd: () => void;
      onDragEnter: (() => void) | undefined;
      onDrop: () => void;
    }) => {
      const href = generateHref(base, featurePath, search);

      return (
        <ListboxItem
          key={key}
          href={href}
          onPress={() => onNavigate(href)}
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
          data-loading={isLoading}
          endContent={
            <>
              {isLoading && <Spinner size="sm" variant="gradient" />}
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
    [onNavigate, search],
  );

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
          if (item === "loading") return loadingItem;

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
            isLoading: loadingPath === group.full_path,
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
          if (item === "loading") return loadingItem;

          const { project, starred, onDragEnter } = item;

          const { featurePath, featureName } =
            projectFeature !== undefined &&
            (isProjectFeatureAvailable[projectFeature]?.(project) ?? true)
              ? {
                  featurePath: getProjectFeaturePath(
                    projectFeature,
                    project.default_branch,
                  ),
                  featureName:
                    projectFeature === "issues" &&
                    project.open_issues_count !== undefined &&
                    project.open_issues_count > 0
                      ? `Issues (${project.open_issues_count.toLocaleString()})`
                      : getFeatureName(projectFeature, PROJECT_FEATURE_NAMES),
                }
              : {};

          return getListboxItem({
            key: project.path_with_namespace,
            base: project.web_url,
            name: project.name,
            avatar: project.avatar_url,
            featurePath,
            featureName,
            starred: starred,
            isLoading: loadingPath === project.path_with_namespace,
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
