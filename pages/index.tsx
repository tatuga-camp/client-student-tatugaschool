import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { PickNameScreen } from "../components/signin/PickNameScreen";
import { SubjectLoadError } from "../components/signin/SubjectLoadError";
import { SubjectArchivedJoin } from "../components/signin/SubjectArchivedJoin";
import { SubjectNotFound } from "../components/signin/SubjectNotFound";
import { SubjectQuery } from "../interfaces";
import { useGetSubjectByCode } from "../react-query";
import {
  GetSubjectByCodeService,
  ResponseGetSubjectByCodeService,
} from "../services";
import { joinCodeFromQuery } from "../utils/joinCode";
import {
  errorPropsFromLookup,
  SubjectLookupErrorProps,
} from "../utils/subjectLookupError";

type IndexProps = {
  subjectData: ResponseGetSubjectByCodeService;
  code: string;
  announcementId?: string;
  error?: SubjectLookupErrorProps;
};

function Index({ subjectData, code, announcementId, error }: IndexProps) {
  const subject = useGetSubjectByCode(code, {
    initialData: subjectData,
    enable: !!code,
  });
  const router = useRouter();
  // An archived subject is closed to students: nobody joins it.
  if (error?.code === "SUBJECT_ARCHIVED") return <SubjectArchivedJoin />;
  if (error?.statusCode === 404) return <SubjectNotFound />;
  if (error) {
    return (
      <SubjectLoadError
        message={error.message}
        onRetry={() => router.replace(router.asPath)}
      />
    );
  }
  return (
    <>
      <Head>
        <title>{subject.data?.title}</title>
        <meta
          name="description"
          content={`welcome to subject ${subject.data?.title} by ${subject.data?.teacherOnSubjects[0]?.firstName}`}
        />
        {/* No manifest here: Me → Install app links one only when asked. */}
        <meta name="theme-color" content="#2C7CD1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-title"
          content={subject.data?.title ?? "Tatuga School"}
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </Head>
      <PickNameScreen
        subjectCode={code}
        announcementId={announcementId ?? null}
      />
    </>
  );
}

Index.getLayout = (page: React.ReactElement) => page;

export default Index;

const NOT_FOUND = { statusCode: 404, message: null };

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const query: SubjectQuery = ctx.query as SubjectQuery;

    if (query.subject_code === undefined) {
      return {
        redirect: {
          destination: "/welcome",
          permanent: false,
        },
      };
    }
    // A code the server can't take (wrong length, a repeated param) is a
    // class that doesn't exist, not a failed load.
    const code = joinCodeFromQuery(query.subject_code);
    if (code === null) return { props: { error: NOT_FOUND } };
    const subject = await GetSubjectByCodeService({ code });
    return {
      props: {
        subjectData: subject,
        code,
        ...(typeof query.announcement_id === "string" && query.announcement_id
          ? { announcementId: query.announcement_id }
          : {}),
      },
    };
  } catch (error: any) {
    console.error("Error fetching subject", error);
    // A malformed code (400) is no such class; an archived one keeps its code.
    return { props: { error: errorPropsFromLookup(error) } };
  }
};
