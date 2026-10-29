import Head from "next/head";
import { WelcomeScreen } from "../components/signin/WelcomeScreen";

function Welcome() {
  return (
    <>
      <Head>
        <title>Join Subject - Student</title>
        <meta name="description" content="Join A Subject For Student!" />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Tatuga School" />
        <meta property="og:description" content="Join A Subject For Student!" />
        <meta property="og:site_name" content="Tatuga School" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icon.svg" />

        <meta property="twitter:title" content="Tatuga School" />
        <meta
          property="twitter:description"
          content="Join A Subject For Student!"
        />

        <meta property="twitter:image" content="/icon.svg" />
        <meta name="twitter:card" content="summary" />
      </Head>
      <WelcomeScreen />
    </>
  );
}

Welcome.getLayout = (page: React.ReactElement) => page;

export default Welcome;
