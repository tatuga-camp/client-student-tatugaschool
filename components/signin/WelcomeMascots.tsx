import { mascotForPhoto } from "../../utils/mascot";
import MascotAvatar from "../student/MascotAvatar";
import { avatarPhoto } from "./mascotAvatars";

/** Id of the centre mascot, the one that reacts to a wrong code. */
export const WELCOME_REACT_ID = "welcome-1";

const TRIO = [
  { photo: avatarPhoto(2), size: 78, delay: "0s" },
  { photo: avatarPhoto(1), size: 104, delay: ".4s" },
  { photo: avatarPhoto(3), size: 78, delay: ".8s" },
];

/** Three mascots standing on the grass, bobbing out of step. */
export function WelcomeMascots() {
  return (
    <div className="absolute inset-x-0 top-[168px] z-[2] flex items-end justify-center">
      {TRIO.map(({ photo, size, delay }, i) => {
        const clips = mascotForPhoto(photo);
        if (!clips) return null;
        return (
          <div
            key={i}
            className="home-bob drop-shadow-[0_6px_8px_rgba(0,0,0,.18)]"
            style={{ animationDelay: delay }}
          >
            <div className="relative" style={{ width: size, height: size }}>
              <MascotAvatar
                clips={clips}
                alt=""
                id={`welcome-${i}`}
                idle={false}
                sizes={`${size}px`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
