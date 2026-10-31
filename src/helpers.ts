// helpers.ts
import { getMod, getModFile } from './api';
import { FileRelationType, ModLoaderType, type Mod, type ModFile } from './api/curseforge/types';
import { getModrinthProject, getModrinthVersions, searchModrinth } from './api/modrinth';

const GAME_VERSION = '1.21.1';
const LOADER = ModLoaderType.Fabric;
const MODRINTH_LOADER = 'fabric'; // must match LOADER
const RELEASE = 1; // FileReleaseType.Release
const INCLUDE_DEPENDENCIES = true; // pull in required dependencies of each mod

export type ModType = 'client' | 'server' | 'both';
export type Source = 'curseforge' | 'modrinth' | 'direct';

export type ModRow = { id?: number; name: string; source: Source; link: string; type: ModType; manual?: boolean };
export type ModError = { input: string | number; error: string; dependencyOf?: string };

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Strict: only a file built for GAME_VERSION + LOADER, never a fallback to another version
const pickFile = async (mod: Mod): Promise<ModFile | undefined> => {
  const matches = mod.latestFilesIndexes.filter(f => f.gameVersion === GAME_VERSION && f.modLoader === LOADER);
  const match = matches.find(f => f.releaseType === RELEASE) ?? matches[0];
  if (!match) return undefined;

  return mod.latestFiles.find(f => f.id === match.fileId) ?? getModFile(mod.id, match.fileId);
};

// CurseForge tags files with "Client" / "Server" in gameVersions.
// Only one of them => single-sided. Both or neither => needed on both sides.
const getType = (file: ModFile): ModType => {
  const client = file.gameVersions.includes('Client');
  const server = file.gameVersions.includes('Server');

  if (client && !server) return 'client';
  if (server && !client) return 'server';
  return 'both';
};

// Used when CurseForge blocks direct downloads. Tries the same slug first,
// then a name search (only accepting a result whose title matches the mod name).
const findOnModrinth = async (mod: Mod): Promise<string | undefined> => {
  try {
    let projectId = (await getModrinthProject(mod.slug))?.id;

    if (!projectId) {
      const hits = await searchModrinth(mod.name, GAME_VERSION, MODRINTH_LOADER);
      projectId = hits.find(h => normalize(h.title) === normalize(mod.name))?.project_id;
    }

    if (!projectId) return undefined;

    const versions = await getModrinthVersions(projectId, GAME_VERSION, MODRINTH_LOADER);
    const version = versions.find(v => v.version_type === 'release') ?? versions[0];
    const file = version?.files.find(f => f.primary) ?? version?.files[0];

    return file?.url;
  } catch {
    return undefined;
  }
};

const resolveDownload = async (
  mod: Mod,
  file: ModFile,
): Promise<{ source: Source; link: string; manual?: boolean }> => {
  if (file.downloadUrl) return { source: 'curseforge', link: file.downloadUrl };

  const modrinthUrl = await findOnModrinth(mod);
  if (modrinthUrl) return { source: 'modrinth', link: modrinthUrl };

  return { source: 'curseforge', link: mod.links.websiteUrl, manual: true };
};

type ParsedInput = { kind: 'id'; id: number } | { kind: 'url'; url: string } | { kind: 'invalid' };

const parseInput = (input: string | number): ParsedInput => {
  if (typeof input === 'number') return { kind: 'id', id: input };

  const cleaned = input.replace(/--WARNING$/i, '').trim();

  if (/^https?:\/\//i.test(cleaned)) return { kind: 'url', url: cleaned };

  const idMatch = cleaned.match(/^(?:id:)?(\d+)$/i);
  if (idMatch) return { kind: 'id', id: Number(idMatch[1]) };

  return { kind: 'invalid' };
};

// A readable name for a pasted link, taken from the file name
const nameFromUrl = (url: string): string => {
  try {
    const last = decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() ?? '');
    return last.replace(/\.jar$/i, '') || url;
  } catch {
    return url;
  }
};

export const resolveMods = async (inputs: (string | number)[]): Promise<{ rows: ModRow[]; errors: ModError[] }> => {
  const visitedIds = new Set<number>();
  const visitedUrls = new Set<string>();
  const rows: ModRow[] = [];
  const errors: ModError[] = [];

  const resolveOne = async (input: string | number, dependencyOf?: string): Promise<void> => {
    const parsed = parseInput(input);

    if (parsed.kind === 'invalid') {
      errors.push({ input, error: 'expected a product ID or a link', dependencyOf });
      return;
    }

    // Link: use as is
    if (parsed.kind === 'url') {
      if (visitedUrls.has(parsed.url)) return;
      visitedUrls.add(parsed.url);
      rows.push({ name: nameFromUrl(parsed.url), source: 'direct', link: parsed.url, type: 'both' });
      return;
    }

    if (visitedIds.has(parsed.id)) return;
    visitedIds.add(parsed.id);

    try {
      const mod = await getMod(parsed.id);
      if (!mod) {
        errors.push({ input, error: 'not found', dependencyOf });
        return;
      }

      const file = await pickFile(mod);
      if (!file) {
        errors.push({ input, error: `${mod.name}: no ${GAME_VERSION} Fabric file`, dependencyOf });
        return;
      }

      rows.push({ id: mod.id, name: mod.name, ...(await resolveDownload(mod, file)), type: getType(file) });

      if (!INCLUDE_DEPENDENCIES) return;

      const requiredDeps = file.dependencies.filter(d => d.relationType === FileRelationType.RequiredDependency);
      for (const dep of requiredDeps) {
        await resolveOne(dep.modId, mod.name);
      }
    } catch (err) {
      errors.push({ input, error: err instanceof Error ? err.message : 'unknown error', dependencyOf });
    }
  };

  for (const input of inputs) {
    await resolveOne(input);
  }

  return { rows, errors };
};
