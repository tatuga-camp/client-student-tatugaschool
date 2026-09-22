import React from "react";
import { footerDataLanguage } from "../data/languages";
import { useGetLanguage } from "../react-query";

function Footer() {
  const language = useGetLanguage();
  return (
    <section className="mx-auto mt-5 flex w-full max-w-lg flex-col items-center px-4 pb-6 text-center">
      <span className="text-xs font-medium text-white sm:text-sm">
        {footerDataLanguage.title(language.data ?? "en")}
      </span>
      <p className="mt-1 text-pretty text-[11px] font-light leading-relaxed text-white/90 sm:text-sm">
        {footerDataLanguage.description(language.data ?? "en")}
      </p>
      <a
        href="https://tatugacamp.com"
        className="mt-1 text-[11px] font-light text-white/90 hover:underline sm:text-sm"
      >
        {footerDataLanguage.coppyright(language.data ?? "en")}
      </a>
    </section>
  );
}

export default Footer;
