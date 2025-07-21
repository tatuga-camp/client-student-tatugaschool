import Link from "next/link";
import { BiBook } from "react-icons/bi";
import { MdAssignment } from "react-icons/md";
import { classworkCardDataLanguage } from "../../data/language";
import {
  Assignment,
  FileOnAssignment,
  StudentAssignmentStatus,
  StudentOnAssignment,
} from "../../interfaces";
import { useGetLanguage } from "../../react-query";
import AssignmentStatusCard from "./AssignmentStatus";
import { FaRegFile, FaRegFileImage } from "react-icons/fa";
import { LuLink } from "react-icons/lu";

type PropsClassworkCard = {
  classwork: Assignment & {
    files: FileOnAssignment[] | [];
    studentOnAssignment: StudentOnAssignment;
  };
  subjectId: string;
  onSelect: (classwork: Assignment) => void;
};
function ClassworkCard({ classwork, subjectId, onSelect }: PropsClassworkCard) {
  return (
    <>
      {classwork.type === "Assignment" && (
        <AssignmentCard
          subjectId={subjectId}
          onSelect={(a) => {
            onSelect(a);
          }}
          assignment={classwork}
        />
      )}

      {classwork.type === "Material" && (
        <MaterialCard
          subjectId={subjectId}
          material={classwork}
          onSelect={(a) => {
            onSelect(a);
          }}
        />
      )}
    </>
  );
}

export default ClassworkCard;

type PropsAssignmentCard = {
  assignment: Assignment & {
    files: FileOnAssignment[];
    studentOnAssignment: StudentOnAssignment;
  };
  subjectId: string;
  onSelect: (classwork: Assignment) => void;
};
function AssignmentCard({
  assignment,
  subjectId,
  onSelect,
}: PropsAssignmentCard) {
  const language = useGetLanguage();
  const handleColor = (status: StudentAssignmentStatus) => {
    if (status === "IMPROVED") {
      return "orange";
    } else if (status === "PENDDING") {
      return "gray";
    } else if (status === "REVIEWD") {
      return "green";
    } else {
      return "yellow";
    }
  };
  const color = handleColor(assignment.studentOnAssignment.status);
  let score = assignment.studentOnAssignment.score ?? 0;
  if (assignment.weight !== null) {
    const originalScore = score / assignment.maxScore;
    score = originalScore * assignment.weight;
  }

  return (
    <button
      onClick={() => {
        onSelect(assignment);
      }}
      className={`h-max min-h-40 w-full rounded-xl bg-white p-5 ring-1 ring-${color}-200`}
      key={assignment.id}
    >
      <section className="flex w-full justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-${color}-100 text-2xl text-${color}-500`}
        >
          <MdAssignment />
        </div>

        <div className="w-max">
          <AssignmentStatusCard
            status={assignment.studentOnAssignment.status}
          />
        </div>
      </section>
      <h1 className="text-lg font-medium">{assignment.title}</h1>
      <span className="text-sm text-gray-400">
        {classworkCardDataLanguage.pubishAt(language.data ?? "en")} :{" "}
        {new Date(assignment.beginDate).toLocaleDateString(undefined)}
      </span>
      <section className="flex w-full items-end justify-between">
        <div>
          <span className="text-4xl font-bold text-blue-700">{score}</span>
          <span className="text-base font-medium text-gray-400">
            / {assignment.weight ? assignment.weight : assignment.maxScore}{" "}
            {classworkCardDataLanguage.yourscore(language.data ?? "en")}
          </span>
        </div>
        {assignment.weight && (
          <span className={`text-${color}-400`}>
            {" "}
            {assignment.weight}%{" "}
            {classworkCardDataLanguage.weight(language.data ?? "en")}
          </span>
        )}
      </section>
      {assignment.dueDate && (
        <section className="mt-5">
          <div className="rounded-full bg-red-100 p-2 text-red-700">
            {classworkCardDataLanguage.Deadline(language.data ?? "en")} :{" "}
            {new Date(assignment.dueDate).toLocaleDateString(undefined, {
              minute: "numeric",
              hour: "numeric",
            })}
          </div>
        </section>
      )}
    </button>
  );
}

type PropsMaterialCard = {
  material: Assignment & {
    files: FileOnAssignment[];
    studentOnAssignment: StudentOnAssignment;
  };
  subjectId: string;
  onSelect: (material: Assignment) => void;
};
function MaterialCard({ material, subjectId, onSelect }: PropsMaterialCard) {
  const language = useGetLanguage();
  return (
    <button
      onClick={() => onSelect(material)}
      className="h-max min-h-40 w-full rounded-xl bg-white p-5 ring-1 ring-blue-200"
      key={material.id}
    >
      <section className="flex w-full justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-500">
          <BiBook />
        </div>

        <div className="flex w-max items-center justify-center rounded-full bg-blue-500 p-3 text-base text-white">
          Material
        </div>
      </section>
      <h1 className="text-lg font-medium">{material.title}</h1>
      <span className="text-sm text-gray-400">
        {classworkCardDataLanguage.pubishAt(language.data ?? "en")} :{" "}
        {new Date(material.beginDate).toLocaleDateString(undefined)}
      </span>
      <section className="w-full p-3 pl-10">
        <span className="text-gray-500">ไฟล์แนบ:</span>
        <ul className="grid gap-3">
          {material.files.map((f) => {
            const isImage = f.type.includes("image");
            const fileName = f.url.split("/")[f.url.split("/").length - 1];
            return (
              <li
                className="flex h-max items-center gap-3 rounded-lg bg-gray-50 p-2"
                key={f.id}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                  {isImage ? (
                    <FaRegFileImage />
                  ) : f.type === "link-url" ? (
                    <LuLink />
                  ) : (
                    <FaRegFile />
                  )}
                </div>
                <p className="w-40 text-wrap break-words text-xs">{fileName}</p>
              </li>
            );
          })}
        </ul>
      </section>
    </button>
  );
}
