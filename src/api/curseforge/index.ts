import axios, { AxiosResponse } from 'axios';

import type { Mod, ModFile, ModsSearchParams, SearchResponse } from './types';

export const curseforge = axios.create({
  baseURL: 'https://api.curseforge.com/v1',
  headers: { 'x-api-key': process.env.CURSEFORGE_API_KEY },
});

export const getMods = (params: ModsSearchParams) =>
  curseforge
    .get<SearchResponse, AxiosResponse<SearchResponse>, never, ModsSearchParams>('/mods/search', { params })
    .then(res => res.data.data);

export const getMod = (id: number) =>
  curseforge.get<{ data: Mod }, AxiosResponse<{ data: Mod }>>(`/mods/${id}`).then(res => res.data.data);

export const getModFile = (modId: number, fileId: number) =>
  curseforge
    .get<{ data: ModFile }, AxiosResponse<{ data: ModFile }>>(`/mods/${modId}/files/${fileId}`)
    .then(res => res.data.data);
