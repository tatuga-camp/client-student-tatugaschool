import { animated, to, useSpring } from "@react-spring/web";
import { useEffect, useId, useRef, useState } from "react";
import { useTimeOfDay } from "../../../hook/useTimeOfDay";
import {
  DayPeriod,
  SCENE_PALETTES,
  SUN_POSITION,
} from "../../../utils/timeOfDay";
import {
  Cloud,
  CloudShape,
  Fireflies,
  School,
  SceneTarget,
  Stars,
  Tree,
} from "./sceneParts";

type Variant = "phone" | "desktop";
type Slot = { x: number; y: number; op: number };

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function useDocumentHidden(): boolean {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const update = () => setHidden(document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return hidden;
}

const MIN_VISIBLE = 0.02;

/** False while the node is scrolled or swiped out of view. */
function useOnScreen(ref: React.RefObject<Element>): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    // A pane parked at the screen edge still reports "intersecting" with a
    // zero (or sliver) ratio, so only a real overlap counts. The cutoff is
    // also a threshold, so the callback fires whenever it is crossed.
    const observer = new IntersectionObserver(
      (entries) =>
        setVisible(
          entries[entries.length - 1].intersectionRatio >= MIN_VISIBLE,
        ),
      { threshold: [0, MIN_VISIBLE] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return visible;
}

const NONE: Slot = { x: 0, y: 0, op: 0 };

const PHONE_CLOUDS: Record<DayPeriod, [Slot, Slot, Slot]> = {
  morning: [{ x: 70, y: 92, op: 1 }, { x: 205, y: 120, op: 1 }, NONE],
  noon: [{ x: 64, y: 96, op: 1 }, { x: 170, y: 140, op: 1 }, NONE],
  afternoon: [{ x: 78, y: 100, op: 1 }, { x: 190, y: 112, op: 1 }, NONE],
  night: [{ x: 78, y: 100, op: 0 }, { x: 120, y: 138, op: 0.7 }, NONE],
};

function desktopClouds(night: boolean): [Slot, Slot, Slot] {
  const op = night ? 0.7 : 1;
  return [
    { x: 200, y: 110, op },
    { x: 700, y: 190, op },
    { x: 1010, y: 260, op },
  ];
}

// Desktop sun: the mockup values for noon and night; the other two are placed
// by hand clear of the school (scaling the phone values would hide the sun
// behind it).
const DESKTOP_SUN: Record<DayPeriod, { x: number; y: number }> = {
  morning: { x: 400, y: 250 },
  noon: { x: 900, y: 120 },
  afternoon: { x: 870, y: 200 },
  night: { x: 880, y: 130 },
};

const CONFIG = {
  phone: {
    vb: [280, 330],
    sunR: 18.5,
    glowDay: 54,
    glowNight: 46,
    moon: { rect: 30, cx: 8, cy: -6, r: 15 },
    clouds: [
      {
        rx: 24,
        ry: 9,
        bumps: [
          [-8, -6, 10],
          [7, -9, 12],
        ],
      },
      {
        rx: 18,
        ry: 7,
        bumps: [
          [-5, -5, 8],
          [6, -6, 9],
        ],
      },
    ] as CloudShape[],
    hillFar:
      "M0 222 C 40 196 80 196 120 214 C 160 230 200 196 280 206 V330 H0Z",
    hillNear:
      "M0 252 C 60 228 110 236 150 248 C 200 262 240 236 280 242 V330 H0Z",
    ground: "M-10 292 C 70 266 210 266 290 292 V330 H-10Z",
    school: "translate(14 178)",
    trees: ["translate(238 196)"],
    stars: [
      [30, 80, 1.4, 0],
      [62, 120, 1.1, 0.6],
      [110, 74, 1.6, 1.1],
      [150, 108, 1.2, 0.3],
      [176, 66, 1, 1.6],
      [252, 130, 1.4, 0.9],
      [88, 150, 1, 1.3],
      [196, 150, 1.2, 0.2],
      [40, 170, 1.3, 1.8],
    ],
  },
  desktop: {
    vb: [1100, 620],
    sunR: 44,
    glowDay: 120,
    glowNight: 110,
    moon: { rect: 60, cx: 18, cy: -14, r: 38 },
    clouds: [
      {
        rx: 70,
        ry: 24,
        bumps: [
          [-24, -16, 28],
          [20, -26, 34],
        ],
      },
      {
        rx: 50,
        ry: 18,
        bumps: [
          [-14, -12, 20],
          [16, -16, 24],
        ],
      },
      {
        rx: 40,
        ry: 14,
        bumps: [
          [-10, -10, 16],
          [12, -12, 18],
        ],
      },
    ] as CloudShape[],
    hillFar:
      "M0 420 C 160 340 300 350 460 400 C 620 450 780 340 1100 370 V620 H0Z",
    hillNear:
      "M0 480 C 200 430 380 450 560 476 C 760 504 900 440 1100 452 V620 H0Z",
    ground: "M-20 560 C 300 520 800 520 1120 560 V620 H-20Z",
    school: "translate(90 300) scale(2.2)",
    trees: ["translate(860 400) scale(2)", "translate(990 430) scale(1.5)"],
    stars: [
      [80, 90, 3, 0],
      [240, 160, 2.4, 0.6],
      [420, 70, 3.2, 1.1],
      [560, 200, 2.4, 0.3],
      [660, 110, 2.2, 1.6],
      [1020, 230, 3, 0.9],
      [340, 260, 2, 1.3],
      [760, 280, 2.4, 0.2],
      [150, 300, 2.6, 1.8],
    ],
  },
};

function targetFor(period: DayPeriod, variant: Variant): SceneTarget {
  const p = SCENE_PALETTES[period];
  const cfg = CONFIG[variant];
  const night = period === "night";
  const sun = (variant === "phone" ? SUN_POSITION : DESKTOP_SUN)[period];
  const [c0, c1, c2] =
    variant === "phone" ? PHONE_CLOUDS[period] : desktopClouds(night);
  return {
    skyTop: p.skyTop,
    skyBottom: p.skyBottom,
    sun: p.sun,
    glow: p.glow,
    cloud: p.cloud,
    hillFar: p.hillFar,
    hillNear: p.hillNear,
    wall: p.wall,
    roof: p.roof,
    window: p.window,
    trunk: p.trunk,
    leaf: p.leaf,
    ground: p.ground,
    flag: p.flag,
    pole: p.pole,
    door: p.door,
    cupola: p.cupola,
    firefly: p.firefly,
    sx: sun.x,
    sy: sun.y,
    cutR: night ? cfg.moon.r : 0,
    glowR: night ? cfg.glowNight : cfg.glowDay,
    glowOp: night ? 0.6 : 1,
    starOp: night ? 1 : 0,
    winDim: night ? 0.35 : 1,
    c0x: c0.x,
    c0y: c0.y,
    c0op: c0.op,
    c1x: c1.x,
    c1y: c1.y,
    c1op: c1.op,
    c2x: c2.x,
    c2y: c2.y,
    c2op: c2.op,
  };
}

function Scene({
  variant,
  period,
  className,
}: {
  variant: Variant;
  period: DayPeriod;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const reduced = usePrefersReducedMotion();
  const hidden = useDocumentHidden();
  const rootRef = useRef<SVGSVGElement>(null);
  const onScreen = useOnScreen(rootRef);
  const s = useSpring({
    to: targetFor(period, variant),
    config: { tension: 120, friction: 26 },
  });
  const cfg = CONFIG[variant];
  const [w, h] = cfg.vb;
  const sky = `sky-${uid}`;
  const glow = `glow-${uid}`;
  const moon = `moon-${uid}`;

  return (
    <svg
      ref={rootRef}
      className={[
        variant === "desktop" ? "tgs-desktop" : "tgs-phone",
        !reduced && !hidden && onScreen ? "tgs-loops" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
          <animated.stop offset="0" stopColor={s.skyTop} />
          <animated.stop offset="1" stopColor={s.skyBottom} />
        </linearGradient>
        <radialGradient id={glow}>
          <animated.stop offset="0" stopColor={s.glow} stopOpacity={0.85} />
          <animated.stop offset="1" stopColor={s.glow} stopOpacity={0} />
        </radialGradient>
        <mask id={moon}>
          <rect
            x={-cfg.moon.rect}
            y={-cfg.moon.rect}
            width={cfg.moon.rect * 2}
            height={cfg.moon.rect * 2}
            fill="#fff"
          />
          <animated.circle
            cx={cfg.moon.cx}
            cy={cfg.moon.cy}
            r={s.cutR}
            fill="#000"
          />
        </mask>
      </defs>
      <rect width={w} height={h} fill={`url(#${sky})`} />
      <Stars
        s={s}
        twinkle={period === "night"}
        stars={cfg.stars.map(([cx, cy, r, delay]) => ({ cx, cy, r, delay }))}
      />
      <animated.g
        transform={to([s.sx, s.sy], (x, y) => `translate(${x} ${y})`)}
      >
        <animated.g opacity={s.glowOp}>
          <animated.circle
            className="tgs-glow"
            r={s.glowR}
            fill={`url(#${glow})`}
          />
        </animated.g>
        <animated.circle r={cfg.sunR} fill={s.sun} mask={`url(#${moon})`} />
      </animated.g>
      {cfg.clouds.map((shape, i) => (
        <Cloud
          key={i}
          s={s}
          slot={i as 0 | 1 | 2}
          shape={shape}
          slow={i === 1}
        />
      ))}
      <animated.path d={cfg.hillFar} fill={s.hillFar} />
      <School s={s} transform={cfg.school} />
      <animated.path d={cfg.hillNear} fill={s.hillNear} />
      {cfg.trees.map((t) => (
        <Tree key={t} s={s} transform={t} />
      ))}
      {variant === "phone" && <Fireflies s={s} twinkle={period === "night"} />}
      <animated.path d={cfg.ground} fill={s.ground} />
    </svg>
  );
}

export function SchoolyardScene({
  variant,
  className,
  period,
}: {
  variant: Variant;
  className?: string;
  /** Forces a period. Used only by the dev preview page. */
  period?: DayPeriod;
}) {
  const tod = useTimeOfDay();
  const resolved = period ?? tod?.period;
  if (!resolved) {
    return <div className={className} style={{ background: "#F7F8FA" }} />;
  }
  return <Scene variant={variant} period={resolved} className={className} />;
}
