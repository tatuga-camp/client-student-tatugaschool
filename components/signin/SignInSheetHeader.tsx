import { MascotClips } from "../../utils/mascot";
import MascotAvatar from "../student/MascotAvatar";

type Props = {
  clips: MascotClips;
  /** Matches `reactMascot(id, mood)` calls. */
  mascotId: string;
  title: string;
  subtitle: string;
};

/** The mascot greeting a student at the top of a sign-in sheet. */
export function SignInSheetHeader({ clips, mascotId, title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="home-bob relative h-[120px] w-[120px] drop-shadow-[0_6px_8px_rgba(0,0,0,.15)]">
        <MascotAvatar
          clips={clips}
          alt=""
          id={mascotId}
          idle={false}
          greetOnMount
          sizes="120px"
        />
      </div>
      <h2 className="mt-1 text-xl font-extrabold text-[#383767]">{title}</h2>
      <p className="mt-0.5 text-sm text-[#7A80A0]">{subtitle}</p>
    </div>
  );
}
