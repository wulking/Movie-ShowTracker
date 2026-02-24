import { useState, useRef } from "react";
import {
  Upload,
  RotateCcw,
  Loader2,
  Check,
  ImageIcon,
  Download,
  FolderInput,
  AlertTriangle,
} from "lucide-react";
import {
  ThemeData,
  getDefaultTheme,
  generateThemeFromImage,
} from "../lib/theme";
import { getAllMedia, addMedia } from "../lib/database";
import { MediaItem } from "../lib/types";

interface SettingsPageProps {
  theme: ThemeData;
  onThemeChange: (theme: ThemeData) => void;
  onDataChange?: () => void;
}

export default function SettingsPage({
  theme,
  onThemeChange,
  onDataChange,
}: SettingsPageProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [dataMsg, setDataMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setSuccess(null);
      const newTheme = await generateThemeFromImage(file);
      onThemeChange(newTheme);
      setSuccess("Theme applied!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Failed to generate theme:", err);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleExport() {
    try {
      setExporting(true);
      const allItems = await getAllMedia();
      const json = JSON.stringify(allItems, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `media-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDataMsg({ type: "success", text: `Exported ${allItems.length} items` });
      setTimeout(() => setDataMsg(null), 4000);
    } catch (err) {
      console.error("Export failed:", err);
      setDataMsg({ type: "error", text: "Export failed" });
    } finally {
      setExporting(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setDataMsg(null);
      const text = await file.text();
      const items: MediaItem[] = JSON.parse(text);

      if (!Array.isArray(items)) throw new Error("Invalid format");

      let count = 0;
      for (const item of items) {
        if (!item.tmdb_id || !item.media_type || !item.title) continue;
        await addMedia({
          tmdb_id: item.tmdb_id,
          media_type: item.media_type,
          title: item.title,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          overview: item.overview || "",
          release_date: item.release_date || "",
          genres: item.genres || "",
          vote_average: item.vote_average || 0,
          status: item.status || "watched",
          user_rating: item.user_rating,
          user_notes: item.user_notes,
          watched_date: item.watched_date,
        });
        count++;
      }

      setDataMsg({ type: "success", text: `Imported ${count} items` });
      setTimeout(() => setDataMsg(null), 4000);
      onDataChange?.();
    } catch (err) {
      console.error("Import failed:", err);
      setDataMsg({ type: "error", text: "Import failed — check file format" });
    } finally {
      setImporting(false);
      if (importInputRef.current) importInputRef.current.value = "";
    }
  }

  function handleReset() {
    const defaultTheme = getDefaultTheme();
    onThemeChange(defaultTheme);
    setSuccess("Reset to default theme!");
    setTimeout(() => setSuccess(null), 3000);
  }

  const bgSrc = theme.bgImageDataUrl || "/bg.png";

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 px-8 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-sm text-fr-text">Customize your experience</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4">
        <div className="max-w-xl">
          <h2 className="text-lg font-semibold text-fr-light mb-4 flex items-center gap-2">
            <ImageIcon size={20} className="text-accent" />
            Theme
          </h2>

          <div className="rounded-xl bg-fr-surface/50 border border-fr-border/30 overflow-hidden">
            <div className="relative h-44 overflow-hidden">
              <img
                src={bgSrc}
                alt="Theme background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-fr-surface/90 via-fr-surface/30 to-transparent" />
            </div>

            <div className="p-6 -mt-8 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-medium text-fr-text-light uppercase tracking-wider">
                  Palette
                </span>
                <div className="flex gap-1.5">
                  {[
                    { var: "--accent", label: "Accent" },
                    { var: "--accent-light", label: "Accent Light" },
                    { var: "--fr-surface", label: "Surface" },
                    { var: "--fr-border", label: "Border" },
                    { var: "--fr-text", label: "Text" },
                  ].map((swatch) => (
                    <div
                      key={swatch.var}
                      className="w-6 h-6 rounded-full border-2 border-white/15 transition-transform hover:scale-110"
                      style={{ background: `rgb(var(${swatch.var}))` }}
                      title={swatch.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-accent/20 text-accent-light hover:bg-accent/30 border border-accent/30 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {loading ? "Applying..." : "Upload Image"}
                </button>

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-fr-elevated text-fr-text-light hover:bg-fr-border/40 border border-fr-border/50 transition-all disabled:opacity-50"
                >
                  <RotateCcw size={16} />
                  Reset Default
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {success && (
                <div className="mt-4 px-4 py-2.5 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-accent-light flex items-center gap-2">
                    <Check size={14} />
                    {success}
                  </p>
                </div>
              )}

              <p className="mt-4 text-xs text-fr-subtle leading-relaxed">
                Upload any image to use as the app background. Colors will be
                automatically extracted to create a matching theme.
              </p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-fr-light mt-10 mb-4 flex items-center gap-2">
            <Download size={20} className="text-accent" />
            Data
          </h2>

          <div className="rounded-xl bg-fr-surface/50 border border-fr-border/30 p-6">
            <p className="text-sm text-fr-text mb-5">
              Export your library as a JSON backup, or import from a previous export.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-accent/20 text-accent-light hover:bg-accent/30 border border-accent/30 transition-all disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {exporting ? "Exporting..." : "Export Library"}
              </button>

              <button
                onClick={() => importInputRef.current?.click()}
                disabled={importing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-fr-elevated text-fr-text-light hover:bg-fr-border/40 border border-fr-border/50 transition-all disabled:opacity-50"
              >
                {importing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <FolderInput size={16} />
                )}
                {importing ? "Importing..." : "Import Backup"}
              </button>
            </div>

            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            {dataMsg && (
              <div
                className={`mt-4 px-4 py-2.5 rounded-lg border ${
                  dataMsg.type === "success"
                    ? "bg-accent/10 border-accent/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}
              >
                <p
                  className={`text-sm flex items-center gap-2 ${
                    dataMsg.type === "success"
                      ? "text-accent-light"
                      : "text-red-400"
                  }`}
                >
                  {dataMsg.type === "success" ? (
                    <Check size={14} />
                  ) : (
                    <AlertTriangle size={14} />
                  )}
                  {dataMsg.text}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
