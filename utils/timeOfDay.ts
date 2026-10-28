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

// Phone viewBox 0 0 280 330. At night this is the moon.
export const SUN_POSITION: Record<DayPeriod, { x: number; y: number }> = {
  morning: { x: 52, y: 150 },
  noon: { x: 222, y: 92 },
  afternoon: { x: 232, y: 160 },
  night: { x: 220, y: 92 },
};
