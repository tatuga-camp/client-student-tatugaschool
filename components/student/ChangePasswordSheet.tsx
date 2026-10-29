import React, { useState } from "react";
import { Sheet } from "../app/Sheet";
import Password from "../common/Password";
import { profileLanguage, studentDataLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { useUpdateStudent } from "../../react-query";
import { passwordChangeError } from "../../utils/profileEdit";

type Props = {
  studentId: string;
  language: Language;
  onClose: () => void;
  onSaved: () => void;
};

function ChangePasswordSheet({ studentId, language, onClose, onSaved }: Props) {
  const update = useUpdateStudent();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const problem = passwordChangeError(password, confirm);
    if (problem) {
      setError(
        problem === "required"
          ? profileLanguage.passwordRequired(language)
          : studentDataLanguage.passwordNotMatch(language),
      );
      return;
    }
    setError(null);
    try {
      await update.mutateAsync({
        query: { studentId },
        body: { password },
      });
      onSaved();
    } catch (err) {
      console.error(err);
      setError(studentDataLanguage.somethingWentWrong(language));
    }
  };

  return (
    <Sheet
      open
      onClose={onClose}
      ariaLabel={profileLanguage.changePassword(language)}
    >
      <h2 className="mb-3 text-base font-bold text-[#383767]">
        {profileLanguage.changePassword(language)}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">
            {studentDataLanguage.enterNewPassword(language)}
          </span>
          <Password
            toggleMask
            feedback={false}
            invalid={!!error}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">
            {studentDataLanguage.enterConfirmPassword(language)}
          </span>
          <Password
            toggleMask
            feedback={false}
            invalid={!!error}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-error-color">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={update.isPending}
          className="main-button w-full rounded-2xl py-2 text-white"
        >
          {profileLanguage.save(language)}
        </button>
      </form>
    </Sheet>
  );
}

export default ChangePasswordSheet;
