import Link from "next/link";
import { BiBook, BiLock } from "react-icons/bi";
import { MdAssignment, MdVideoLibrary } from "react-icons/md";
import { classworkCardDataLanguage } from "../../data/languages";
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
import { TagChipList } from "./AssignmentTagEditor";
import RubricBreakdown from "./RubricBreakdown";
import ScoreHiddenBadge from "./ScoreHiddenBadge";

type PropsClassworkCard = {
  classwork: Assignment & {
    files: FileOnAssignment[] | [];
    studentOnAssignment: StudentOnAssignment;
  };
  subjectId: string;
  onSelect: (classwork: Assignment) => void;
  canViewScore: boolean;
  locked?: boolean;
};
function ClassworkCard({
  classwork,
  subjectId,
  onSelect,
  canViewScore,
  locked,
}: PropsClassworkCard) {
  return (
    <>
      {classwork.type === "Assignment" && (
        <AssignmentCard
          locked={locked}
          canViewScore={canViewScore}
          subjectId={subjectId}
          onSelect={(a) => {
            onSelect(a);
          }}
          assignment={classwork}
        />
      )}

      {classwork.type === "Material" && (
        <MaterialCard
          locked={locked}
          subjectId={subjectId}
          material={classwork}
          onSelect={(a) => {
            onSelect(a);
          }}
        />
      )}

      {classwork.type === "VideoQuiz" && (
        <AssignmentVideoCard
          locked={locked}
          canViewScore={canViewScore}
          subjectId={subjectId}
          assignment={classwork}
          onSelect={(a) => {
            onSelect(a);
          }}
        />
      )}
    </>
  );
}

function stripHtml(html: string) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
}

export default ClassworkCard;

