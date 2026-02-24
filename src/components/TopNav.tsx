import { Search, Film, Bookmark, Compass, Settings, BarChart3 } from "lucide-react";
import { Page } from "../lib/types";

interface TopNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  watchedCount: number;
  watchlistCount: number;
}

const navItems: {
  page: Page;
  label: string;
  icon: typeof Search;
}[] = [
  { page: "discover", label: "Discover", icon: Compass },
  { page: "search", label: "Search", icon: Search },
  { page: "library", label: "Watched", icon: Film },
  { page: "watchlist", label: "Watchlist", icon: Bookmark },
  { page: "stats", label: "Stats", icon: BarChart3 },
];

export default function TopNav({
  currentPage,
  onNavigate,
  watchedCount,
  watchlistCount,
}: TopNavProps) {
  const counts: Record<string, number> = {
    library: watchedCount,
    watchlist: watchlistCount,
  };

  return (
    <div className="flex-shrink-0 glass border-b border-fr-border/50">
      <div className="flex items-center h-14 px-6">
        <div className="flex-1" />

        <nav className="flex items-center gap-0.5">
          {navItems.map(({ page, label, icon: Icon }) => {
            const isActive = currentPage === page;
            const count = counts[page];
            return (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-accent/15 text-accent-light shadow-sm shadow-accent/10"
                    : "text-fr-text hover:bg-accent/10 hover:text-accent-light"
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
                {count !== undefined && (
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded-full leading-none ${
                      isActive
                        ? "bg-accent/25 text-accent-light"
                        : "bg-fr-surface text-fr-subtle"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex-1 flex justify-end">
          <button
            onClick={() => onNavigate("settings")}
            className={`p-2 rounded-lg transition-all ${
              currentPage === "settings"
                ? "bg-accent/15 text-accent-light"
                : "text-fr-text hover:bg-accent/10 hover:text-accent-light"
            }`}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
