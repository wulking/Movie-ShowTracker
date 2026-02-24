use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_media_table",
        sql: "CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tmdb_id INTEGER NOT NULL,
                media_type TEXT NOT NULL CHECK(media_type IN ('movie', 'tv')),
                title TEXT NOT NULL,
                poster_path TEXT,
                backdrop_path TEXT,
                overview TEXT,
                release_date TEXT,
                genres TEXT,
                vote_average REAL,
                status TEXT NOT NULL CHECK(status IN ('watched', 'watchlist')),
                user_rating INTEGER CHECK(user_rating >= 0 AND user_rating <= 5),
                user_notes TEXT,
                watched_date TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                UNIQUE(tmdb_id, media_type)
            )",
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:media_tracker.db", migrations)
                .build(),
        )
        .plugin(tauri_plugin_http::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
