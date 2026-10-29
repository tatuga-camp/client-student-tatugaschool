export type DayPeriod = "morning" | "noon" | "afternoon" | "night";

export function dayPeriod(date: Date): DayPeriod {
  const h = date.getHours();
  if (h >= 5 && h < 11) return "morning";
  if (h >= 11 && h < 13) return "noon";
  if (h >= 13 && h < 18) return "afternoon";
  return "night";
}

export type ScenePalette = {
  skyTop: string;
  skyBottom: string;
  sun: string;
  glow: string;
  cloud: string;
  hillFar: string;
  hillNear: string;
  wall: string;
  roof: string;
  window: string;
  trunk: string;
  leaf: string;
  ground: string;
  flag: string;
  pole: string;
  door: string;
  cupola: string;
  firefly: string;
  statusText: "light" | "dark";
};

export const SCENE_PALETTES: Record<DayPeriod, ScenePalette> = {
  morning: {
    skyTop: "#9CCBFF",
    skyBottom: "#FFE2B8",
    sun: "#FFB547",
    glow: "#FFD38A",
    cloud: "#FFFFFF",
    hillFar: "#B5DDC0",
    hillNear: "#8FCB9B",
    wall: "#FFF4E2",
    roof: "#E8774E",
    window: "#BFE0FF",
    trunk: "#9A6B45",
    leaf: "#6DBE7A",
    ground: "#A6DB86",
    flag: "#2C7CD1",
    pole: "#8A8FA8",
    door: "#E8774E",
    cupola: "#FFF4E2",
    firefly: "#FFE98A",
    statusText: "dark",
  },
  noon: {
    skyTop: "#2F86F0",
    skyBottom: "#A9D8FF",
    sun: "#FFE15A",
    glow: "#FFF3B0",
    cloud: "#FFFFFF",
    hillFar: "#86CF8C",
    hillNear: "#5DBB6A",
    wall: "#FFFFFF",
    roof: "#2C7CD1",
    window: "#A9D8FF",
    trunk: "#8A5A35",
    leaf: "#4FB15E",
    ground: "#7FD36E",
    flag: "#FFCD1B",
    pole: "#8A8FA8",
    door: "#2C7CD1",
    cupola: "#FFFFFF",
    firefly: "#FFE98A",
    statusText: "light",
  },
  afternoon: {
    skyTop: "#5E9BE0",
    skyBottom: "#FFC58C",
    sun: "#FF9A3D",
    glow: "#FFC27A",
    cloud: "#FFF1E0",
    hillFar: "#C6C78B",
    hillNear: "#A3B86A",
    wall: "#FFEBD2",
    roof: "#D9663B",
    window: "#FFE1B0",
    trunk: "#8A5A35",
    leaf: "#7FA94F",
    ground: "#B8C873",
    flag: "#2C7CD1",
    pole: "#8A8FA8",
    door: "#D9663B",
    cupola: "#FFEBD2",
    firefly: "#FFE98A",
    statusText: "light",
  },
  night: {
    skyTop: "#0C1440",
    skyBottom: "#2D3C7E",
    sun: "#F4F1D0",
    glow: "#9FB2FF",
    cloud: "#3A4A8A",
    hillFar: "#233163",
    hillNear: "#1B2753",
    wall: "#3A4677",
    roof: "#27305E",
    window: "#FFD970",
    trunk: "#1D2347",
    leaf: "#20305E",
    ground: "#223069",
    flag: "#2C7CD1",
    pole: "#5C6494",
    door: "#151C40",
    cupola: "#FFD970",
    firefly: "#FFE98A",
    statusText: "light",
  },
};

type Point = { x: number; y: number };

const PHONE_VIEWBOX = { width: 280, height: 330 };
const SUN_RADIUS = 18.5;

// Phone viewBox 0 0 280 330. At night this is the moon. Drawn 390 wide, the
// top ~93 units of the sky are cropped on Home (see sunDisc), so the high
// noon sun and the moon sit just below the status bar: beside the bell,
// above the greeting.
export const SUN_POSITION: Record<DayPeriod, Point> = {
  morning: { x: 52, y: 150 },
  noon: { x: 222, y: 151 },
  afternoon: { x: 232, y: 160 },
  night: { x: 220, y: 151 },
};

/**
 * /welcome's scene is 30 px shorter (more sky cropped) and its top corners
 * hold the badge and the TH/EN pill: the noon sun and the moon sit between
 * them, below the status bar.
 */
export const WELCOME_SUN_POSITION: Record<DayPeriod, Point> = {
  ...SUN_POSITION,
  noon: { x: 172, y: 176 },
  night: { x: 170, y: 176 },
};

/**
 * The sun's disc on screen, in px from the scene's top-left, for a phone
 * scene drawn into `box` with xMidYMax slice (the top of the sky is cropped).
 */
export function sunDisc(
  at: Point,
  box: { width: number; height: number },
): { left: number; top: number; right: number; bottom: number } {
  const scale = Math.max(
    box.width / PHONE_VIEWBOX.width,
    box.height / PHONE_VIEWBOX.height,
  );
  const cropX = (PHONE_VIEWBOX.width * scale - box.width) / 2;
  const cropY = PHONE_VIEWBOX.height * scale - box.height;
  const cx = at.x * scale - cropX;
  const cy = at.y * scale - cropY;
  const r = SUN_RADIUS * scale;
  return {
    left: Math.round(cx - r),
    top: Math.round(cy - r),
    right: Math.round(cx + r),
    bottom: Math.round(cy + r),
  };
}

/**
 * `hex` (#RRGGBB) mixed `amount` of the way toward white, e.g. the header
 * band's lower sky is lighten(skyTop, 0.25). Mixing never blows a light
 * morning sky out to pure white.
 */
export function lighten(hex: string, amount: number): string {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16);
    return Math.round(c + (255 - c) * amount)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(1)}${channel(3)}${channel(5)}`.toUpperCase();
}
