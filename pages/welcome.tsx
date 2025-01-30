import { GetServerSideProps } from "next";
import React from "react";
import { GetSubjectByCodeService } from "../services";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { defaultCanvas } from "../data";
import InputWithIcon from "../components/common/InputWithIcon";
import { RiLoginBoxLine } from "react-icons/ri";
import InputMask from "../components/common/InputMask";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

function Welcome() {
  const [code, setCode] = React.useState("");
  const router = useRouter();

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
        <title>Welcome to Tatuga School</title>
        <meta
          name="description"
          content="Tatuga School is an online learning platform for students"
        />
      </Head>
      <main className="w-screen font-Anuphan h-screen flex flex-col gap-5 items-center gradient-bg  justify-center">
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
          <div className="font-bold uppercase hidden md:block text-lg md:text-base text-icon-color">
            Tatuga School
          </div>
        </div>
        <form
          onSubmit={handleSummit}
          className="w-96  bg-white rounded-lg p-5 drop-shadow-md
         border flex items-center justify-center flex-col gap-2"
        >
          <InputMask
            required
            value={code}
            onChange={(e) => setCode(e.target.value as string)}
            mask="******"
            placeholder="Enter your code"
            className="text-xl text-center w-full"
          />
          <button className="main-button w-full">ENTER</button>
        </form>

        <section className="flex mt-5 items-center flex-col">
          <span className="text-white font-medium text-sm">
            Create Your School Today!
          </span>
          <p className="text-white font-light text-sm">
            Tatuga School is a platform that provides a variety of learning
            methods and materials for students.
          </p>
          <a
            href="https://tatugacamp.com"
            className="text-white font-light text-sm"
          >
            © 2024 Tatuga Camp LP. All rights reserved.
          </a>
        </section>
      </main>
    </>
  );
}

export default Welcome;
