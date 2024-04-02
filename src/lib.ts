export const GROUP_FEATURES: readonly string[] = [
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
];

export const PROJECT_FEATURES: readonly string[] = [
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
];
