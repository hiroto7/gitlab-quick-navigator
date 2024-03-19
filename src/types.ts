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
