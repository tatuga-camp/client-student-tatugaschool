import { animated, config, to, useSpring } from "@react-spring/web";
import { useEffect, useState } from "react";
import { useTimeOfDay } from "../../hook/useTimeOfDay";
import { homeLanguage } from "../../data/languages";
import { Student } from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import { mascotForStudent } from "../../utils/mascot";
import { NotificationButton } from "../app/NotificationButton";
import { SchoolyardScene } from "../app/scene/SchoolyardScene";
import { SubjectChip } from "../app/SubjectChip";
import MascotAvatar from "../student/MascotAvatar";

/** Turns true the first time `active` is, and stays true. */
function useEverActive(active: boolean): boolean {
  const [ever, setEver] = useState(active);
  useEffect(() => {
    if (active) setEver(true);
  }, [active]);
  return ever;
}

/**
 * The top 330px of Home: the schoolyard for the time of day, the chips, the
 * greeting bubble and the student's mascot, which drops in the first time
 * Home is shown.
 */
export function HomeScene({
  subjectId,
  student,
  active,
}: {
  subjectId: string;
  student: Student | undefined;
  active: boolean;
}) {
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const tod = useTimeOfDay();
  const shown = useEverActive(active);

  const drop = useSpring({
    from: { y: -50, scale: 0.85, opacity: 0 },
    to: shown
      ? { y: 0, scale: 1, opacity: 1 }
      : { y: -50, scale: 0.85, opacity: 0 },
    config: config.wobbly,
  });
  const pop = useSpring({
    from: { scale: 0.4, opacity: 0 },
    to: shown ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 },
    delay: shown ? 500 : 0,
    config: { tension: 260, friction: 14 },
  });

  const greeting =
    tod && student
      ? homeLanguage.greeting(lang, tod.period, student.firstName)
      : "";

  return (
    <div className="absolute inset-x-0 top-0 h-[330px]">
      <SchoolyardScene
        variant="phone"
        className="absolute left-0 top-0 h-full w-full"
      />
      <div
        className="absolute inset-x-3.5 z-[3] flex items-start justify-between gap-3"
        style={{ top: "calc(var(--safe-top) + 4px)" }}
      >
        <SubjectChip subjectId={subjectId} />
        <NotificationButton />
      </div>
      {greeting && (
        <animated.div
          role="status"
          className="absolute inset-x-0 top-[108px] z-[3] mx-auto w-max max-w-[88%] rounded-[14px] bg-white px-3 py-1.5 text-center text-[13px] font-bold text-icon-color shadow-[0_3px_0_rgba(0,0,0,.12)]"
          style={pop}
        >
          {greeting}
          <span
            aria-hidden
            className="absolute -bottom-1.5 left-1/2 -ml-1.5 border-x-[6px] border-t-[6px] border-x-transparent border-t-white"
          />
        </animated.div>
      )}
      <div className="absolute inset-x-0 top-[280px] z-[1] mx-auto h-3.5 w-[104px] rounded-[50%] bg-black/[.18]" />
      <animated.div
        className="absolute inset-x-0 top-[140px] z-[2] mx-auto h-[150px] w-[150px]"
        style={{
          opacity: drop.opacity,
          transform: to(
            [drop.y, drop.scale],
            (y, scale) => `translateY(${y}px) scale(${scale})`,
          ),
        }}
      >
        <div className="home-bob relative h-full w-full drop-shadow-[0_8px_10px_rgba(0,0,0,.2)]">
          {shown && student && (
            <MascotAvatar
              clips={mascotForStudent(student)}
              alt={student.firstName}
              id={student.id}
              tapToPlay
              greetOnMount
              sizes="150px"
            />
          )}
        </div>
      </animated.div>
    </div>
  );
}