type PropsAssignmentCard = {
  assignment: Assignment & {
    files: FileOnAssignment[];
    studentOnAssignment: StudentOnAssignment;
  };
  subjectId: string;
  onSelect: (classwork: Assignment) => void;
  canViewScore: boolean;
  locked?: boolean;
};
function AssignmentCard({
  assignment,
  subjectId,
  onSelect,
  canViewScore,
  locked,
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
      disabled={locked}
      onClick={() => {
        onSelect(assignment);
      }}
      className={`relative h-max min-h-[8.5rem] w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm ring-1 ring-${color}-100 transition hover:border-primary-color/30 hover:shadow-md sm:p-5 ${
        locked ? "cursor-not-allowed opacity-50" : ""
      }`}
      key={assignment.id}
    >
      {locked && (
        <div className="absolute right-5 top-5 text-2xl text-gray-500">
          <BiLock />
        </div>
      )}
      <section className="flex w-full justify-between">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-${color}-100 text-xl text-${color}-500 sm:h-12 sm:w-12`}
        >
          <MdAssignment />
        </div>

        <div className="w-max">
          <AssignmentStatusCard
            status={assignment.studentOnAssignment.status}
          />
        </div>
      </section>
      <h1 className="mt-3 text-base font-semibold text-icon-color sm:text-lg">
        {assignment.title}
      </h1>

      <p className="my-2 line-clamp-3 text-sm text-gray-500">
        {stripHtml(assignment.description)}
      </p>
      {assignment.tags && assignment.tags.length > 0 && (
        <div className="my-2">
          <TagChipList tags={assignment.tags} size="sm" />
        </div>
      )}
      <span className="text-sm text-gray-400">
        {classworkCardDataLanguage.pubishAt(language.data ?? "en")} :{" "}
        {new Date(assignment.beginDate).toLocaleDateString(undefined)}
      </span>
      <section className="flex w-full items-end justify-between">
        {canViewScore ? (
          <div>
            <span className="text-3xl font-bold text-primary-color">
              {score.toFixed(2)}
            </span>
            <span className="text-base font-medium text-gray-400">
              / {assignment.weight ? assignment.weight : assignment.maxScore}{" "}
              {classworkCardDataLanguage.yourscore(language.data ?? "en")}
            </span>
          </div>
        ) : (
          <div className="py-2">
            <ScoreHiddenBadge size="sm" />
          </div>
        )}
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
          <div className="rounded-full bg-error-color/10 px-3 py-2 text-sm font-medium text-error-color">
            {classworkCardDataLanguage.Deadline(language.data ?? "en")} :{" "}
            {new Date(assignment.dueDate).toLocaleDateString(undefined, {
              minute: "numeric",
              hour: "numeric",
            })}
          </div>
        </section>
      )}

      {canViewScore && assignment.studentOnAssignment.status === "REVIEWD" && (
        <RubricBreakdown
          studentOnAssignmentId={assignment.studentOnAssignment.id}
        />
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
  locked?: boolean;
};
function MaterialCard({
  material,
  subjectId,
  onSelect,
  locked,
}: PropsMaterialCard) {
  const language = useGetLanguage();
  return (
    <button
      disabled={locked}
      onClick={() => onSelect(material)}
      className={`relative h-max min-h-[8.5rem] w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm ring-1 ring-primary-color/15 transition hover:border-primary-color/30 hover:shadow-md sm:p-5 ${
        locked ? "cursor-not-allowed opacity-50" : ""
      }`}
      key={material.id}
    >
      {locked && (
        <div className="absolute right-5 top-5 text-2xl text-gray-500">
          <BiLock />
        </div>
      )}
      <section className="flex w-full justify-between">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-color/10 text-xl text-primary-color sm:h-12 sm:w-12">
          <BiBook />
        </div>

        <div className="flex w-max items-center justify-center rounded-full bg-primary-color px-3 py-1.5 text-xs font-semibold text-white sm:text-sm">
          Material
        </div>
      </section>
      <h1 className="mt-3 text-base font-semibold text-icon-color sm:text-lg">
        {material.title}
      </h1>

      <p className="my-2 line-clamp-3 text-sm text-gray-500">
        {stripHtml(material.description)}
      </p>
      {material.tags && material.tags.length > 0 && (
        <div className="my-2">
          <TagChipList tags={material.tags} size="sm" />
        </div>
      )}
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
                className="flex h-max items-center gap-3 rounded-2xl bg-gray-50 p-2"
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

type PropsAssignmentVideoCard = {
  assignment: Assignment & {
    studentOnAssignment: StudentOnAssignment;
  };
  subjectId: string;
  onSelect: (classwork: Assignment) => void;
  canViewScore: boolean;
  locked?: boolean;
};
function AssignmentVideoCard({
  assignment,
  subjectId,
  onSelect,
  canViewScore,
  locked,
}: PropsAssignmentVideoCard) {
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
      disabled={locked}
      onClick={() => {
        onSelect(assignment);
      }}
      className={`relative h-max min-h-[8.5rem] w-full rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm ring-1 ring-${color}-100 transition hover:border-primary-color/30 hover:shadow-md sm:p-5 ${
        locked ? "cursor-not-allowed opacity-50" : ""
      }`}
      key={assignment.id}
    >
      {locked && (
        <div className="absolute right-5 top-5 text-2xl text-gray-500">
          <BiLock />
        </div>
      )}
      <section className="flex w-full justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-${color}-100 text-2xl text-${color}-500`}
        >
          <MdVideoLibrary />
        </div>

        <div className="w-max">
          <AssignmentStatusCard
            status={assignment.studentOnAssignment.status}
          />
        </div>
      </section>
      <h1 className="mt-3 text-base font-semibold text-icon-color sm:text-lg">
        {assignment.title}
      </h1>
      {assignment.tags && assignment.tags.length > 0 && (
        <div className="my-2">
          <TagChipList tags={assignment.tags} size="sm" />
        </div>
      )}
      <span className="text-sm text-gray-400">
        {classworkCardDataLanguage.pubishAt(language.data ?? "en")} :{" "}
        {new Date(assignment.beginDate).toLocaleDateString(undefined)}
      </span>
      <section className="flex w-full items-end justify-between">
        {canViewScore ? (
          <div>
            <span className="text-3xl font-bold text-primary-color">
              {score.toFixed(2)}
            </span>
            <span className="text-base font-medium text-gray-400">
              / {assignment.weight ? assignment.weight : assignment.maxScore}{" "}
              {classworkCardDataLanguage.yourscore(language.data ?? "en")}
            </span>
          </div>
        ) : (
          <div className="py-2">
            <ScoreHiddenBadge size="sm" />
          </div>
        )}
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
          <div className="rounded-full bg-error-color/10 px-3 py-2 text-sm font-medium text-error-color">
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
