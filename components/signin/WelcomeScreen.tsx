import Image from "next/image";
import { defaultCanvas } from "../../data";
import { useTimeOfDay } from "../../hook/useTimeOfDay";
import { SchoolyardScene } from "../app/scene/SchoolyardScene";
import { JoinWithCode } from "./JoinWithCode";
import { LanguagePill } from "./LanguagePill";
import { WelcomeMascots } from "./WelcomeMascots";

export function WelcomeScreen() {
  const tod = useTimeOfDay();
  return (
    <div className="app-scroll hideScrollBar h-full w-full bg-[#F7F8FA] font-Anuphan">
      <div className="flex min-h-full flex-col">
        <div className="relative h-[300px] shrink-0">
          <SchoolyardScene
            variant="phone"
            period={tod?.period ?? "morning"}
            className="absolute inset-0 h-full w-full"
          />
          <div
            className="absolute inset-x-3.5 top-0 z-[5] flex items-center justify-between"
            style={{ paddingTop: "var(--safe-top)" }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm">
              <span className="relative h-5 w-5 overflow-hidden rounded-md">
                <Image
                  src="/favicon.ico"
                  placeholder="blur"
                  blurDataURL={defaultCanvas}
                  fill
                  sizes="20px"
                  alt=""
                />
              </span>
              <span className="text-xs font-extrabold uppercase text-[#2C7CD1]">
                Tatuga School
              </span>
            </span>
            <LanguagePill />
          </div>
          <WelcomeMascots />
        </div>
        <main
          className="relative z-[3] -mt-4 flex-1 rounded-t-3xl bg-white px-[18px] pt-[18px]"
          style={{ paddingBottom: "calc(var(--safe-bottom) + 16px)" }}
        >
          <JoinWithCode />
        </main>
      </div>
    </div>
  );
}
