import { fetch } from "@tauri-apps/plugin-http";
import { TmdbSearchResponse, TmdbSearchResult, TmdbDetails } from "./types";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export async function searchMedia(
  query: string,
  page = 1
): Promise<TmdbSearchResponse> {
  const url = `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to search media");
  const data = await response.json();
  data.results = data.results.filter(
    (item: TmdbSearchResult) =>
      item.media_type === "movie" || item.media_type === "tv"
  );
  return data;
}

export async function getTrending(): Promise<TmdbSearchResult[]> {
  const url = `${BASE_URL}/trending/all/week?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch trending");
  const data = await response.json();
  return data.results.filter(
    (item: TmdbSearchResult) =>
      item.media_type === "movie" || item.media_type === "tv"
  );
}

export async function getPopularMovies(): Promise<TmdbSearchResult[]> {
  const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch popular movies");
  const data = await response.json();
  return data.results.map((item: TmdbSearchResult) => ({
    ...item,
    media_type: "movie" as const,
  }));
}

export async function getPopularTv(): Promise<TmdbSearchResult[]> {
  const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch popular TV");
  const data = await response.json();
  return data.results.map((item: TmdbSearchResult) => ({
    ...item,
    media_type: "tv" as const,
  }));
}

export async function getTopRatedMovies(): Promise<TmdbSearchResult[]> {
  const url = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch top rated movies");
  const data = await response.json();
  return data.results.map((item: TmdbSearchResult) => ({
    ...item,
    media_type: "movie" as const,
  }));
}

export async function getTopRatedTv(): Promise<TmdbSearchResult[]> {
  const url = `${BASE_URL}/tv/top_rated?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch top rated TV");
  const data = await response.json();
  return data.results.map((item: TmdbSearchResult) => ({
    ...item,
    media_type: "tv" as const,
  }));
}

export async function getRecommendations(
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<TmdbSearchResult[]> {
  const url = `${BASE_URL}/${mediaType}/${tmdbId}/recommendations?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  return (data.results || []).map((item: TmdbSearchResult) => ({
    ...item,
    media_type: item.media_type || mediaType,
  }));
}

export async function getMediaDetails(
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<TmdbDetails> {
  const url = `${BASE_URL}/${mediaType}/${tmdbId}?api_key=${API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch details");
  return response.json();
}

export function getPosterUrl(path: string | null, size = "w342"): string {
  if (!path) return "";
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size = "w1280"): string {
  if (!path) return "";
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
