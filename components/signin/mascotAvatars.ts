import { mascotForPhoto, mascotHash } from "../../utils/mascot";

export const avatarPhoto = (n: number) =>
  `https://storage.tatugaschool.com/AVATAR/${n}.png`;

/** The guide mascot used on the sign-in screens that have a message. */
export const guideClips = mascotForPhoto(avatarPhoto(1));

const TINTS = [
  "#FFF6D6",
  "#E5F7EC",
  "#FDE8F2",
  "#F1EAFE",
  "#E0F5F2",
  "#E8F1FD",
];

/** A stable pastel per student (the Student id, the same in every class),
 *  so a mascot keeps its colour. */
export const tintFor = (studentId: string) =>
  TINTS[mascotHash(studentId) % TINTS.length];
