export interface ThemeData {
  bgImageDataUrl: string | null;
  accentRgb: string;
  accentLightRgb: string;
  palette: Record<string, string>;
}

const STORAGE_KEY = "media-tracker-theme";

export function getDefaultTheme(): ThemeData {
  return {
    bgImageDataUrl: null,
    accentRgb: "16 185 129",
    accentLightRgb: "110 231 183",
    palette: {
      midnight: "8 15 12",
      deep: "12 22 18",
      dark: "16 29 23",
      surface: "24 45 35",
      card: "28 51 41",
      elevated: "34 61 48",
      border: "43 77 60",
      "border-light": "58 99 80",
      muted: "74 115 96",
      subtle: "106 148 128",
      text: "143 181 162",
      "text-light": "188 216 202",
      light: "220 238 228",
    },
  };
}

export function applyTheme(theme: ThemeData): void {
  const root = document.documentElement;
  root.style.setProperty("--accent", theme.accentRgb);
  root.style.setProperty("--accent-light", theme.accentLightRgb);
  for (const [key, value] of Object.entries(theme.palette)) {
    root.style.setProperty(`--fr-${key}`, value);
  }
  root.style.setProperty(
    "--bg-url",
    theme.bgImageDataUrl
      ? `url("${theme.bgImageDataUrl}")`
      : "url('/bg.png')"
  );
}

export function saveTheme(theme: ThemeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch {
    console.error("Failed to save theme (storage full?)");
  }
}

export function loadTheme(): ThemeData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    console.error("Failed to load saved theme");
  }
  return null;
}

export async function generateThemeFromImage(file: File): Promise<ThemeData> {
  const dataUrl = await resizeImage(file, 1600, 900, 0.75);
  const { hue, saturation } = await extractDominantColor(dataUrl);

  const accentSat = Math.min(saturation + 20, 80);
  const accentRgb = rgbStr(hslToRgb(hue, accentSat, 50));
  const accentLightRgb = rgbStr(hslToRgb(hue, Math.max(accentSat - 10, 30), 72));

  return {
    bgImageDataUrl: dataUrl,
    accentRgb,
    accentLightRgb,
    palette: generatePaletteFromHue(hue, saturation),
  };
}

function generatePaletteFromHue(
  hue: number,
  sat: number
): ThemeData["palette"] {
  const s = Math.min(sat, 30);
  return {
    midnight: rgbStr(hslToRgb(hue, s, 4)),
    deep: rgbStr(hslToRgb(hue, s, 6)),
    dark: rgbStr(hslToRgb(hue, s * 0.9, 9)),
    surface: rgbStr(hslToRgb(hue, s * 0.85, 14)),
    card: rgbStr(hslToRgb(hue, s * 0.8, 16)),
    elevated: rgbStr(hslToRgb(hue, s * 0.75, 19)),
    border: rgbStr(hslToRgb(hue, s * 0.7, 24)),
    "border-light": rgbStr(hslToRgb(hue, s * 0.65, 31)),
    muted: rgbStr(hslToRgb(hue, s * 0.55, 38)),
    subtle: rgbStr(hslToRgb(hue, s * 0.55, 49)),
    text: rgbStr(hslToRgb(hue, s * 0.5, 63)),
    "text-light": rgbStr(hslToRgb(hue, s * 0.4, 79)),
    light: rgbStr(hslToRgb(hue, s * 0.3, 91)),
  };
}

function resizeImage(
  file: File,
  maxW: number,
  maxH: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function extractDominantColor(
  dataUrl: string
): Promise<{ hue: number; saturation: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 100;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);

      const buckets = Array.from({ length: 12 }, () => ({
        count: 0,
        totalH: 0,
        totalS: 0,
      }));

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] / 255;
        const g = data[i + 1] / 255;
        const b = data[i + 2] / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const l = (max + min) / 2;
        const d = max - min;

        if (l < 0.08 || l > 0.92 || d < 0.08) continue;

        const s = d / (1 - Math.abs(2 * l - 1));
        let h = 0;
        if (d !== 0) {
          if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          else if (max === g) h = ((b - r) / d + 2) / 6;
          else h = ((r - g) / d + 4) / 6;
        }

        const idx = Math.min(Math.floor(h * 12), 11);
        buckets[idx].count++;
        buckets[idx].totalH += h * 360;
        buckets[idx].totalS += s * 100;
      }

      let best = 0;
      for (let i = 1; i < 12; i++) {
        if (buckets[i].count > buckets[best].count) best = i;
      }

      const b = buckets[best];
      if (b.count === 0) {
        resolve({ hue: 150, saturation: 40 });
        return;
      }
      resolve({ hue: b.totalH / b.count, saturation: b.totalS / b.count });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = (((h % 360) + 360) % 360) / 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

function rgbStr(rgb: [number, number, number]): string {
  return `${rgb[0]} ${rgb[1]} ${rgb[2]}`;
}
