import { Listbox, ListboxItem, ListboxSection, Spinner } from "@heroui/react";
import React from "react";
import {
  findGroupFeature,
  findProjectFeature,
  generateHref,
  Group,
  GroupFeature,
  isProjectFeatureAvailable,
  Project,
  ProjectFeature,
  updateTabUrl,
} from "./lib";

interface ProjectFeatureListSection<F extends GroupFeature | ProjectFeature> {
  title: string;
  items: readonly {
    label: string;
    feature: F;
  }[];
}

const GROUP_FEATURE_LIST: readonly ProjectFeatureListSection<GroupFeature>[] = [
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

const PROJECT_FEATURE_LIST: readonly ProjectFeatureListSection<ProjectFeature>[] =
  [
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

export const GroupFeatureList: React.FC<{
  group: Group;
  currentFeature: string | undefined;
  loadingFeature: GroupFeature | ProjectFeature | undefined;
  search: string;
  onNavigate: (feature: GroupFeature) => void;
}> = ({ group, currentFeature, loadingFeature, search, onNavigate }) => {
  const groupFeature =
    currentFeature !== undefined ? findGroupFeature(currentFeature) : undefined;

  return (
    <Listbox
      selectionMode="single"
      selectedKeys={groupFeature !== undefined ? [groupFeature] : []}
    >
      {GROUP_FEATURE_LIST.map(({ title, items }) => (
        <ListboxSection key={title} title={title} showDivider>
          {items.map(({ feature, label }) => {
            const href = generateHref(group.web_url, feature, search);

            return (
              <ListboxItem
                key={feature}
                href={href}
                endContent={
                  loadingFeature === feature && (
                    <Spinner size="sm" variant="gradient" />
                  )
                }
                onPress={() => {
                  onNavigate(feature);
                  void updateTabUrl(href);
                }}
              >
                {label}
              </ListboxItem>
            );
          })}
        </ListboxSection>
      ))}
    </Listbox>
  );
};

export const ProjectFeatureList: React.FC<{
  project: Project;
  currentFeature: string | undefined;
  loadingFeature: GroupFeature | ProjectFeature | undefined;
  search: string;
  onNavigate: (feature: ProjectFeature) => void;
}> = ({ project, currentFeature, loadingFeature, search, onNavigate }) => {
  const projectFeature =
    currentFeature !== undefined
      ? findProjectFeature(currentFeature, project)
      : undefined;

  return (
    <Listbox
      selectionMode="single"
      selectedKeys={projectFeature !== undefined ? [projectFeature] : []}
    >
      {PROJECT_FEATURE_LIST.map(({ title, items }) => ({
        title,
        items: items.filter(
          ({ feature }) =>
            isProjectFeatureAvailable[feature]?.(project) ?? true,
        ),
      })).map(({ title, items }) => (
        <ListboxSection key={title} title={title} showDivider>
          {items.map(({ feature, label }) => {
            const href = generateHref(project.web_url, feature, search);

            return (
              <ListboxItem
                key={feature}
                href={href}
                endContent={
                  loadingFeature === feature ? (
                    <Spinner size="sm" variant="gradient" />
                  ) : undefined
                }
                onPress={() => {
                  onNavigate(feature);
                  void updateTabUrl(href);
                }}
              >
                {label}
              </ListboxItem>
            );
          })}
        </ListboxSection>
      ))}
    </Listbox>
  );
};
