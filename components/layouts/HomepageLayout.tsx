import { UseQueryResult } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { defaultCanvas } from "../../data";
import { ResponseGetSubjectByCodeService } from "../../services";
import Footer from "../Footer";
import LanguageSelect from "../LanguageSelect";
import SubjectSummaryCard from "../student/SubjectSummaryCard";
import TeacherList from "../subject/TeacherList";

type LayoutProps = {
  children: ReactNode;
  subject: UseQueryResult<ResponseGetSubjectByCodeService, Error>;
};

/**
 * Join/landing page shell. Mirrors the teacher app's auth layout:
 * brand surface, compact brand header with language toggle, centred
 * white panels, and the shared footer.
 */
function HomepageLayout({ children, subject }: LayoutProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col bg-gradient-to-r from-primary-color to-secondary-color font-Anuphan">
      <header className="mx-auto flex w-full max-w-5xl shrink-0 items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
        <Link
          href="/welcome"
          className="flex min-w-0 items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm sm:gap-2 sm:px-3"
        >
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              sizes="24px"
              alt="logo tatuga school"
            />
          </div>
          <div className="truncate text-sm font-bold uppercase text-icon-color sm:text-base">
            Tatuga School
          </div>
        </Link>
        <LanguageSelect className="w-[9.25rem] shrink-0 border border-gray-200 shadow-sm sm:w-40" />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 pb-8 sm:px-6 sm:pb-10 lg:gap-5">
        {subject.data && <SubjectSummaryCard subject={subject.data} />}
        <section className="grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-5">
          {children}
          {subject.data && (
            <aside className="w-full lg:sticky lg:top-4">
              <TeacherList teachers={subject.data.teacherOnSubjects} />
            </aside>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default HomepageLayout;
