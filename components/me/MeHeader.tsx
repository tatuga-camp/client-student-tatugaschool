import Image from "next/image";
import { LuCamera, LuSettings } from "react-icons/lu";
import { defaultBlurHash } from "../../data";
import { homeLanguage, profileLanguage } from "../../data/languages";
import type { Language, Student } from "../../interfaces";
import { decodeBlurhashToCanvas } from "../../utils";
import { mascotForStudent, realPhoto } from "../../utils/mascot";
import { useTimeOfDay } from "../../hook/useTimeOfDay";
import { SCENE_PALETTES } from "../../utils/timeOfDay";
import { TabHeader } from "../app/TabHeader";
import MascotAvatar from "../student/MascotAvatar";

type Props = {
  student: Student;
  lang: Language;
  active: boolean;
  onEditPhoto: () => void;
  onOpenSettings: () => void;
};

/** The tall sky band with the gear, the photo and the mascot beside it. */
export default function MeHeader({
  student,
  lang,
  active,
  onEditPhoto,
  onOpenSettings,
}: Props) {
  // The gear sits on the sky: dark on the light morning one, like the title.
  const palette = useTimeOfDay()?.palette ?? SCENE_PALETTES.noon;
  const initials =
    (Array.from(student.firstName ?? "")[0] ?? "") +
    (Array.from(student.lastName ?? "")[0] ?? "");
  // A mascot picked as the "photo" is not a picture to show here.
  const photo = realPhoto(student.photo);
  const label = profileLanguage.profilePhoto(lang);

  return (
    <>
      <TabHeader title={homeLanguage.tabMe(lang)} tall />
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label={profileLanguage.settings(lang)}
        className="absolute right-1.5 z-[4] flex h-11 w-11 items-center justify-center"
        style={{
          color: palette.statusText === "dark" ? "#383767" : "#FFFFFF",
          top: "max(32px, calc(var(--safe-top) + 4px))",
        }}
      >
        <LuSettings size={22} />
      </button>
      <button
        type="button"
        onClick={onEditPhoto}
        aria-label={label}
        className="absolute left-1/2 z-[3] -ml-[46px] h-[92px] w-[92px]"
        style={{ top: "max(58px, calc(var(--safe-top) + 11px))" }}
      >
        <span
          className="relative grid h-full w-full place-items-center overflow-hidden rounded-full border-4 border-white text-3xl font-bold text-white"
          style={{
            background: "linear-gradient(135deg, #FFD3A5, #FD6585)",
            boxShadow: "0 6px 14px rgba(0,0,0,.15)",
          }}
        >
          {photo ? (
            <Image
              src={photo}
              alt={`${student.firstName} - ${label}`}
              fill
              sizes="92px"
              className="object-cover"
              placeholder="blur"
              blurDataURL={decodeBlurhashToCanvas(
                student.blurHash ?? defaultBlurHash,
              )}
            />
          ) : (
            initials
          )}
        </span>
        <span className="absolute -right-0.5 bottom-0.5 grid h-[26px] w-[26px] place-items-center rounded-full border-[3px] border-white bg-warning-color text-[#383767]">
          <LuCamera size={12} aria-hidden />
        </span>
      </button>
      <div
        className="absolute left-1/2 z-[4] ml-10 h-[74px] w-[74px] drop-shadow-[0_4px_6px_rgba(0,0,0,.2)]"
        style={{ top: "max(96px, calc(var(--safe-top) + 49px))" }}
      >
        <MascotAvatar
          clips={mascotForStudent(student)}
          alt={student.firstName}
          id={`${student.id}:me`}
          tapToPlay
          idle={active}
          sizes="74px"
        />
      </div>
    </>
  );
}
