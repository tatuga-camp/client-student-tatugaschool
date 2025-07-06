import React from "react";
import { Subject } from "../../interfaces";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";
import { useGetLanguage } from "../../react-query";
import { subjectDataLanguage } from "../../data/language";

type Props = {
  subject: Subject;
};
function Header({ subject }: Props) {
  const language = useGetLanguage();
  return (
    <header className="relative flex h-max w-full items-center justify-center md:-top-20">
      <section
        className={`w-12/12 relative z-30 flex h-60 justify-between overflow-hidden p-5 shadow-inner md:w-8/12 md:ring-4 md:ring-white ${
          subject.backgroundImage ? "" : "gradient-bg"
        } rounded-none md:rounded-md`}
      >
        {subject.backgroundImage && (
          <div className="gradient-shadow absolute bottom-0 left-0 right-0 top-0 -z-10 m-auto h-full w-full"></div>
        )}{" "}
        {subject.backgroundImage && (
          <Image
            src={subject.backgroundImage}
            fill
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              subject.blurHash ?? defaultBlurHash,
            )}
            alt="backgroud"
            className="-z-20 object-cover"
          />
        )}
        <div className="flex h-full flex-col justify-end gap-1">
          <h1 className="line-clamp-2 w-8/12 min-w-96 text-lg font-semibold text-white">
            {subject.title}
          </h1>
          <p className="line-clamp-2 w-11/12 min-w-96 text-lg text-white">
            {subject.description}
          </p>
          <div className="flex gap-2">
            <div className="w-max rounded-md bg-orange-400 px-2 py-1">
              <h2 className="text-xs text-white">
                {subjectDataLanguage.educationYear(language.data ?? "en")}:{" "}
                {subject.educationYear}
              </h2>
            </div>
            <div className="w-max rounded-md bg-yellow-300 px-2 py-1">
              <h2 className="text-xs text-black">
                {subjectDataLanguage.code(language.data ?? "en")}:{" "}
                {subject.code}
              </h2>
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}

export default Header;
