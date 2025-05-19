import React, { CSSProperties } from "react";
import {
  Assignment,
  FileOnAssignment,
  StudentOnAssignment,
} from "../../interfaces";
import Link from "next/link";
import parse from "html-react-parser";
import { MdAssignment, MdDragIndicator } from "react-icons/md";
import { BiBook } from "react-icons/bi";
import { FaRegFile, FaRegFileImage } from "react-icons/fa6";
import AssignmentStatusCard from "./AssignmentStatus";
import { useGetLanguage } from "../../react-query";
import { classworkCardDataLanguage } from "../../data/language";

type PropsClassworkCard = {
  classwork: Assignment & {
    files: FileOnAssignment[];
    studentOnAssignment: StudentOnAssignment;
  };
  selectClasswork: Assignment | null;
  subjectId: string;
  onSelect: (classwork: Assignment) => void;
};
function ClassworkCard(props: PropsClassworkCard) {
  return (
    <>
      {props.classwork.type === "Assignment" && (
        <AssignmentCard
          {...props}
          assignemnt={props.classwork}
          selectAssignment={props.selectClasswork}
        />
      )}

      {props.classwork.type === "Material" && (
        <MaterialCard
          {...props}
          material={props.classwork}
          selectMaterial={props.selectClasswork}
        />
      )}
    </>
  );
}

export default ClassworkCard;

type PropsAssignmentCard = {
  assignemnt: Assignment & {
    files: FileOnAssignment[];
    studentOnAssignment: StudentOnAssignment;
  };
  subjectId: string;
  selectAssignment: Assignment | null;
  onSelect: (assignment: Assignment) => void;
};
function AssignmentCard({
  assignemnt,
  selectAssignment,
  onSelect,
  subjectId,
}: PropsAssignmentCard) {
  const language = useGetLanguage();
  return (
    <button
      className="flex w-full flex-col transition-height"
      key={assignemnt.id}
    >
      <div
        onClick={() => onSelect(assignemnt)}
        className={`rounded-b-none" } relative flex h-max w-full items-stretch justify-start gap-2 overflow-hidden rounded-none border bg-white hover:ring md:rounded-md`}
      >
        <div className="flex h-max grow flex-col gap-2 p-2">
          <div className="flex w-full">
            <AssignmentStatusCard
              status={assignemnt.studentOnAssignment.status}
            />
          </div>
          <div className="max-w-72 truncate border-b text-start text-lg font-semibold md:max-w-96">
            {assignemnt.title}
          </div>
          <div className="flex gap-1 text-xs text-gray-500">
            {new Date(assignemnt.beginDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              minute: "numeric",
              hour: "numeric",
            })}
          </div>
          <ul className="flex w-full flex-wrap items-end gap-2">
            <li className="ga-2 flex h-max w-max flex-col items-center justify-start rounded-md border bg-gray-50 p-1">
              <span className="max-w-40 truncate text-base font-medium text-primary-color">
                {assignemnt.maxScore.toLocaleString()}
              </span>
              <span className="text-xs">
                {classworkCardDataLanguage.score(language.data ?? "en")}
              </span>
            </li>
            {assignemnt.studentOnAssignment.status === "REVIEWD" && (
              <li className="ga-2 flex h-max w-max flex-col items-center justify-start rounded-md border bg-gradient-to-r from-emerald-400 to-cyan-400 p-1">
                <span className="max-w-40 truncate text-base font-medium text-white">
                  {assignemnt.studentOnAssignment.score?.toLocaleString()}
                </span>
                <span className="text-xs text-white">
                  {classworkCardDataLanguage.yourscore(language.data ?? "en")}
                </span>
              </li>
            )}
            {assignemnt.weight !== null && (
              <li className="ga-2 flex h-max w-max flex-col items-center justify-start rounded-md border bg-gray-50 p-1">
                <span className="max-w-40 truncate text-base font-medium text-primary-color">
                  {assignemnt.weight}%
                </span>
                <span className="text-xs">
                  {classworkCardDataLanguage.weight(language.data ?? "en")}
                </span>
              </li>
            )}
            {assignemnt.dueDate && (
              <li className="flex h-max w-max items-center justify-start gap-1 rounded-md border bg-gray-50 p-1">
                <span className="truncate text-sm font-medium text-red-700">
                  {new Date(assignemnt.dueDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    minute: "numeric",
                    hour: "numeric",
                  })}
                </span>
                <span className="text-xs">
                  {classworkCardDataLanguage.Deadline(language.data ?? "en")}
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div
        className={`${
          selectAssignment?.id === assignemnt.id
            ? "h-80 border border-t-0"
            : "h-0"
        } w-full overflow-hidden rounded-none rounded-t-none bg-white text-start transition-height md:rounded-md`}
      >
        <p
          className={`overflow-auto ${selectAssignment?.id === assignemnt.id ? "h-60 p-5" : "h-0"} `}
        >
          {parse(assignemnt.description)}
        </p>
        <Link
          href={`/subject/${subjectId}/assignment/${assignemnt.id}`}
          className="flex h-20 items-center gap-2 border-t p-2"
        >
          <button className="main-button w-40">
            {classworkCardDataLanguage.view(language.data ?? "en")}
          </button>
        </Link>
      </div>
    </button>
  );
}

