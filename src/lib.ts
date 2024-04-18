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

  issues_access_level: "disabled" | "private" | "enabled";
  merge_requests_access_level: "disabled" | "private" | "enabled";
  snippets_access_level: "disabled" | "private" | "enabled";
  wiki_access_level: "disabled" | "private" | "enabled";

  /** @deprecated */
  issues_enabled: boolean;
  /** @deprecated */
  merge_requests_enabled: boolean;
  /** @deprecated */
  snippets_enabled: boolean;
  /** @deprecated */
  wiki_enabled: boolean;
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
  "epics",
  "boards",
  "epic_boards",
  "roadmap",
  "milestones",
  "cadences",
  "wikis",
  "crm/contacts",
  "crm/organizations",

  // Code
  "merge_requests",

  // Build
  "runners",

  // Secure
  "security/dashboard",
  "security/vulnerabilities",

  // Deploy
  "packages",
  "container_registries",

  // Operate
  "dependency_proxy",
  "infrastructure_registry",

  // Analyze
  "insights",
  "issues_analytics",

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
  "starrers",
  "forks",

  // Manage
  "project_members",
  "labels",

  // Plan
  "issues",
  "boards",
  "milestones",
  "cadences",
  "wikis",
  "requirements_management/requirements",

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
  "quality/test_cases",
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
  "analytics/code_reviews",
  "analytics/issues_analytics",
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
  roadmap: "Epics Roadmap",
  cadences: "Iteration cadences",
  wikis: "Wiki",
  "crm/contacts": "Customer relations contacts",
  "crm/organizations": "Customer relations organizations",
  "security/dashboard": "Security Dashboard",
  "security/vulnerabilities": "Vulnerability Report",
  packages: "Package Registry",
  container_registries: "Container Registry",
  infrastructure_registry: "Terraform Module Registry",
  issues_analytics: "Issue Analytics",
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
  cadences: "Iteration cadences",
  wikis: "Wiki",
  "requirements_management/requirements": "Requirements",
  branches: "Repository / Branches",
  compare: "Compare revisions",
  "ci/editor": "Pipeline Editor",
  pipeline_schedules: "Schedules",
  "quality/test_cases": "Test cases",
  "security/discover": "Security capabilities",
  "security/configuration": "Security configuration",
  packages: "Package Registry",
  "analytics/code_reviews": "Code Review",
  "analytics/issues_analytics": "Issue Analytics",
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

export const isProjectFeatureAvailable: Partial<
  Record<(typeof PROJECT_FEATURES)[number], (project: Project) => boolean>
> = {
  issues: (project) => project.issues_access_level !== "disabled",
  boards: (project) => project.issues_access_level !== "disabled",
  incidents: (project) => project.issues_access_level !== "disabled",
  "issues/service_desk": (project) =>
    project.issues_access_level !== "disabled",

  merge_requests: (project) =>
    project.merge_requests_access_level !== "disabled",
  snippets: (project) => project.snippets_access_level !== "disabled",
  wikis: (project) => project.wiki_access_level !== "disabled",

  labels: (project) =>
    project.issues_access_level !== "disabled" ||
    project.merge_requests_access_level !== "disabled",
  milestones: (project) =>
    project.issues_access_level !== "disabled" ||
    project.merge_requests_access_level !== "disabled",
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
