import Database from "@tauri-apps/plugin-sql";
import { MediaItem } from "./types";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:media_tracker.db");
  }
  return db;
}

export async function addMedia(
  item: Omit<MediaItem, "id" | "created_at" | "updated_at">
): Promise<void> {
  const database = await getDb();
  await database.execute(
    `INSERT INTO media
      (tmdb_id, media_type, title, poster_path, backdrop_path, overview,
       release_date, genres, vote_average, status, user_rating, user_notes,
       watched_date, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, datetime('now'))
     ON CONFLICT(tmdb_id, media_type) DO UPDATE SET
       title = excluded.title,
       poster_path = excluded.poster_path,
       backdrop_path = excluded.backdrop_path,
       overview = excluded.overview,
       release_date = excluded.release_date,
       genres = excluded.genres,
       vote_average = excluded.vote_average,
       status = excluded.status,
       user_rating = COALESCE(excluded.user_rating, media.user_rating),
       user_notes = COALESCE(excluded.user_notes, media.user_notes),
       watched_date = COALESCE(excluded.watched_date, media.watched_date),
       updated_at = datetime('now')`,
    [
      item.tmdb_id,
      item.media_type,
      item.title,
      item.poster_path,
      item.backdrop_path,
      item.overview,
      item.release_date,
      item.genres,
      item.vote_average,
      item.status,
      item.user_rating,
      item.user_notes,
      item.watched_date,
    ]
  );
}

export async function updateMedia(
  id: number,
  updates: Partial<MediaItem>
): Promise<void> {
  const database = await getDb();
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  const allowedFields = [
    "status",
    "user_rating",
    "user_notes",
    "watched_date",
  ] as const;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = $${paramIndex}`);
      values.push(updates[field]);
      paramIndex++;
    }
  }

  if (fields.length === 0) return;

  fields.push(`updated_at = datetime('now')`);
  values.push(id);

  await database.execute(
    `UPDATE media SET ${fields.join(", ")} WHERE id = $${paramIndex}`,
    values
  );
}

export async function deleteMedia(id: number): Promise<void> {
  const database = await getDb();
  await database.execute("DELETE FROM media WHERE id = $1", [id]);
}

export async function getMediaByStatus(
  status: "watched" | "watchlist"
): Promise<MediaItem[]> {
  const database = await getDb();
  return await database.select<MediaItem[]>(
    "SELECT * FROM media WHERE status = $1 ORDER BY updated_at DESC",
    [status]
  );
}

export async function getAllMedia(): Promise<MediaItem[]> {
  const database = await getDb();
  return await database.select<MediaItem[]>(
    "SELECT * FROM media ORDER BY updated_at DESC"
  );
}

export async function getMediaByTmdbId(
  tmdbId: number,
  mediaType: string
): Promise<MediaItem | null> {
  const database = await getDb();
  const results = await database.select<MediaItem[]>(
    "SELECT * FROM media WHERE tmdb_id = $1 AND media_type = $2",
    [tmdbId, mediaType]
  );
  return results.length > 0 ? results[0] : null;
}

export async function getTopRatedMedia(limit = 5): Promise<MediaItem[]> {
  const database = await getDb();
  return await database.select<MediaItem[]>(
    "SELECT * FROM media WHERE status = 'watched' AND user_rating IS NOT NULL AND user_rating >= 3 ORDER BY user_rating DESC, updated_at DESC LIMIT $1",
    [limit]
  );
}
