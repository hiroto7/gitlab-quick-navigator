import {
  Accordion,
  AccordionItem,
  Chip,
  Listbox,
  ListboxItem,
  Skeleton,
  Spinner,
} from "@heroui/react";
import React from "react";
import { useChromeLocalStorage } from "./contexts/ChromeStorageContext";
import CalendarIcon from "./icons/CalendarIcon";
import ChartIcon from "./icons/ChartIcon";
import CloudIcon from "./icons/CloudIcon";
import CodeIcon from "./icons/CodeIcon";
import CogIcon from "./icons/CogIcon";
import CommandLineIcon from "./icons/CommandLineIcon";
import ComputerIcon from "./icons/ComputerIcon";
import RocketIcon from "./icons/RocketIcon";
import ShieldIcon from "./icons/ShieldIcon";
import UsersIcon from "./icons/UsersIcon";
import {
  generateHref,
  getProjectFeaturePath,
  Group,
  GroupFeature,
  isProjectFeatureAvailable,
  Project,
  ProjectFeature,
} from "./lib";

interface FeatureListItem<F extends GroupFeature | ProjectFeature> {
  label: string;
  feature: F;
}

interface FeatureListSection<F extends GroupFeature | ProjectFeature> {
  title: keyof typeof SECTION_ICONS;
  items: readonly FeatureListItem<F>[];
}

interface FeatureListItemWithPath<F extends GroupFeature | ProjectFeature>
  extends FeatureListItem<F> {
  path: string;
  badge: number | undefined;
}

interface FeatureListSectionWithPath<F extends GroupFeature | ProjectFeature>
  extends FeatureListSection<F> {
  items: readonly FeatureListItemWithPath<F>[];
}

const SECTION_ICONS = {
  Manage: <UsersIcon />,
  Plan: <CalendarIcon />,
  Code: <CodeIcon />,
  Build: <RocketIcon />,
  Secure: <ShieldIcon />,
  Deploy: <CommandLineIcon />,
  Operate: <CloudIcon />,
  Monitor: <ComputerIcon />,
  Analyze: <ChartIcon />,
  Settings: <CogIcon />,
} satisfies Record<string, React.ReactNode>;

const GROUP_FEATURE_LIST: readonly FeatureListSection<GroupFeature>[] = [
  {
    title: "Manage",
    items: [
      { label: "Activity", feature: "activity" },
      { label: "Members", feature: "group_members" },
      { label: "Labels", feature: "labels" },
    ],
  },
  {
    title: "Plan",
    items: [
      { label: "Issues", feature: "issues" },
      { label: "Issue boards", feature: "boards" },
      { label: "Epics", feature: "epics" },
      { label: "Epic boards", feature: "epic_boards" },
      { label: "Roadmap", feature: "roadmap" },
      { label: "Milestones", feature: "milestones" },
      { label: "Customer relations", feature: "crm/contacts" },
      { label: "Iterations", feature: "cadences" },
    ],
  },
  {
    title: "Code",
    items: [{ label: "Merge requests", feature: "merge_requests" }],
  },
  {
    title: "Build",
    items: [{ label: "Runners", feature: "runners" }],
  },
  {
    title: "Deploy",
    items: [
      { label: "Package registry", feature: "packages" },
      { label: "Container registry", feature: "container_registries" },
    ],
  },
  {
    title: "Operate",
    items: [
      { label: "Dependency Proxy", feature: "dependency_proxy" },
      { label: "Kubernetes", feature: "clusters" },
      { label: "Terraform modules", feature: "terraform_module_registry" },
    ],
  },
  {
    title: "Analyze",
    items: [
      { label: "Insights", feature: "insights" },
      { label: "Issue analytics", feature: "issues_analytics" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "General", feature: "edit" },
      { label: "Integrations", feature: "settings/integrations" },
      { label: "Webhooks", feature: "hooks" },
      { label: "Access tokens", feature: "settings/access_tokens" },
      { label: "Repository", feature: "settings/repository" },
      { label: "CI/CD", feature: "settings/ci_cd" },
      { label: "Applications", feature: "settings/applications" },
      {
        label: "Packages and registries",
        feature: "settings/packages_and_registries",
      },
      { label: "Usage Quotas", feature: "usage_quotas" },
      { label: "Billing", feature: "billings" },
      { label: "Workspaces", feature: "settings/workspaces" },
    ],
  },
];

