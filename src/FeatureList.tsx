import { Listbox, ListboxItem, ListboxSection, Spinner } from "@heroui/react";
import React from "react";
import {
  generateHref,
  GroupFeature,
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

const FeatureList: React.FC<{
  base: string;
  currentFeature: ProjectFeature | undefined;
  loadingFeature: ProjectFeature | undefined;
  search: string;
  onNavigate: (feature: string) => void;
}> = ({ base, currentFeature, loadingFeature, search, onNavigate }) => (
  <Listbox
    aria-label="Project features"
    selectionMode="single"
    selectedKeys={currentFeature !== undefined ? [currentFeature] : []}
  >
    {PROJECT_FEATURE_LIST.map(({ title, items }) => (
      <ListboxSection key={title} title={title}>
        {items.map(({ feature, label }) => {
          const href = generateHref(base, feature, search);

          return (
            <ListboxItem
              key={feature}
              href={href}
              textValue={label}
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

export default FeatureList;
