import { GetStaticProps } from "next";
import { useState } from "react";
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
  return (
    <div style={{ padding: 16, background: "#fff" }}>
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
