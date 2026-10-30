import { StudentOnSubject } from "../../interfaces";
import { mascotForStudentOnSubject, realPhoto } from "../../utils/mascot";
import { PhotoOrFallback } from "../app/PhotoOrFallback";
import MascotAvatar from "../student/MascotAvatar";

type AvatarProps = {
  student: Pick<StudentOnSubject, "id" | "studentId" | "photo" | "blurHash">;
  /** Matches `reactMascot(id, mood)` calls. */
  mascotId: string;
};

/** How far the avatar sits down into the sheet, over its top edge. */
const OVERLAP = 26;

/**
 * The student greeted on a sign-in sheet, riding on its top edge: pass it as
 * the Sheet's `overlay`. The handle row below it clears the overlap. Their
 * own photo, as on the class list; their mascot when they have none.
 */
export function SignInSheetAvatar({ student, mascotId }: AvatarProps) {
  const mascot = (
    <MascotAvatar
      clips={mascotForStudentOnSubject(student)}
      alt=""
      id={mascotId}
      idle={false}
      greetOnMount
      sizes="120px"
    />
  );
  const photo = realPhoto(student.photo);
  if (!photo) {
    return (
      <div
        className="home-bob relative mx-auto h-[120px] w-[120px] drop-shadow-[0_8px_10px_rgba(0,0,0,.2)]"
        style={{ marginBottom: -OVERLAP }}
      >
        {mascot}
      </div>
    );
  }
  return (
    <div
      className="relative mx-auto h-[112px] w-[112px] overflow-hidden rounded-full border-4 border-white bg-[#E8F1FD] shadow-[0_8px_16px_rgba(0,0,0,.18)]"
      style={{ marginBottom: -OVERLAP }}
    >
      <PhotoOrFallback
        src={photo}
        blurHash={student.blurHash}
        sizes="112px"
        fallback={mascot}
      />
    </div>
  );
}

type Props = { title: string; subtitle: string };

/** The greeting under the mascot at the top of a sign-in sheet. */
export function SignInSheetHeader({ title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="mt-1 text-xl font-extrabold text-[#383767]">{title}</h2>
      <p className="mt-0.5 text-sm text-[#7A80A0]">{subtitle}</p>
    </div>
  );
}
