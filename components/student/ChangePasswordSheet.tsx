import React, { useState } from "react";
import Swal from "../../utils/appSwal";
import BottomSheet from "../common/BottomSheet";
import Password from "../common/Password";
import { profileLanguage, studentDataLanguage } from "../../data/languages";
import { Language } from "../../interfaces";
import { useUpdateStudent } from "../../react-query";
import { errorSwalContent } from "../../utils/errorSwal";
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
      Swal.fire({
        ...errorSwalContent(
          err,
          studentDataLanguage.somethingWentWrong(language),
        ),
        icon: "error",
      });
    }
  };

  return (
    <BottomSheet
      title={profileLanguage.changePassword(language)}
      closeLabel={profileLanguage.close(language)}
      onClose={onClose}
    >
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
    </BottomSheet>
  );
}

export default ChangePasswordSheet;
