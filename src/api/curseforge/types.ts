enum ModsSearchSortField {
  Featured = 1,
  Popularity = 2,
  LastUpdated = 3,
  Name = 4,
  Author = 5,
  TotalDownloads = 6,
  Category = 7,
  GameVersion = 8,
  EarlyAccess = 9,
  FeaturedReleased = 10,
  ReleasedDate = 11,
  Rating = 12,
}

enum SortOrder {
  Asc = 'asc',
  Desc = 'desc',
}

export enum ModLoaderType {
  Any = 0,
  Forge = 1,
  Cauldron = 2,
  LiteLoader = 3,
  Fabric = 4,
  Quilt = 5,
  NeoForge = 6,
}

export type ModsSearchParams = {
  gameId: number;
  classId?: number;
  categoryId?: number;
  categoryIds?: string;
  gameVersion?: string;
  gameVersions?: string;
  searchFilter?: string;
  sortField?: ModsSearchSortField;
  sortOrder?: SortOrder;
  modLoaderType?: ModLoaderType;
  modLoaderTypes?: string;
  gameVersionTypeId?: number;
  authorId?: number;
  primaryAuthorId?: number;
  slug?: string;
  index?: number;
  pageSize?: number;
};

enum ModStatus {
  None = 0,
  New = 1,
  ChangesRequired = 2,
  UnderSoftReview = 3,
  Approved = 4,
  Rejected = 5,
  ChangesMade = 6,
  Inactive = 7,
  Abandoned = 8,
  Deleted = 9,
  UnderReview = 10,
}

enum FileReleaseType {
  None = 0,
  Release = 1,
  Beta = 2,
  Alpha = 3,
}

enum FileStatus {
  None = 0,
  Processing = 1,
  ChangesRequired = 2,
  UnderReview = 3,
  Approved = 4,
  Rejected = 5,
  MalwareDetected = 6,
  Deleted = 7,
  Archived = 8,
  Testing = 9,
  Released = 10,
  ReadyForReview = 11,
  Deprecated = 12,
  Baking = 13,
  AwaitingPublishing = 14,
  FailedPublishing = 15,
}

enum HashAlgorithm {
  None = 0,
  Sha1 = 1,
  Md5 = 2,
}

export enum FileRelationType {
  None = 0,
  EmbeddedLibrary = 1,
  OptionalDependency = 2,
  RequiredDependency = 3,
  Tool = 4,
  Incompatible = 5,
  Include = 6,
}

type ModLinks = {
  websiteUrl: string;
  wikiUrl: string;
  issuesUrl: string;
  sourceUrl: string;
};

type ModCategory = {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  url: string;
  iconUrl: string;
  dateModified: string;
  isClass: boolean;
  classId: number;
  parentCategoryId: number;
  displayIndex: number;
};

type ModAuthor = {
  id: number;
  name: string;
  url: string;
};

type ModAsset = {
  id: number;
  modId: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  url: string;
};

type FileHash = {
  value: string;
  algo: HashAlgorithm;
};

type SortableGameVersion = {
  gameVersionName: string;
  gameVersionPadded: string;
  gameVersion: string;
  gameVersionReleaseDate: string;
  gameVersionTypeId: number;
};

type FileDependency = {
  modId: number;
  relationType: FileRelationType;
};

type FileModule = {
  name: string;
  fingerprint: number;
};

export type ModFile = {
  id: number;
  gameId: number;
  modId: number;
  isAvailable: boolean;
  displayName: string;
  fileName: string;
  releaseType: FileReleaseType;
  fileStatus: FileStatus;
  hashes: FileHash[];
  fileDate: string;
  fileLength: number;
  downloadCount: number;
  fileSizeOnDisk: number;
  downloadUrl: string;
  gameVersions: string[];
  sortableGameVersions: SortableGameVersion[];
  dependencies: FileDependency[];
  exposeAsAlternative: boolean;
  parentProjectFileId: number;
  alternateFileId: number;
  isServerPack: boolean;
  serverPackFileId: number;
  isEarlyAccessContent: boolean;
  earlyAccessEndDate: string;
  fileFingerprint: number;
  modules: FileModule[];
};

type LatestFileIndex = {
  gameVersion: string;
  fileId: number;
  filename: string;
  releaseType: FileReleaseType;
  gameVersionTypeId: number;
  modLoader: ModLoaderType;
};

export type Mod = {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  links: ModLinks;
  summary: string;
  status: ModStatus;
  downloadCount: number;
  isFeatured: boolean;
  primaryCategoryId: number;
  categories: ModCategory[];
  classId: number;
  authors: ModAuthor[];
  logo: ModAsset;
  screenshots: ModAsset[];
  mainFileId: number;
  latestFiles: ModFile[];
  latestFilesIndexes: LatestFileIndex[];
  latestEarlyAccessFilesIndexes: LatestFileIndex[];
  dateCreated: string;
  dateModified: string;
  dateReleased: string;
  allowModDistribution: boolean;
  gamePopularityRank: number;
  isAvailable: boolean;
  thumbsUpCount: number;
  rating: number;
};

type Pagination = {
  index: number;
  pageSize: number;
  resultCount: number;
  totalCount: number;
};

export type SearchResponse = {
  data: Mod[];
  pagination: Pagination;
};
