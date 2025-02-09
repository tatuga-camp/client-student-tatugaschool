import React from "react";
import { Subject } from "../../interfaces";
import Image from "next/image";
import { decodeBlurhashToCanvas } from "../../utils";
import { defaultBlurHash } from "../../data";

type Props = {
  subject: Subject;
};
function Header({ subject }: Props) {
  return (
    <header className="w-full relative md:-top-20 flex items-center h-max justify-center">
      <section
        className={`w-12/12 md:w-8/12 z-30 overflow-hidden ring-4 ring-white
                     h-60 relative flex justify-between  p-5 shadow-inner ${
                       subject.backgroundImage ? "" : "gradient-bg"
                     } rounded-none   md:rounded-md`}
      >
        {subject.backgroundImage && (
          <div className="gradient-shadow  -z-10  absolute w-full h-full top-0 bottom-0 right-0 left-0 m-auto"></div>
        )}{" "}
        {subject.backgroundImage && (
          <Image
            src={subject.backgroundImage}
            fill
            placeholder="blur"
            blurDataURL={decodeBlurhashToCanvas(
              subject.blurHash ?? defaultBlurHash
            )}
            alt="backgroud"
            className="object-cover -z-20 "
          />
        )}
        <div className="flex h-full justify-end flex-col gap-1">
          <h1 className="text-lg font-semibold w-8/12 min-w-96 line-clamp-2 text-white">
            {subject.title}
          </h1>
          <p className="text-lg w-11/12 min-w-96 line-clamp-2 text-white">
            {subject.description}
          </p>
          <div className="flex gap-2">
            <div className="bg-white w-max px-2 py-1 rounded-md">
              <h2 className="text-xs text-primary-color">
                Academic year: {subject.educationYear}
              </h2>
            </div>
            <div className="bg-white w-max px-2 py-1 rounded-md">
              <h2 className="text-xs text-primary-color">
                Subject Code: {subject.code}
              </h2>
            </div>
          </div>
        </div>
      </section>
    </header>
  );
}

export default Header;
