import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
import Swal from "sweetalert2";
import InputMask from "../components/common/InputMask";
import Footer from "../components/Footer";
import LanguageSelect from "../components/LanguageSelect";
import { defaultCanvas } from "../data";
import { useGetLanguage } from "../react-query";
import { welcomeDataLanguage } from "../data/language";

function Welcome() {
  const [code, setCode] = React.useState("");
  const router = useRouter();
  const language = useGetLanguage();

  const handleSummit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter your code!",
      });
    }
    router.replace({
      pathname: "/",
      query: { subject_code: code },
    });
  };
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
      <main className="gradient-bg relative flex h-screen w-screen flex-col items-center justify-center gap-5 font-Anuphan">
        <div className="absolute right-2 top-2">
          <LanguageSelect />
        </div>
        <div className="flex items-center justify-center gap-1 rounded-full bg-white px-3 py-1 md:gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-2xl ring-1 ring-white transition duration-150 hover:scale-105 active:scale-110">
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              alt="logo tatuga school"
            />
          </div>
          <div className="block text-lg font-bold uppercase text-icon-color md:text-base">
            Tatuga School
          </div>
        </div>
        <form
          onSubmit={handleSummit}
          className="flex w-80 flex-col items-center justify-center gap-2 rounded-2xl border bg-white p-5 drop-shadow-md md:w-96"
        >
          <InputMask
            required
            value={code}
            onChange={(e) => setCode(e.target.value as string)}
            mask="******"
            placeholder={welcomeDataLanguage.placeholder(language.data ?? "en")}
            className="w-full text-center text-xl"
          />
          <button className="main-button w-full">
            {welcomeDataLanguage.button(language.data ?? "en")}
          </button>
        </form>

        <Footer />
      </main>
    </>
  );
}

export default Welcome;
