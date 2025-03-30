export interface Group {
  avatar_url: string | null;
  full_path: string;
  id: number;
  name: string;
  web_url: string;
}

type AccessLevel = "disabled" | "private" | "enabled";

export interface Project {
  avatar_url: string | null;
  default_branch?: string;
  id: number;
  open_issues_count: number;
  name: string;
  path_with_namespace: string;
  web_url: string;

  issues_access_level: AccessLevel;
  merge_requests_access_level: AccessLevel;
  snippets_access_level: AccessLevel;
  wiki_access_level: AccessLevel;

  builds_access_level: AccessLevel;

  analytics_access_level: AccessLevel;
  environments_access_level: AccessLevel;
  feature_flags_access_level: AccessLevel;
  infrastructure_access_level: AccessLevel;
  model_experiments_access_level: AccessLevel;
  model_registry_access_level: AccessLevel;
  monitor_access_level: AccessLevel;
  releases_access_level: AccessLevel;
  repository_access_level: AccessLevel;

  /** @deprecated */
  issues_enabled: boolean;
  /** @deprecated */
  merge_requests_enabled: boolean;
  /** @deprecated */
  snippets_enabled: boolean;
  /** @deprecated */
  wiki_enabled: boolean;

  /** @deprecated */
  jobs_enabled: boolean;
}

export const GROUP_FEATURES = [
  // Manage
  "activity",
  "group_members",
  "labels",

  "labels/new",

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

  "milestones/new",

  // Code
  "merge_requests",

  // Build
  "runners",

  "runners/new",

  // Secure
  "security/dashboard",
  "security/vulnerabilities",

  // Deploy
  "packages",
  "container_registries",

  // Operate
  "dependency_proxy",
  "clusters",
  "terraform_module_registry",

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
  "settings/workspaces",
] as const;

export const PROJECT_FEATURES = [
  "starrers",
  "forks",

  "forks/new",

  // Manage
  "project_members",
  "labels",

  "labels/new",

  // Plan
  "issues",
  "boards",
  "milestones",
  "cadences",
  "wikis",
  "requirements_management/requirements",

  "issues/new",
  "milestones/new",

  // Code
  "merge_requests",
  "tree",
  "branches",
  "commits",
  "tags",
  "network",
  "compare",
  "snippets",

  "merge_requests/new",
  "branches/new",
  "tags/new",
  "snippets/new",

  // Build
  "pipelines",
  "jobs",
  "ci/editor",
  "pipeline_schedules",
  "quality/test_cases",
  "artifacts",

  "pipelines/new",
  "pipeline_schedules/new",

  // Secure
  "security/discover",
  "audit_events",
  "security/configuration",

  // Deploy
  "releases",
  "feature_flags",
  "packages",
  "ml/models",

  "releases/new",
  "feature_flags/new",
  "ml/models/new",

  // Operate
  "environments",
  "clusters",
  "terraform",
  "terraform_module_registry",
  "google_cloud/configuration",

  "environments/new",

  // Monitor
  "error_tracking",
  "alert_management",
  "incidents",
  "issues/service_desk",

  // Analyze
  "value_stream_analytics",
  "graphs",
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

export type GroupFeature = (typeof GROUP_FEATURES)[number];
export type ProjectFeature = (typeof PROJECT_FEATURES)[number];

export const GROUP_FEATURE_NAMES: Partial<Record<GroupFeature, string>> = {
  // Manage
  "labels/new": "Labels / New label",

  // Plan
  boards: "Issue Boards",
  roadmap: "Epics Roadmap",
  cadences: "Iteration cadences",
  wikis: "Wiki",
  "crm/contacts": "Customer relations contacts",
  "crm/organizations": "Customer relations organizations",

  "milestones/new": "Milestones / New milestone",

  // Secure
  "security/dashboard": "Security Dashboard",
  "security/vulnerabilities": "Vulnerability Report",

  // Deploy
  packages: "Package registry",
  container_registries: "Container registry",

  // Operate
  clusters: "Kubernetes",

  // Analyze
  issues_analytics: "Issue Analytics",

  // Settings
  edit: "General settings",
  "settings/integrations": "Group-level integration management",
  hooks: "Group hooks",
  "settings/access_tokens": "Access tokens",
  "settings/repository": "Repository Settings",
  "settings/ci_cd": "CI/CD Settings",
  "settings/applications": "Group applications",
  "settings/packages_and_registries": "Packages and registries settings",
  usage_quotas: "Usage",
  billings: "Billing",
  "settings/workspaces": "Workspaces Settings",
};

export const PROJECT_FEATURE_NAMES: Partial<Record<ProjectFeature, string>> = {
  "forks/new": "Fork project",

  // Manage
  project_members: "Members",

  "labels/new": "Labels / New label",

  // Plan
  boards: "Issue Boards",
  cadences: "Iteration cadences",
  wikis: "Wiki",
  "requirements_management/requirements": "Requirements",

  "milestones/new": "Milestones / New milestone",

  // Code
  tree: "Repository",
  network: "Repository graph",
  compare: "Compare revisions",

  "merge_requests/new": "Merge requests / New merge request",
  "branches/new": "Branches / New branch",
  "tags/new": "Tags / New tag",
  "snippets/new": "Snippets / New snippet",

  // Build
  "ci/editor": "Pipeline editor",
  pipeline_schedules: "Schedules",
  "quality/test_cases": "Test cases",

  "pipelines/new": "Pipelines / New pipeline",
  "pipeline_schedules/new": "Pipelines / Schedules",

  // Secure
  "security/discover": "Security capabilities",
  "security/configuration": "Security configuration",

  // Deploy
  packages: "Package registry",
  "analytics/code_reviews": "Code Review",
  "analytics/issues_analytics": "Issue Analytics",
  "ml/models": "Model registry",

  "releases/new": "Releases / New release",
  "ml/models/new": "New model",

  // Operate
  clusters: "Kubernetes",
  terraform: "Terraform states",

  "environments/new": "Environments / New environment",

  // Monitor
  error_tracking: "Errors",
  alert_management: "Alerts",
  "issues/service_desk": "Service Desk",

  // Analyze
  graphs: "Contributor analytics",
  "pipelines/charts": "CI/CD Analytics",
  "ml/experiments": "Model experiments",

  // Settings
  "settings/integrations": "Integration Settings",
  hooks: "Webhook settings",
  "settings/access_tokens": "Access tokens",
  "settings/repository": "Repository Settings",
  "settings/merge_requests": "Merge requests",
  "settings/ci_cd": "CI/CD Settings",
  "settings/packages_and_registries": "Packages and registries settings",
  "settings/operations": "Monitor Settings",
  "settings/analytics": "Analytics settings",
  usage_quotas: "Usage",
};

export const isProjectFeatureAvailable: Partial<
  Record<ProjectFeature, (project: Project) => boolean>
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

  value_stream_analytics: (project) =>
    project.analytics_access_level !== "disabled",

  pipelines: (project) => project.builds_access_level !== "disabled",
  jobs: (project) => project.builds_access_level !== "disabled",
  pipeline_schedules: (project) => project.builds_access_level !== "disabled",
  artifacts: (project) => project.builds_access_level !== "disabled",
  "settings/ci_cd": (project) => project.builds_access_level !== "disabled",

  clusters: (project) => project.infrastructure_access_level !== "disabled",
  terraform: (project) => project.infrastructure_access_level !== "disabled",
  "google_cloud/configuration": (project) =>
    project.infrastructure_access_level !== "disabled",

  "ml/experiments": (project) =>
    project.model_experiments_access_level !== "disabled",
  "ml/models": (project) =>
    project.model_experiments_access_level !== "disabled",

  error_tracking: (project) => project.monitor_access_level !== "disabled",
  alert_management: (project) => project.monitor_access_level !== "disabled",

  releases: (project) => project.releases_access_level !== "disabled",

  tree: (project) => project.repository_access_level !== "disabled",
  branches: (project) => project.repository_access_level !== "disabled",
  commits: (project) => project.repository_access_level !== "disabled",
  tags: (project) => project.repository_access_level !== "disabled",
  network: (project) => project.repository_access_level !== "disabled",
  compare: (project) => project.repository_access_level !== "disabled",
  "ci/editor": (project) => project.repository_access_level !== "disabled",

  labels: (project) =>
    project.issues_access_level !== "disabled" ||
    project.merge_requests_access_level !== "disabled",
  milestones: (project) =>
    project.issues_access_level !== "disabled" ||
    project.merge_requests_access_level !== "disabled",

  environments: (project) =>
    project.builds_access_level !== "disabled" &&
    project.environments_access_level !== "disabled",

  feature_flags: (project) =>
    project.feature_flags_access_level !== "disabled" &&
    project.repository_access_level !== "disabled",

  graphs: (project) =>
    project.analytics_access_level !== "disabled" &&
    project.repository_access_level !== "disabled",

  "pipelines/charts": (project) =>
    project.analytics_access_level !== "disabled" &&
    project.repository_access_level !== "disabled",
};

