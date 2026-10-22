import React, { useState } from "react";
import Swal from "sweetalert2";
import BottomSheet from "../common/BottomSheet";
import { profileLanguage, studentDataLanguage } from "../../data/languages";
import { Language, Student } from "../../interfaces";
import { useUpdateStudent } from "../../react-query";
import { errorSwalContent } from "../../utils/errorSwal";
import { nameEditError } from "../../utils/profileEdit";

type Props = {
  student: Student;
  language: Language;
  onClose: () => void;
  onSaved: () => void;
};

function EditNameSheet({ student, language, onClose, onSaved }: Props) {
  const update = useUpdateStudent();
  const [name, setName] = useState({
    title: student.title,
    firstName: student.firstName,
    lastName: student.lastName,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nameEditError(name)) {
      setError(profileLanguage.nameRequired(language));
      return;
    }
    setError(null);
    try {
      await update.mutateAsync({
        query: { studentId: student.id },
        body: {
          title: name.title.trim(),
          firstName: name.firstName.trim(),
          lastName: name.lastName.trim(),
        },
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

  const fields = [
    { key: "title", label: studentDataLanguage.title(language) },
    { key: "firstName", label: studentDataLanguage.firstName(language) },
    { key: "lastName", label: studentDataLanguage.lastName(language) },
  ] as const;

  return (
    <BottomSheet
      title={profileLanguage.editName(language)}
      closeLabel={profileLanguage.close(language)}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {fields.map((field) => (
          <label key={field.key} className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">{field.label}</span>
            <input
              value={name[field.key]}
              maxLength={199}
              onChange={(e) =>
                setName((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              aria-invalid={error ? true : undefined}
              className="main-input w-full"
            />
          </label>
        ))}
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

export default EditNameSheet;
