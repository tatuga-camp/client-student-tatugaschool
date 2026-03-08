import React from "react";
import { footerDataLanguage } from "../data/languages";
import { useGetLanguage } from "../react-query";

function Footer() {
  const language = useGetLanguage();
  return (
    <section className="mt-5 flex flex-col items-center">
      <span className="text-sm font-medium text-white">
        {footerDataLanguage.title(language.data ?? "en")}
      </span>
      <p className="text-center text-sm font-light text-white">
        {footerDataLanguage.description(language.data ?? "en")}
      </p>
      <a
        href="https://tatugacamp.com"
        className="text-sm font-light text-white"
      >
        {footerDataLanguage.coppyright(language.data ?? "en")}
      </a>
    </section>
  );
}

export default Footer;
