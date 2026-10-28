import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { PickNameScreen } from "../components/signin/PickNameScreen";
import { SubjectLoadError } from "../components/signin/SubjectLoadError";
import { SubjectNotFound } from "../components/signin/SubjectNotFound";
import { SubjectQuery } from "../interfaces";
import { useGetSubjectByCode } from "../react-query";
import {
  GetSubjectByCodeService,
  ResponseGetSubjectByCodeService,
} from "../services";
import { joinCodeForLookup } from "../utils/joinCode";

type IndexProps = {
  subjectData: ResponseGetSubjectByCodeService;
  code: string;
  announcementId?: string;
  error?: { statusCode: number | null; message: string | null };
};

function Index({ subjectData, code, announcementId, error }: IndexProps) {
  const subject = useGetSubjectByCode(code, { initialData: subjectData });
  const router = useRouter();
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
        <link
          rel="manifest"
          href={`/api/manifest?subject_code=${encodeURIComponent(code)}`}
        />
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const query: SubjectQuery = ctx.query as SubjectQuery;

    if (!query.subject_code) {
      return {
        redirect: {
          destination: "/welcome",
          permanent: false,
        },
      };
    }
    const code = joinCodeForLookup(query.subject_code);
    const subject = await GetSubjectByCodeService({ code });
    return {
      props: {
        subjectData: subject,
        code,
        ...(query.announcement_id
          ? { announcementId: query.announcement_id }
          : {}),
      },
    };
  } catch (error: any) {
    console.error("Error fetching subject", error);
    return {
      props: {
        error: {
          statusCode:
            typeof error?.statusCode === "number" ? error.statusCode : null,
          message: typeof error?.message === "string" ? error.message : null,
        },
      },
    };
  }
};
