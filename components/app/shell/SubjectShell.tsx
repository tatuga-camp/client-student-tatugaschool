import { animated, useSpring } from "@react-spring/web";
import Head from "next/head";
import React, { useEffect, useRef } from "react";
import { homeLanguage } from "../../../data/languages";
import { usePushSync } from "../../../hook/usePushSync";
import {
  useGetLanguage,
  useGetStudent,
  useGetSubjectById,
} from "../../../react-query";
import { safeSet } from "../../../utils/safeStorage";
import ArchivedBanner from "../../subject/ArchivedBanner";
import { isSubjectArchived } from "../../../utils/subjectArchived";
import { ArchivedSubjectScreen } from "../ArchivedSubjectScreen";
import { StudentLoadError } from "../StudentLoadError";
import LoadingSpinner from "../../common/LoadingSpinner";
import DetailStack from "./DetailStack";
import SideNav from "./SideNav";
import TabBar from "./TabBar";
import TabPager, { inertProps } from "./TabPager";
import { ShellRoute, useShellNav, useShellRoute } from "./useShellRoute";

function ShellBody({ route }: { route: ShellRoute }) {
  const nav = useShellNav();
  const student = useGetStudent();
  const subject = useGetSubjectById({ id: route.subjectId });
  const language = useGetLanguage();
  const lang = language.data ?? "en";
  const [{ depth }, depthApi] = useSpring(() => ({
    depth: route.detail ? 1 : 0,
  }));

  // The tabs keep their tab while a detail page covers them (the detail URL
  // carries no `tab`), so they don't jump behind it.
  const tabRef = useRef(route.tab);
  if (!route.detail) tabRef.current = route.tab;
  const tab = tabRef.current;
  const detailOpen = !!route.detail;

  // An archived subject is closed to students: never remember it as the
  // subject to reopen (the archived screen also forgets it).
  const archived = isSubjectArchived(subject.data, subject.error);
  useEffect(() => {
    if (!archived) safeSet("subject_id", route.subjectId);
  }, [route.subjectId, archived]);

  // Only when there is no student to show: a background refetch that fails
  // (a dropped connection) must not replace a working app with an error.
  if (student.error && !student.data) {
    return (
      <StudentLoadError
        error={student.error}
        lang={lang}
        retrying={student.isFetching}
        onRetry={() => void student.refetch()}
      />
    );
  }

  if (archived)
    return (
      <ArchivedSubjectScreen
        subjectId={route.subjectId}
        educationYear={subject.data?.educationYear}
      />
    );

  return (
    // Desktop: the sidebar, then the main area holding the tabs and the
    // detail page. The main area gets no z-index, so a detail page's
    // full-window layers (an expanded video quiz) stack above the sidebar.
    <div className="relative flex h-full w-full overflow-hidden bg-background-color">
      <SideNav
        tab={tab}
        student={student.data}
        language={lang}
        onSelect={nav.sidebarTab}
      />
      <div
        className="relative h-full min-w-0 flex-1 overflow-hidden"
        // An off-screen detail page widens this clipped box; never let
        // scrollIntoView or focus scroll it sideways.
        onScroll={(e) => {
          e.currentTarget.scrollLeft = 0;
        }}
      >
        <Head>
          <title>
            {subject.data?.title
              ? `${subject.data.title} | Tatuga School`
              : homeLanguage.subjectTitleFallback(lang)}
          </title>
          <meta name="description" content={subject.data?.title} />
        </Head>
        <animated.div
          aria-hidden={detailOpen || undefined}
          {...inertProps(detailOpen)}
          className="absolute inset-0 flex flex-col"
          style={{
            transform: depth.to((d) =>
              d === 0 ? "none" : `translate3d(${-30 * d}%,0,0)`,
            ),
            // Fully covered: skip painting it.
            visibility: depth.to((d) => (d >= 1 ? "hidden" : "visible")),
          }}
        >
          <div className="relative min-h-0 flex-1">
            {/* A new subject starts fresh on Home. */}
            <TabPager
              key={route.subjectId}
              subjectId={route.subjectId}
              tab={tab}
              enabled={!detailOpen}
              onTabChange={nav.goTab}
            />
          </div>
          {/* Below the tabs: up top it sits under the framed status bar. */}
          {subject.data?.isAchieved && (
            <ArchivedBanner lang={lang} className="mb-6" />
          )}
          <TabBar
            tab={tab}
            student={student.data}
            language={lang}
            onSelect={nav.goTab}
          />
          <animated.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[#141830]"
            style={{ opacity: depth.to((d) => d * 0.15) }}
          />
        </animated.div>
        <DetailStack
          subjectId={route.subjectId}
          detail={route.detail}
          depthApi={depthApi}
        />
      </div>
    </div>
  );
}

/**
 * The persistent subject app: five swipeable tabs with the mascot as the
 * centre Home button, and detail pages that slide over them. Both subject
 * pages use it as their layout, so it survives navigation between them.
 */
export default function SubjectShell({
  children,
}: {
  children?: React.ReactNode;
}) {
  const route = useShellRoute();
  // Service worker + daily push re-subscribe, once for the whole app shell.
  usePushSync();
  return (
    <>
      {route ? (
        <ShellBody route={route} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-background-color">
          <LoadingSpinner width="40px" />
        </div>
      )}
      {children}
    </>
  );
}
