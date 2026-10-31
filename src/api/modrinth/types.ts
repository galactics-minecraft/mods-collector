export type ModrinthProject = {
  id: string;
  slug: string;
  title: string;
};

export type ModrinthSearchResponse = {
  hits: { project_id: string; slug: string; title: string }[];
};

export type ModrinthFile = {
  url: string;
  filename: string;
  primary: boolean;
};

export type ModrinthVersion = {
  id: string;
  project_id: string;
  version_type: 'release' | 'beta' | 'alpha';
  files: ModrinthFile[];
};
