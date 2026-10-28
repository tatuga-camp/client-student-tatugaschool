import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef } from "react";
import {
  assignmentPageLanguage,
  classworkDataLanguage,
} from "../../data/languages";
import {
  useGetAssignments,
  useGetLanguage,
  useGetSubjectById,
} from "../../react-query";
import { TAB_BODY_CLASS } from "../app/TabHeader";
import { type DetailPaneProps, useShellNav } from "../app/shell/useShellRoute";
import TextEditor from "../common/TextEditor";
import DetailHeader from "./DetailHeader";
import { LegacyVideoQuiz } from "./LegacyVideoQuiz";
import { LegacyWorkPanels } from "./LegacyWorkPanels";
import TeacherFiles from "./TeacherFiles";
import TitleCard from "./TitleCard";
import { useDetailFocus } from "./useDetailFocus";

const sectionLabel =
  "mx-0.5 mb-1.5 mt-1 text-[10px] font-bold uppercase tracking-wider text-[#7A80A0]";

/** Rich text with no visible content (editors leave "<p></p>" behind). */
function hasContent(html: string | null | undefined): boolean {
  if (!html) return false;
  if (/<(img|iframe|video|audio)\b/i.test(html)) return true;
  return html.replace(/<[^>]*>|&nbsp;/g, "").trim().length > 0;
}

function DetailSkeleton() {
  const bar = "rounded-lg bg-[#E3E8F0] motion-safe:animate-pulse";
  return (
    <div aria-hidden className="flex flex-col gap-3">
      <div className="chunky p-3">
        <div className={`${bar} h-4 w-1/3`} />
        <div className={`${bar} mt-3 h-5 w-4/5`} />
        <div className={`${bar} mt-3 h-4 w-2/3`} />
      </div>
      <div className="chunky p-3">
        <div className={`${bar} h-3 w-full`} />
        <div className={`${bar} mt-2 h-3 w-5/6`} />
        <div className={`${bar} mt-2 h-3 w-2/3`} />
      </div>
    </div>
  );
}

/**
 * The assignment page: sky header with back, title card, instructions and
 * the teacher's files. Still the legacy panels underneath until Part 3
 * Tasks 3-6 replace them.
 */
export default function AssignmentDetail({
  subjectId,
  assignmentId,
}: DetailPaneProps) {
  const nav = useShellNav();
  const router = useRouter();
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const subject = useGetSubjectById({ id: subjectId });
  const assignments = useGetAssignments({ subjectId });
  const assignment = assignments.data?.find((item) => item.id === assignmentId);
  const pageRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  useDetailFocus(backRef, pageRef);

  const isQuiz = assignment?.type === "Quiz";
  useEffect(() => {
    if (isQuiz) router.replace(`/subject/${subjectId}/quiz/${assignmentId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuiz]);

  // "Not found" only once the list has loaded (or failed) without it.
  const loading = assignments.isPending || isQuiz;
  const item = assignment;

  return (
    <div ref={pageRef} className="flex h-full w-full flex-col font-Anuphan">
      {item && (
        <Head>
          <title>Assignment: {item.title}</title>
        </Head>
      )}
      <DetailHeader
        ref={backRef}
        title={subject.data?.title ?? ""}
        lang={lang}
        onBack={nav.back}
      />
      <div
        className={TAB_BODY_CLASS}
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="flex flex-col gap-3 px-3 pb-6 pt-4">
          {loading ? (
            <DetailSkeleton />
          ) : !item ? (
            <h2 className="py-10 text-center text-base font-bold text-icon-color">
              {classworkDataLanguage.notFound(lang)}
            </h2>
          ) : (
            <>
              {item.type === "VideoQuiz" && item.videoURL && (
                <LegacyVideoQuiz assignment={item} subjectId={subjectId} />
              )}
              <TitleCard assignment={item} lang={lang} now={new Date()} />
              {(item.type === "Assignment" || item.type === "Material") &&
                hasContent(item.description) && (
                  <section>
                    <h3 className={sectionLabel}>
                      {assignmentPageLanguage.instructions(lang)}
                    </h3>
                    <div className="chunky overflow-hidden p-1">
                      <div className="h-60 lg:h-96">
                        <TextEditor
                          disabled={false}
                          schoolId={item.schoolId}
                          value={item.description}
                          onChange={() => {}}
                          menubar={false}
                          toolbar={false}
                        />
                      </div>
                    </div>
                  </section>
                )}
              {item.files?.length > 0 && (
                <section>
                  <h3 className={sectionLabel}>
                    {assignmentPageLanguage.fromTeacher(lang)}
                  </h3>
                  <TeacherFiles files={item.files} lang={lang} />
                </section>
              )}
              <LegacyWorkPanels assignment={item} subjectId={subjectId} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