type PropsMaterialCard = {
  material: Assignment & {
    files: FileOnAssignment[];
    studentOnAssignment: StudentOnAssignment;
  };
  subjectId: string;
  selectMaterial: Assignment | null;
  onSelect: (material: Assignment) => void;
};
function MaterialCard({
  material,
  subjectId,
  selectMaterial,
  onSelect,
}: PropsMaterialCard) {
  const language = useGetLanguage();
  return (
    <div className="flex w-full flex-col transition-height" key={material.id}>
      <button
        onClick={() => onSelect(material)}
        className={`relative flex h-max w-full items-stretch justify-start gap-2 overflow-hidden rounded-none border bg-white hover:ring md:rounded-md ${selectMaterial?.id === material.id && "rounded-b-none"} `}
      >
        <div className="flex h-max grow flex-col gap-2 p-2">
          <div className="max-w-72 truncate border-b text-start text-lg font-semibold md:max-w-96">
            {material.title}
          </div>
          <div className="flex gap-1 text-xs text-gray-500">
            {new Date(material.beginDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              minute: "numeric",
              hour: "numeric",
            })}
          </div>
          <ul className="flex max-h-20 w-full flex-wrap items-end gap-2 overflow-auto p-3">
            {material.files?.map((file, index) => {
              const isImage = file.type.includes("image");
              const fileName = file.url.split("/").pop();
              return (
                <li
                  onClick={() => window.open(file.url, "_blank")}
                  key={index}
                  className="flex h-14 w-full items-center justify-between overflow-hidden rounded-md border bg-white transition hover:cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex h-full w-full items-center justify-start gap-2">
                    <div className="gradient-bg flex h-full w-16 items-center justify-center border-r text-lg text-white">
                      {isImage ? <FaRegFileImage /> : <FaRegFile />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{fileName}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </button>
      <div
        className={`${
          selectMaterial?.id === material.id ? "h-80 border border-t-0" : "h-0"
        } w-full overflow-hidden rounded-none rounded-t-none bg-white text-start transition-height md:rounded-md`}
      >
        <p
          className={`overflow-auto ${selectMaterial?.id === material.id ? "h-60 p-5" : "h-0"} `}
        >
          {parse(material.description)}
        </p>
        <Link
          href={`/subject/${subjectId}/assignment/${material.id}`}
          className="flex h-20 items-center gap-2 border-t p-2"
        >
          <button className="main-button w-40">
            {classworkCardDataLanguage.view(language.data ?? "en")}
          </button>
        </Link>
      </div>
    </div>
  );
}
