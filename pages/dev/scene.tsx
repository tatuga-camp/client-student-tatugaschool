import { GetStaticProps } from "next";
import { useRef, useState } from "react";
import { CodeBoxes } from "../../components/signin/CodeBoxes";
import { Sheet } from "../../components/app/Sheet";
import { SchoolyardScene } from "../../components/app/scene/SchoolyardScene";
import Password from "../../components/common/Password";
import { Toast } from "primereact/toast";
import AppSwal from "../../utils/appSwal";
import { reportRateLimit } from "../../utils/rateLimit";
import type { DayPeriod } from "../../utils/timeOfDay";

const PERIODS: DayPeriod[] = ["morning", "noon", "afternoon", "night"];
const FILL = "absolute inset-0 h-full w-full";

export const getStaticProps: GetStaticProps = async () => {
  if (process.env.NODE_ENV === "production") return { notFound: true };
  return { props: {} };
};

export default function ScenePreview() {
  const [live, setLive] = useState<DayPeriod>("morning");
  const [peekOpen, setPeekOpen] = useState(false);
  const [nested, setNested] = useState(false);
  const toast = useRef<Toast>(null);
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [shake, setShake] = useState(0);
  const [sheet, setSheet] = useState<"auto" | "full" | null>(null);
  return (
    <div style={{ padding: 16, background: "#fff" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => setSheet("auto")} style={{ border: "1px solid #ccc", padding: "2px 8px" }}>
          Open sheet
        </button>
        <button onClick={() => setSheet("full")} style={{ border: "1px solid #ccc", padding: "2px 8px" }}>
          Full sheet
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button id="demo-swal" onClick={() => AppSwal.fire({ title: "Demo alert", icon: "info" })} style={{ border: "1px solid #ccc", padding: "2px 8px" }}>
          Swal
        </button>
        <button id="demo-toast" onClick={() => toast.current?.show({ severity: "info", summary: "Demo toast" })} style={{ border: "1px solid #ccc", padding: "2px 8px" }}>
          Toast
        </button>
        <button id="demo-429" onClick={() => reportRateLimit({ retryAfter: 20 })} style={{ border: "1px solid #ccc", padding: "2px 8px" }}>
          Rate limit
        </button>
        <Toast ref={toast} />
        <Password toggleMask feedback value={pw} onChange={(e) => setPw(e.target.value)} placeholder="password" />
      </div>
      <div style={{ maxWidth: 360, marginBottom: 12 }}>
        <CodeBoxes length={6} value={code} onChange={setCode} mode="alnum" invalid={shake > 0 && code.length < 6} shakeKey={shake} ariaLabel="Join code" />
        <button id="demo-shake" onClick={() => setShake((n) => n + 1)} style={{ border: "1px solid #ccc", padding: "2px 8px", marginTop: 8 }}>
          Shake
        </button>
      </div>
      <Sheet open={sheet !== null} onClose={() => setSheet(null)} size={sheet ?? "auto"} ariaLabel="Demo sheet">
        <h3 className="text-lg font-bold">Demo sheet</h3>
        <p className="py-4">Drag the handle down to close.</p>
        <button className="chunky-btn" onClick={() => setSheet(null)}>Done</button>
      </Sheet>
      <Sheet
        open
        onClose={() => {}}
        peek={<p data-testid="peek">Peek: drag up</p>}
        expanded={peekOpen}
        onExpandedChange={setPeekOpen}
        dismissible={false}
        ariaLabel="Peek demo"
      >
        <p>Expanded peek</p>
        <button id="open-nested" className="chunky-btn" onClick={() => setNested(true)}>Nested</button>
      </Sheet>
      <Sheet open={nested} onClose={() => setNested(false)} ariaLabel="Nested demo">
        <p className="py-4">Nested sheet</p>
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
