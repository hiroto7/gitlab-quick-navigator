export interface Group {
  avatar_url: string | null;
  full_path: string;
  name: string;
  web_url: string;
}

export interface Project {
  avatar_url: string | null;
  name: string;
  path_with_namespace: string;
  web_url: string;
}

export interface Feature {
  path: string;
  name: string;
}

export const GROUP_FEATURES = [
  // Manage
  "activity",
  "group_members",
  "labels",

  // Plan
  "issues",
  "boards",
  "milestones",
  "crm/contacts",

  // Code
  "merge_requests",

  // Build
  "runners",

  // Deploy
  "packages",
  "container_registries",

  // Operate
  "dependency_proxy",
  "infrastructure_registry",

  // Settings
  "edit",
  "settings/integrations",
  "hooks",
  "settings/access_tokens",
  "projects",
  "settings/repository",
  "settings/ci_cd",
  "settings/applications",
  "settings/packages_and_registries",
  "usage_quotas",
  "billings",
] as const;

export const PROJECT_FEATURES = [
  // Manage
  "project_members",
  "labels",

  // Plan
  "issues",
  "boards",
  "milestones",
  "wikis",

  // Code
  "merge_requests",
  "branches",
  "commits",
  "tags",
  "compare",
  "snippets",

  // Build
  "pipelines",
  "jobs",
  "ci/editor",
  "pipeline_schedules",
  "artifacts",

  // Secure
  "security/discover",
  "audit_events",
  "security/configuration",

  // Deploy
  "releases",
  "feature_flags",
  "packages",
  "ml/models",

  // Operate
  "environments",
  "clusters",
  "terraform",
  "infrastructure_registry",
  "google_cloud/configuration",

  // Monitor
  "error_tracking",
  "alert_management",
  "incidents",
  "issues/service_desk",

  // Analyze
  "value_stream_analytics",
  "pipelines/charts",
  "ml/experiments",

  // Settings
  "settings/integrations",
  "hooks",
  "settings/access_tokens",
  "settings/repository",
  "settings/merge_requests",
  "settings/ci_cd",
  "settings/packages_and_registries",
  "settings/operations",
  "settings/analytics",
  "usage_quotas",
] as const;

export const GROUP_FEATURE_NAMES: Partial<
  Record<(typeof GROUP_FEATURES)[number], string>
> = {
  boards: "Issue Boards",
  "crm/contacts": "Customer relations contacts",
  packages: "Package Registry",
  container_registries: "Container Registry",
  infrastructure_registry: "Terraform Module Registry",
  edit: "General settings",
  "settings/integrations": "Group-level integration management",
  hooks: "Group Hooks",
  "settings/access_tokens": "Access Tokens",
  "settings/repository": "Repository Settings",
  "settings/ci_cd": "CI/CD Settings",
  "settings/applications": "Group applications",
  "settings/packages_and_registries": "Packages and registries settings",
  usage_quotas: "Usage",
  billings: "Billing",
};

export const PROJECT_FEATURE_NAMES: Partial<
  Record<(typeof PROJECT_FEATURES)[number], string>
> = {
  project_members: "Members",
  boards: "Issue Boards",
  wikis: "Wiki",
  branches: "Repository / Branches",
  compare: "Compare revisions",
  "ci/editor": "Pipeline Editor",
  pipeline_schedules: "Schedules",
  "security/discover": "Security capabilities",
  "security/configuration": "Security configuration",
  packages: "Package Registry",
  "ml/models": "Model registry",
  clusters: "Kubernetes",
  terraform: "Terraform states",
  infrastructure_registry: "Terraform Module Registry",
  error_tracking: "Errors",
  alert_management: "Alerts",
  "issues/service_desk": "Service Desk",
  "pipelines/charts": "CI/CD Analytics",
  "ml/experiments": "Model experiments",
  "settings/integrations": "Integration Settings",
  hooks: "Webhook Settings",
  "settings/access_tokens": "Access Tokens",
  "settings/repository": "Repository Settings",
  "settings/merge_requests": "Merge requests",
  "settings/ci_cd": "CI/CD Settings",
  "settings/packages_and_registries": "Packages and registries settings",
  "settings/operations": "Monitor Settings",
  "settings/analytics": "Analytics settings",
  usage_quotas: "Usage",
};

const capitalize = <T extends string>(text: T) =>
  (text.slice(0, 1).toUpperCase() + text.slice(1)) as Capitalize<T>;

const getDefaultFeatureName = (path: string) =>
  path.replace("_", " ").split("/").map(capitalize).join(" / ");

const getFeatureName = <P extends string>(
  path: P,
  featureNames: Partial<Record<P, string>>,
) => featureNames[path] ?? getDefaultFeatureName(path);

export const getFeature = <P extends string>(
  path: P,
  featureNames: Partial<Record<P, string>>,
): Feature => ({
  path,
  name: getFeatureName(path, featureNames),
});
