import {
  Avatar,
  Button,
  Description,
  Header,
  Label,
  ListBox,
  Separator,
  Skeleton,
  Spinner,
} from "@heroui/react";
import React, { useCallback } from "react";
import { useDrag } from "./hooks";
import StarIcon from "./icons/StarIcon";
import StarredIcon from "./icons/StarredIcon";
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

  const loadingItem = (id: string) => (
    <ListBox.Item
      key={id}
      id={id}
      textValue="Loading..."
      className="flex items-center gap-2"
    >
      <Avatar size="sm" className="shrink-0 rounded-sm border">
        <Avatar.Fallback>
          <Skeleton className="h-full w-full" />
        </Avatar.Fallback>
      </Avatar>
      <Label className="w-full">
        <Skeleton className="h-5 w-full" />
      </Label>
    </ListBox.Item>
  );

  const getListboxItem = useCallback(
    ({
      key,
      href,
      name,
      avatar,
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
      href: string;
      name: string;
      avatar: string | null;
      featureName: string | undefined;
      starred: boolean;
      isLoading: boolean;
      onStar: (starred: boolean) => void;
      onDragStart: () => void;
      onDragEnd: () => void;
      onDragEnter: (() => void) | undefined;
      onDrop: () => void;
    }) => {
      return (
        <ListBox.Item
          key={key}
          id={key}
          href={href}
          textValue={name}
          data-starred={starred}
          data-loading={isLoading}
          className="flex items-center gap-2"
          onPress={() => onNavigate(href)}
        >
          {({ isHovered, isSelected }) => (
            <span
              className="flex min-w-0 flex-1 items-center gap-2"
              draggable={starred}
              onDragOver={(event: React.DragEvent) => {
                event.preventDefault();
              }}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onDragEnter={onDragEnter}
              onDrop={onDrop}
            >
              <Avatar size="sm" className="shrink-0 rounded-sm border">
                {avatar !== null && <Avatar.Image src={avatar} alt="" />}
                <Avatar.Fallback>{name[0]}</Avatar.Fallback>
              </Avatar>
              <span className="min-w-0 flex-1 overflow-x-hidden">
                <Label className="block truncate">{name}</Label>
                {featureName !== undefined && (
                  <Description>{featureName}</Description>
                )}
              </span>
              <span className="flex items-center gap-2">
                <ListBox.ItemIndicator />
                {isLoading && <Spinner color="current" size="sm" />}
                <Button
                  isIconOnly
                  variant="tertiary"
                  size="sm"
                  className={
                    isHovered || isSelected || starred || isLoading
                      ? "inline-flex"
                      : "hidden"
                  }
                  onPress={() => {
                    onStar(!starred);
                  }}
                >
                  {starred ? <StarredIcon /> : <StarIcon />}
                </Button>
              </span>
            </span>
          )}
        </ListBox.Item>
      );
    },
    [onNavigate],
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
    <ListBox
      selectionMode="single"
      selectedKeys={path !== undefined ? new Set([path]) : new Set()}
      disabledKeys={
        new Set([
          "skeleton-groups",
          "skeleton-projects",
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
        ])
      }
      aria-label="Group and Projects"
    >
      <ListBox.Section>
        <Header>Groups</Header>
        {groupItems.map((item) => {
          if (item === "loading") return loadingItem("skeleton-groups");

          const { group, starred, onDragEnter } = item;

          return getListboxItem({
            key: group.full_path,
            href: generateHref(group.web_url, groupFeature, search),
            name: group.name,
            avatar: group.avatar_url,
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
      </ListBox.Section>
      <Separator />
      <ListBox.Section>
        <Header>Projects</Header>
        {projectItems.map((item) => {
          if (item === "loading") return loadingItem("skeleton-projects");

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
                    project.open_issues_count !== undefined
                      ? `Issues (${project.open_issues_count.toLocaleString()})`
                      : getFeatureName(projectFeature, PROJECT_FEATURE_NAMES),
                }
              : {};

          return getListboxItem({
            key: project.path_with_namespace,
            href: generateHref(project.web_url, featurePath, search),
            name: project.name,
            avatar: project.avatar_url,
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
      </ListBox.Section>
    </ListBox>
  );
};

export default GroupProjectList;
