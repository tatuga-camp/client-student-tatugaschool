import { MascotClips } from "../../utils/mascot";
import MascotAvatar from "../student/MascotAvatar";

type MascotProps = {
  clips: MascotClips;
  /** Matches `reactMascot(id, mood)` calls. */
  mascotId: string;
};

/** How far the mascot sits down into the sheet, over its top edge. */
const OVERLAP = 26;

/**
 * The mascot greeting a student, riding on a sign-in sheet's top edge: pass
 * it as the Sheet's `overlay`. The handle row below it clears the overlap.
 */
export function SignInSheetMascot({ clips, mascotId }: MascotProps) {
  return (
    <div
      className="home-bob relative mx-auto h-[120px] w-[120px] drop-shadow-[0_8px_10px_rgba(0,0,0,.2)]"
      style={{ marginBottom: -OVERLAP }}
    >
      <MascotAvatar
        clips={clips}
        alt=""
        id={mascotId}
        idle={false}
        greetOnMount
        sizes="120px"
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
