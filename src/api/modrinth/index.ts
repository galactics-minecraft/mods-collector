import axios, { AxiosResponse } from 'axios';

import type { ModrinthProject, ModrinthSearchResponse, ModrinthVersion } from './types';

export const modrinth = axios.create({
  baseURL: 'https://api.modrinth.com/v2',
  // Modrinth asks for a identifying User-Agent
  headers: { 'User-Agent': 'OmarLawaty/mod-links-script' },
});

export const getModrinthProject = (slugOrId: string) =>
  modrinth
    .get<ModrinthProject, AxiosResponse<ModrinthProject>>(`/project/${encodeURIComponent(slugOrId)}`)
    .then(res => res.data)
    .catch(err => {
      if (axios.isAxiosError(err) && err.response?.status === 404) return undefined;
      throw err;
    });

export const searchModrinth = (query: string, gameVersion: string, loader: string) =>
  modrinth
    .get<ModrinthSearchResponse, AxiosResponse<ModrinthSearchResponse>>('/search', {
      params: {
        query,
        limit: 5,
        facets: JSON.stringify([['project_type:mod'], [`versions:${gameVersion}`], [`categories:${loader}`]]),
      },
    })
    .then(res => res.data.hits);

// Newest first
export const getModrinthVersions = (projectId: string, gameVersion: string, loader: string) =>
  modrinth
    .get<ModrinthVersion[], AxiosResponse<ModrinthVersion[]>>(`/project/${projectId}/version`, {
      params: {
        loaders: JSON.stringify([loader]),
        game_versions: JSON.stringify([gameVersion]),
      },
    })
    .then(res => res.data);
