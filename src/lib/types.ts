export interface TmdbSearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: "movie" | "tv";
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  vote_average: number;
  vote_count: number;
}

export interface TmdbSearchResponse {
  page: number;
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
}

export interface TmdbDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  vote_count: number;
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  tagline?: string;
}

export interface MediaItem {
  id?: number;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  genres: string;
  vote_average: number;
  status: "watched" | "watchlist";
  user_rating: number | null;
  user_notes: string | null;
  watched_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export type Page = "discover" | "search" | "library" | "watchlist" | "stats" | "settings";

export interface SelectedMedia {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
}