const capitalize = <T extends string>(text: T) =>
  (text.slice(0, 1).toUpperCase() + text.slice(1)) as Capitalize<T>;

const getDefaultFeatureName = (path: string) =>
  path.replaceAll("_", " ").split("/").map(capitalize).join(" / ");

export const getFeatureName = <P extends string>(
  path: P,
  featureNames: Partial<Record<P, string>>,
) => featureNames[path] ?? getDefaultFeatureName(path);

export const move = <T>(array: readonly T[], from: number, to: number) => {
  if (from === to) return array;

  const result = [...array];
  result.splice(from, 1);
  result.splice(to, 0, array[from]!);
  return result;
};

export const NAME_PATTERN = String.raw`[a-zA-Z0-9](?:[a-zA-Z0-9_.-]?[a-zA-Z0-9])*`;
export const FEATURE_PATTERN = String.raw`(?<feature>[a-z_]+(?:\/[a-z_]+)*)`;
const RE = new RegExp(
  String.raw`^\/(?:dashboard(?:\/${FEATURE_PATTERN})?|(?:groups\/)?(?<path>${NAME_PATTERN}(?:\/${NAME_PATTERN})*)(?:\/-\/${FEATURE_PATTERN})?)`,
);

export const parsePathname = (pathname: string) => {
  const array = RE.exec(pathname);
  const { path, feature } = array?.groups ?? {};
  return { path, feature };
};

const SIMILAR_FEATURE_PAIRS: readonly {
  group: GroupFeature;
  project: ProjectFeature;
}[] = [
  { group: "group_members", project: "project_members" },
  { group: "issues_analytics", project: "analytics/issues_analytics" },
];

export const findGroupFeature = (feature: string) =>
  SIMILAR_FEATURE_PAIRS.find(({ project }) => feature.startsWith(project))
    ?.group ??
  GROUP_FEATURES.findLast((groupFeature) => feature.startsWith(groupFeature));

export const findProjectFeature = (feature: string, project: Project) =>
  SIMILAR_FEATURE_PAIRS.find(({ group }) => feature.startsWith(group))
    ?.project ??
  PROJECT_FEATURES.findLast(
    (projectFeature) =>
      feature.startsWith(projectFeature) &&
      (isProjectFeatureAvailable[projectFeature]?.(project) ?? true),
  );
