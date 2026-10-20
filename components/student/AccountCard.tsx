import React from "react";
import { profileLanguage } from "../../data/languages";
import { Language, Student } from "../../interfaces";

type Props = {
  student: Student;
  language: Language;
  onEditName: () => void;
  onEditPhoto: () => void;
  onChangePassword: () => void;
};

function Row({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 border-t py-3 text-left text-base hover:bg-gray-50"
    >
      <span>{label}</span>
      <span className="truncate text-sm text-gray-500">{value} ›</span>
    </button>
  );
}

function AccountCard({
  student,
  language,
  onEditName,
  onEditPhoto,
  onChangePassword,
}: Props) {
  const change = profileLanguage.change(language);
  return (
    <section className="w-full rounded-2xl border bg-white p-4 lg:w-7/12">
      <h2 className="text-lg font-medium">
        {profileLanguage.account(language)}
      </h2>
      <p className="mb-2 text-sm text-gray-500">
        {profileLanguage.onlyYou(language)}
      </p>
      <Row
        label={profileLanguage.name(language)}
        value={`${student.title} ${student.firstName} ${student.lastName}`}
        onClick={onEditName}
      />
      <Row
        label={profileLanguage.profilePhoto(language)}
        value={change}
        onClick={onEditPhoto}
      />
      <Row
        label={profileLanguage.password(language)}
        value={change}
        onClick={onChangePassword}
      />
    </section>
  );
}

export default AccountCard;
