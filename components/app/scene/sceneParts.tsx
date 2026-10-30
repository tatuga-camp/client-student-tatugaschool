import { animated, SpringValues, to } from "@react-spring/web";

export type SceneTarget = {
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
  sx: number;
  sy: number;
  cutR: number;
  glowR: number;
  glowOp: number;
  starOp: number;
  winDim: number;
  c0x: number;
  c0y: number;
  c0op: number;
  c1x: number;
  c1y: number;
  c1op: number;
  c2x: number;
  c2y: number;
  c2op: number;
};

export type SceneSpring = SpringValues<SceneTarget>;

export type CloudShape = {
  rx: number;
  ry: number;
  bumps: [number, number, number][];
};

const WIN_XY: [number, number, boolean][] = [
  [10, 34, false],
  [28, 34, true],
  [54, 34, false],
  [72, 34, true],
  [10, 52, true],
  [72, 52, false],
];

export function Cloud({
  s,
  slot,
  shape,
  slow,
}: {
  s: SceneSpring;
  slot: 0 | 1 | 2;
  shape: CloudShape;
  slow: boolean;
}) {
  const x = s[`c${slot}x`];
  const y = s[`c${slot}y`];
  const op = s[`c${slot}op`];
  return (
    <animated.g
      transform={to([x, y], (a, b) => `translate(${a} ${b})`)}
      opacity={op}
    >
      <g className={slow ? "tgs-drift tgs-slow" : "tgs-drift"}>
        <animated.g fill={s.cloud}>
          <ellipse rx={shape.rx} ry={shape.ry} />
          {shape.bumps.map(([cx, cy, r]) => (
            <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </animated.g>
      </g>
    </animated.g>
  );
}

export function Stars({
  s,
  stars,
  twinkle,
}: {
  s: SceneSpring;
  twinkle: boolean;
  stars: { cx: number; cy: number; r: number; delay: number }[];
}) {
  return (
    <animated.g opacity={s.starOp}>
      {stars.map((st) => (
        <circle
          key={`${st.cx}${st.cy}`}
          className={twinkle ? "tgs-star tgs-twinkle" : "tgs-star"}
          cx={st.cx}
          cy={st.cy}
          r={st.r}
          style={{ animationDelay: `${st.delay}s` }}
        />
      ))}
    </animated.g>
  );
}

// Firefly dots by the tree, night only (phone mockup).
export function Fireflies({
  s,
  twinkle,
}: {
  s: SceneSpring;
  twinkle: boolean;
}) {
  return (
    <animated.g opacity={s.starOp}>
      <animated.circle
        className={twinkle ? "tgs-star tgs-twinkle" : "tgs-star"}
        cx={214}
        cy={232}
        r={1.6}
        style={{ fill: s.firefly, animationDuration: "1.4s" }}
      />
      <animated.circle
        className={twinkle ? "tgs-star tgs-twinkle" : "tgs-star"}
        cx={262}
        cy={250}
        r={1.4}
        style={{
          fill: s.firefly,
          animationDuration: "1.8s",
          animationDelay: ".5s",
        }}
      />
    </animated.g>
  );
}

export function School({
  s,
  transform,
}: {
  s: SceneSpring;
  transform: string;
}) {
  return (
    <g transform={transform}>
      <animated.line
        x1={46}
        y1={2}
        x2={46}
        y2={-26}
        stroke={s.pole}
        strokeWidth={1.5}
      />
      <g className="tgs-flag">
        <animated.path d="M46 -26 h18 l-4 6 l4 6 h-18 z" fill={s.flag} />
      </g>
      <animated.path d="M-4 26 L46 2 L96 26 Z" fill={s.roof} />
      <animated.rect x={2} y={24} width={88} height={62} rx={3} fill={s.wall} />
      <animated.circle cx={46} cy={15} r={5} fill={s.cupola} />
      {WIN_XY.map(([x, y, dim]) => (
        <animated.rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={12}
          height={10}
          rx={2}
          fill={s.window}
          opacity={dim ? s.winDim : 1}
        />
      ))}
      <animated.rect
        x={40}
        y={56}
        width={12}
        height={30}
        rx={2}
        fill={s.door}
      />
    </g>
  );
}

export function Tree({ s, transform }: { s: SceneSpring; transform: string }) {
  return (
    <g transform={transform}>
      <g className="tgs-sway">
        <animated.rect
          x={-4}
          y={16}
          width={8}
          height={42}
          rx={3}
          fill={s.trunk}
        />
        <animated.g fill={s.leaf}>
          <animated.circle cx={0} cy={8} r={22} />
          <animated.circle cx={-15} cy={22} r={14} />
          <animated.circle cx={15} cy={20} r={15} />
        </animated.g>
      </g>
    </g>
  );
}
