import { StudentOnSubject } from "../../interfaces";
import { mascotForStudentOnSubject, realPhoto } from "../../utils/mascot";
import { PhotoOrFallback } from "../app/PhotoOrFallback";
import MascotAvatar from "../student/MascotAvatar";

type Props = {
  student: Pick<StudentOnSubject, "id" | "studentId" | "photo" | "blurHash">;
  size: number;
};

/**
 * A student on the class list: their own photo, so classmates know each
 * other's faces. With none (or a mascot picked as the photo), or one that
 * will not load, their mascot instead.
 */
export function StudentAvatar({ student, size }: Props) {
  return (
    <PhotoOrFallback
      src={realPhoto(student.photo)}
      blurHash={student.blurHash}
      sizes={`${size}px`}
      className="rounded-full object-cover"
      fallback={
        <MascotAvatar
          clips={mascotForStudentOnSubject(student)}
          alt=""
          id={student.id}
          idle={false}
          sizes={`${size}px`}
        />
      }
    />
  );
}
