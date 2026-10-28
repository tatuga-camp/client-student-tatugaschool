import { GetStaticProps } from "next";
import { useState } from "react";
import { Sheet } from "../../components/app/Sheet";
import { SchoolyardScene } from "../../components/app/scene/SchoolyardScene";
import type { DayPeriod } from "../../utils/timeOfDay";

const PERIODS: DayPeriod[] = ["morning", "noon", "afternoon", "night"];
const FILL = "absolute inset-0 h-full w-full";

export const getStaticProps: GetStaticProps = async () => {
  if (process.env.NODE_ENV === "production") return { notFound: true };
  return { props: {} };
};

export default function ScenePreview() {
  const [live, setLive] = useState<DayPeriod>("morning");
  const [sheet, setSheet] = useState<"auto" | "full" | null>(null);
  return (
    <div style={{ padding: 16, background: "#fff" }}>
      {/* Temporary overlay root: the phone frame (next task) provides the real one. */}
      <div
        id="app-overlay-root"
        style={{ position: "fixed", inset: 0, zIndex: 40, pointerEvents: "none" }}
      />
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => setSheet("auto")} style={{ border: "1px solid #ccc", padding: "2px 8px" }}>
          Open sheet
        </button>
        <button onClick={() => setSheet("full")} style={{ border: "1px solid #ccc", padding: "2px 8px" }}>
          Full sheet
        </button>
      </div>
      <Sheet open={sheet !== null} onClose={() => setSheet(null)} size={sheet ?? "auto"} ariaLabel="Demo sheet">
        <h3 className="text-lg font-bold">Demo sheet</h3>
        <p className="py-4">Drag the handle down to close.</p>
        <button className="chunky-btn" onClick={() => setSheet(null)}>Done</button>
      </Sheet>
      <h2>Phone</h2>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {PERIODS.map((p) => (
          <div key={p} style={{ width: 280, height: 330, position: "relative" }}>
            <SchoolyardScene variant="phone" period={p} className={FILL} />
          </div>
        ))}
      </div>
      <h2>Desktop</h2>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {PERIODS.map((p) => (
          <div key={p} style={{ width: 540, height: 305, position: "relative" }}>
            <SchoolyardScene variant="desktop" period={p} className={FILL} />
          </div>
        ))}
      </div>
      <h2>Live transition ({live})</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setLive(p)}
            style={{ border: "1px solid #ccc", padding: "2px 8px" }}
          >
            {p}
          </button>
        ))}
      </div>
      <div style={{ width: 280, height: 330, position: "relative" }}>
        <SchoolyardScene variant="phone" period={live} className={FILL} />
      </div>
    </div>
  );
}
