import { useRouter } from "next/router";
import { subjectDataLanguage as t } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { mascotForPhoto } from "../../utils/mascot";
import MascotAvatar from "../student/MascotAvatar";
import { LanguagePill } from "./LanguagePill";

const CLIPS = mascotForPhoto("https://storage.tatugaschool.com/AVATAR/1.png");

/** Shown when the code in the link matches no class. */
export function SubjectNotFound() {
  const router = useRouter();
  const lang = useGetLanguage().data ?? "en";
  return (
    <main
      className="app-scroll hideScrollBar flex h-full w-full flex-col items-center bg-[#F7F8FA] px-6 font-Anuphan"
      style={{
        paddingTop: "calc(var(--safe-top) + 8px)",
        paddingBottom: "calc(var(--safe-bottom) + 16px)",
      }}
    >
      <div className="flex w-full justify-end">
        <LanguagePill />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {CLIPS && (
          <div className="relative h-32 w-32">
            <MascotAvatar
              clips={CLIPS}
              alt=""
              id="not-found"
              idle={false}
              reactOnMount="sad"
              sizes="128px"
            />
          </div>
        )}
        <h1 className="mt-4 text-xl font-extrabold text-[#383767]">
          {t.notFoundTitle(lang)}
        </h1>
        <p className="mt-1 max-w-xs text-sm text-[#7A80A0]">
          {t.notFoundDescription(lang)}
        </p>
        <button
          type="button"
          onClick={() => router.push("/welcome")}
          className="chunky-btn mt-6"
        >
          {t.tryAnotherCode(lang)}
        </button>
      </div>
    </main>
  );
}
