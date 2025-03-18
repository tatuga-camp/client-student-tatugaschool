import React from "react";
import { footerDataLanguage } from "../data/language";
import { useGetLanguage } from "../react-query";

function Footer() {
  const language = useGetLanguage();
  return (
    <section className="flex mt-5 items-center flex-col">
      <span className="text-white font-medium text-sm">
        {footerDataLanguage.title(language.data ?? "en")}
      </span>
      <p className="text-white font-light text-sm">
        {footerDataLanguage.description(language.data ?? "en")}
      </p>
      <a
        href="https://tatugacamp.com"
        className="text-white font-light text-sm"
      >
        {footerDataLanguage.coppyright(language.data ?? "en")}
      </a>
    </section>
  );
}

export default Footer;
