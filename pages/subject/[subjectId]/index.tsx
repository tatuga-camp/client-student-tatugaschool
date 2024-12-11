import { GetServerSideProps } from "next";
import React from "react";
import Layout from "../../../components/layouts/Layout";
import { useGetSubjectById } from "../../../react-query";

function Index({ subjectId }: { subjectId: string }) {
  const subject = useGetSubjectById({ id: subjectId });
  return <Layout>Index</Layout>;
}

export default Index;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const params = ctx.params;

    if (!params?.subjectId) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        subjectId: params.subjectId,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      redirect: {
        destination: "/welcome",
        permanent: false,
      },
    };
  }
};
