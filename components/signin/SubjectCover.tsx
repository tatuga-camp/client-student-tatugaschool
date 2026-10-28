import Image from "next/image";
import { useRouter } from "next/router";
import { LuArrowLeft, LuCalculator, LuMail } from "react-icons/lu";
import { defaultBlurHash } from "../../data";
import { subjectDataLanguage as t } from "../../data/languages";
import { Language, TeacherOnSubject } from "../../interfaces";
import { ResponseGetSubjectByCodeService } from "../../services";
import { decodeBlurhashToCanvas } from "../../utils";
import { LanguagePill } from "./LanguagePill";

type Props = {
  subject: ResponseGetSubjectByCodeService;
  lang: Language;
  onTeachers: () => void;
};

// Darkens the lower half so white text on it stays readable (4.5:1).
const SCRIM = "linear-gradient(rgba(10,25,60,.15), rgba(10,25,60,.5))";

/** Escape only what would end a quoted CSS url(). */
const cssUrl = (url: string) =>
  url.replace(/["\\]/g, "\\$&").replace(/\r?\n/g, "\\A ");

function TeacherAvatar({ teacher }: { teacher: TeacherOnSubject }) {
  return (
    <span className="relative -mr-1 h-5 w-5 overflow-hidden rounded-full ring-2 ring-white/80">
      <Image
        src={teacher.photo}
        alt=""
        fill
        sizes="20px"
        placeholder="blur"
        blurDataURL={decodeBlurhashToCanvas(
          teacher.blurHash ?? defaultBlurHash,
        )}
        className="object-cover"
      />
    </span>
  );
}

/** The subject's cover: image or gradient, back, language, title, teachers. */
export function SubjectCover({ subject, lang, onTeachers }: Props) {
  const router = useRouter();
  const shown = subject.teacherOnSubjects.slice(0, 2);
  return (
    <div
      className="relative flex min-h-[168px] shrink-0 flex-col overflow-hidden text-white"
      style={{
        paddingTop: "var(--safe-top)",
        background: subject.backgroundImage
          ? `${SCRIM}, url("${cssUrl(subject.backgroundImage)}") center/cover`
          : `${SCRIM}, linear-gradient(135deg, #569DF8, #2C7CD1)`,
      }}
    >
      <LuCalculator
        aria-hidden
        className="absolute -right-3.5 top-[30px] text-[120px] text-white/[.14]"
      />
      <div className="relative z-[1] flex items-center justify-between px-3.5">
        <button
          type="button"
          aria-label={t.back(lang)}
          onClick={() => router.push("/welcome")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25"
        >
          <LuArrowLeft aria-hidden />
        </button>
        <LanguagePill />
      </div>
      <div className="relative z-[1] mt-auto px-[18px] pb-7 pt-2">
        <h1 className="text-lg font-extrabold leading-tight">
          {subject.title}
        </h1>
        <p className="text-xs font-semibold opacity-90">
          {subject.code.toUpperCase()} · {subject.educationYear}
        </p>
        {shown.length > 0 && (
          <button
            type="button"
            onClick={onTeachers}
            className="mt-2 inline-flex min-h-[32px] max-w-full items-center gap-1.5 rounded-full bg-white/25 py-1 pl-1.5 pr-2.5 text-xs font-semibold"
          >
            <span className="flex">
              {shown.map((teacher) => (
                <TeacherAvatar key={teacher.id} teacher={teacher} />
              ))}
            </span>
            <span className="truncate">
              {shown.map((teacher) => teacher.firstName).join(", ")}
            </span>
            <LuMail aria-hidden className="shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}
