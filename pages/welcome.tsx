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
      <main className="w-screen relative font-Anuphan h-screen flex flex-col gap-5 items-center gradient-bg  justify-center">
        <div className="absolute top-2 right-2">
          <LanguageSelect />
        </div>
        <div className="flex items-center justify-center bg-white px-3 rounded-full py-1 gap-1 md:gap-2">
          <div
            className="w-6 h-6 rounded-md overflow-hidden ring-1 ring-white
         relative hover:scale-105 active:scale-110 transition duration-150"
          >
            <Image
              src="/favicon.ico"
              placeholder="blur"
              blurDataURL={defaultCanvas}
              fill
              alt="logo tatuga school"
            />
          </div>
          <div className="font-bold uppercase  block text-lg md:text-base text-icon-color">
            Tatuga School
          </div>
        </div>
        <form
          onSubmit={handleSummit}
          className="w-80 md:w-96  bg-white rounded-lg p-5 drop-shadow-md
         border flex items-center justify-center flex-col gap-2"
        >
          <InputMask
            required
            value={code}
            onChange={(e) => setCode(e.target.value as string)}
            mask="******"
            placeholder={welcomeDataLanguage.placeholder(language.data ?? "en")}
            className="text-xl text-center w-full"
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
