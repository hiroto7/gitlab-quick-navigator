import { Listbox, ListboxSection, ListboxItem } from "@heroui/react";
import { GroupFeature, ProjectFeature } from "./lib";

interface ProjectFeatureListSection<F extends GroupFeature | ProjectFeature> {
  title: string;
  items: readonly {
    label: string;
    value: F;
  }[];
}

const PROJECT_FEATURE_LIST: readonly ProjectFeatureListSection<ProjectFeature>[] =
  [
    {
      title: "Manage",
      items: [
        { label: "Members", value: "project_members" },
        { label: "Labels", value: "labels" },
      ],
    },
    {
      title: "Plan",
      items: [
        { label: "Issues", value: "issues" },
        { label: "Issue boards", value: "boards" },
        { label: "Milestones", value: "milestones" },
        { label: "Iterations", value: "cadences" },
        { label: "Wiki", value: "wikis" },
        {
          label: "Requirements",
          value: "requirements_management/requirements",
        },
      ],
    },
    {
      title: "Code",
      items: [
        { label: "Merge requests", value: "merge_requests" },
        { label: "Repository", value: "tree" },
        { label: "Branches", value: "branches" },
        { label: "Commits", value: "commits" },
        { label: "Tags", value: "tags" },
        { label: "Repository graph", value: "network" },
        { label: "Compare revisions", value: "compare" },
        { label: "Snippets", value: "snippets" },
      ],
    },
    {
      title: "Build",
      items: [
        { label: "Pipelines", value: "pipelines" },
        { label: "Jobs", value: "jobs" },
        { label: "Pipeline editor", value: "ci/editor" },
        { label: "Pipeline schedules", value: "pipeline_schedules" },
        { label: "Test cases", value: "quality/test_cases" },
        { label: "Artifacts", value: "artifacts" },
      ],
    },
    {
      title: "Secure",
      items: [
        { label: "Security capabilities", value: "security/discover" },
        { label: "Audit events", value: "audit_events" },
        { label: "Security configuration", value: "security/configuration" },
      ],
    },
    {
      title: "Deploy",
      items: [
        { label: "Releases", value: "releases" },
        { label: "Feature flags", value: "feature_flags" },
        { label: "Package registry", value: "packages" },
        { label: "Model registry", value: "ml/models" },
      ],
    },
    {
      title: "Operate",
      items: [
        { label: "Environments", value: "environments" },
        { label: "Kubernetes clusters", value: "clusters" },
        { label: "Terraform states", value: "terraform" },
        { label: "Terraform modules", value: "terraform_module_registry" },
        { label: "Google Cloud", value: "google_cloud/configuration" },
      ],
    },
    {
      title: "Monitor",
      items: [
        { label: "Error Tracking", value: "error_tracking" },
        { label: "Alerts", value: "alert_management" },
        { label: "Incidents", value: "incidents" },
        { label: "Service Desk", value: "issues/service_desk" },
      ],
    },
    {
      title: "Analyze",
      items: [
        { label: "Value stream analytics", value: "value_stream_analytics" },
        { label: "Contributor analytics", value: "graphs" },
        { label: "CI/CD analytics", value: "pipelines/charts" },
        { label: "Code review analytics", value: "analytics/code_reviews" },
        { label: "Issue analytics", value: "analytics/issues_analytics" },
        { label: "Model experiments", value: "ml/experiments" },
      ],
    },
    {
      title: "Settings",
      items: [
        { label: "Integrations", value: "settings/integrations" },
        { label: "Webhooks", value: "hooks" },
        { label: "Access tokens", value: "settings/access_tokens" },
        { label: "Repository", value: "settings/repository" },
        { label: "Merge requests", value: "settings/merge_requests" },
        { label: "CI/CD", value: "settings/ci_cd" },
        {
          label: "Packages and registries",
          value: "settings/packages_and_registries",
        },
        { label: "Monitor", value: "settings/operations" },
        { label: "Usage Quotas", value: "usage_quotas" },
      ],
    },
  ];

const FeatureList: React.FC = () => (
  <Listbox aria-label="Project features" selectionMode="single">
    {PROJECT_FEATURE_LIST.map((section) => (
      <ListboxSection key={section.title} title={section.title}>
        {section.items.map((item) => (
          <ListboxItem key={item.value} textValue={item.label}>
            {item.label}
          </ListboxItem>
        ))}
      </ListboxSection>
    ))}
  </Listbox>
);

export default FeatureList;
