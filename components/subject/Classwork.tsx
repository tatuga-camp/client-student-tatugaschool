import { useRouter } from "next/router";
import { useGetAssignments } from "../../react-query";
import LoadingBar from "../common/LoadingBar";
import ClassworkCard from "./ClassworkCard";

type Props = {
  subjectId: string;
};
function Classwork({ subjectId }: Props) {
  const router = useRouter();
  const assignments = useGetAssignments({ subjectId });
  return (
    <>
      {assignments.isLoading && <LoadingBar />}
      <ul className="mt-5 flex h-max w-full flex-col gap-5 p-0 md:p-2">
        {assignments.data
          ?.sort((a, b) => a.order - b.order)
          .map((classwork, index) => {
            return (
              <ClassworkCard
                onSelect={(a) => {
                  router.push(`/subject/${subjectId}/assignment/${a.id}`);
                }}
                key={index}
                classwork={classwork}
                subjectId={subjectId}
              />
            );
          })}
      </ul>
    </>
  );
}

export default Classwork;
