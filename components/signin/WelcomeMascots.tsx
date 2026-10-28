import { mascotForPhoto } from "../../utils/mascot";
import MascotAvatar from "../student/MascotAvatar";

const PHOTO = (n: number) => `https://storage.tatugaschool.com/AVATAR/${n}.png`;
const TRIO = [
  { photo: PHOTO(2), size: 78, delay: "0s" },
  { photo: PHOTO(1), size: 104, delay: ".4s" },
  { photo: PHOTO(3), size: 78, delay: ".8s" },
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
