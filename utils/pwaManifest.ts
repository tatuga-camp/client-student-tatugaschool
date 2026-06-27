export type WebAppManifest = {
  id: string;
  name: string;
  short_name: string;
  start_url: string;
  scope: string;
  display: "standalone";
  theme_color: string;
  background_color: string;
  icons: { src: string; sizes: string; type: string; purpose: string }[];
};

const THEME_COLOR = "#2C7CD1";
const BACKGROUND_COLOR = "#F7F8FA";

const ICONS: WebAppManifest["icons"] = [
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
];

function subjectUrl(code: string): string {
  return `/?subject_code=${encodeURIComponent(code)}`;
}

export function buildSubjectManifest(params: { code: string; title: string }): WebAppManifest {
  const url = subjectUrl(params.code);
  return {
    id: url,
    name: params.title,
    short_name: params.title,
    start_url: url,
    scope: "/",
    display: "standalone",
    theme_color: THEME_COLOR,
    background_color: BACKGROUND_COLOR,
    icons: ICONS,
  };
}

export function buildFallbackManifest(): WebAppManifest {
  return {
    id: "/welcome",
    name: "Tatuga School",
    short_name: "Tatuga School",
    start_url: "/welcome",
    scope: "/",
    display: "standalone",
    theme_color: THEME_COLOR,
    background_color: BACKGROUND_COLOR,
    icons: ICONS,
  };
}