const PROJECT_FEATURE_LIST: readonly FeatureListSection<ProjectFeature>[] = [
  {
    title: "Manage",
    items: [
      { label: "Members", feature: "project_members" },
      { label: "Labels", feature: "labels" },
    ],
  },
  {
    title: "Plan",
    items: [
      { label: "Issues", feature: "issues" },
      { label: "Issue boards", feature: "boards" },
      { label: "Milestones", feature: "milestones" },
      { label: "Iterations", feature: "cadences" },
      { label: "Wiki", feature: "wikis" },
      {
        label: "Requirements",
        feature: "requirements_management/requirements",
      },
    ],
  },
  {
    title: "Code",
    items: [
      { label: "Merge requests", feature: "merge_requests" },
      { label: "Repository", feature: "tree" },
      { label: "Branches", feature: "branches" },
      { label: "Commits", feature: "commits" },
      { label: "Tags", feature: "tags" },
      { label: "Repository graph", feature: "network" },
      { label: "Compare revisions", feature: "compare" },
      { label: "Snippets", feature: "snippets" },
    ],
  },
  {
    title: "Build",
    items: [
      { label: "Pipelines", feature: "pipelines" },
      { label: "Jobs", feature: "jobs" },
      { label: "Pipeline editor", feature: "ci/editor" },
      { label: "Pipeline schedules", feature: "pipeline_schedules" },
      { label: "Test cases", feature: "quality/test_cases" },
      { label: "Artifacts", feature: "artifacts" },
    ],
  },
  {
    title: "Secure",
    items: [
      { label: "Security capabilities", feature: "security/discover" },
      { label: "Audit events", feature: "audit_events" },
      { label: "Security configuration", feature: "security/configuration" },
    ],
  },
  {
    title: "Deploy",
    items: [
      { label: "Releases", feature: "releases" },
      { label: "Feature flags", feature: "feature_flags" },
      { label: "Package registry", feature: "packages" },
      { label: "Model registry", feature: "ml/models" },
    ],
  },
  {
    title: "Operate",
    items: [
      { label: "Environments", feature: "environments" },
      { label: "Kubernetes clusters", feature: "clusters" },
      { label: "Terraform states", feature: "terraform" },
      { label: "Terraform modules", feature: "terraform_module_registry" },
      { label: "Google Cloud", feature: "google_cloud/configuration" },
    ],
  },
  {
    title: "Monitor",
    items: [
      { label: "Error Tracking", feature: "error_tracking" },
      { label: "Alerts", feature: "alert_management" },
      { label: "Incidents", feature: "incidents" },
      { label: "Service Desk", feature: "issues/service_desk" },
    ],
  },
  {
    title: "Analyze",
    items: [
      { label: "Value stream analytics", feature: "value_stream_analytics" },
      { label: "Contributor analytics", feature: "graphs" },
      { label: "CI/CD analytics", feature: "pipelines/charts" },
      { label: "Code review analytics", feature: "analytics/code_reviews" },
      { label: "Issue analytics", feature: "analytics/issues_analytics" },
      { label: "Model experiments", feature: "ml/experiments" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Integrations", feature: "settings/integrations" },
      { label: "Webhooks", feature: "hooks" },
      { label: "Access tokens", feature: "settings/access_tokens" },
      { label: "Repository", feature: "settings/repository" },
      { label: "Merge requests", feature: "settings/merge_requests" },
      { label: "CI/CD", feature: "settings/ci_cd" },
      {
        label: "Packages and registries",
        feature: "settings/packages_and_registries",
      },
      { label: "Monitor", feature: "settings/operations" },
      { label: "Usage Quotas", feature: "usage_quotas" },
    ],
  },
];

const FeatureList: React.FC<{
  groupOrProject:
    | { type: "group"; item: Group }
    | { type: "project"; item: Project };
  currentGroupFeature: GroupFeature | undefined;
  currentProjectFeature: ProjectFeature | undefined;
  loadingGroupFeature: GroupFeature | undefined;
  loadingProjectFeature: ProjectFeature | undefined;
  search: string;
  onNavigate: (url: string) => void;
}> = ({
  groupOrProject,
  currentGroupFeature,
  currentProjectFeature,
  loadingGroupFeature,
  loadingProjectFeature,
  search,
  onNavigate,
}) => {
  const {
    items: { selectedFeatureListSections = [] },
    set,
  } = useChromeLocalStorage();

  const render = <F extends GroupFeature | ProjectFeature>(
    list: readonly FeatureListSectionWithPath<F>[],
    currentFeature: F | undefined,
    loadingFeature: F | undefined,
  ) => (
    <Accordion
      selectionMode="multiple"
      selectedKeys={selectedFeatureListSections}
      onSelectionChange={(keys) => {
        if (!(keys instanceof Set)) return;
        void set({
          selectedFeatureListSections: keys.values().map(String).toArray(),
        });
      }}
    >
      {list
        .filter(({ items }) => items.length > 0)
        .map(({ title, items }) => (
          <AccordionItem
            key={title}
            title={title}
            startContent={SECTION_ICONS[title]}
          >
            <Listbox
              selectionMode="single"
              selectedKeys={
                currentFeature !== undefined ? [currentFeature] : []
              }
            >
              {items.map(({ feature, label, path, badge }) => {
                const href = generateHref(
                  groupOrProject.item.web_url,
                  path,
                  search,
                );

                return (
                  <ListboxItem
                    key={feature}
                    href={href}
                    endContent={
                      <>
                        {loadingFeature === feature ? (
                          <Spinner size="sm" variant="gradient" />
                        ) : undefined}
                        {badge !== undefined && (
                          <Chip size="sm">{badge.toLocaleString()}</Chip>
                        )}
                      </>
                    }
                    onPress={() => onNavigate(href)}
                  >
                    {label}
                  </ListboxItem>
                );
              })}
            </Listbox>
          </AccordionItem>
        ))}
    </Accordion>
  );

  switch (groupOrProject.type) {
    case "group": {
      const groupFeatureList: readonly FeatureListSectionWithPath<GroupFeature>[] =
        GROUP_FEATURE_LIST.map(({ title, items }) => ({
          title,
          items: items.map(({ feature, label }) => ({
            feature,
            label,
            path: feature,
            badge: undefined,
          })),
        }));

      return render(groupFeatureList, currentGroupFeature, loadingGroupFeature);
    }

    case "project": {
      const project = groupOrProject.item;
      const projectFeatureList: readonly FeatureListSectionWithPath<ProjectFeature>[] =
        PROJECT_FEATURE_LIST.map(({ title, items }) => ({
          title,
          items: items
            .filter(
              ({ feature }) =>
                isProjectFeatureAvailable[feature]?.(project) ?? true,
            )
            .map(({ feature, label }) => ({
              feature,
              label,
              path: getProjectFeaturePath(feature, project.default_branch),
              badge:
                feature === "issues" ? project.open_issues_count : undefined,
            })),
        }));

      return render(
        projectFeatureList,
        currentProjectFeature,
        loadingProjectFeature,
      );
    }
  }
};

export default FeatureList;

export const SkeletonFeatureList: React.FC = () => {
  const keys = Array.from({ length: 5 }).map((_, index) => index.toString());

  return (
    <Accordion disabledKeys={keys}>
      {keys.map((key) => (
        <AccordionItem
          key={key}
          startContent={<Skeleton className="h-6 w-6" />}
          title={<Skeleton className="h-6 w-full" />}
        />
      ))}
    </Accordion>
  );
};
