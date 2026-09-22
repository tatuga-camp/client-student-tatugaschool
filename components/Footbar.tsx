import { useRouter } from "next/router";
import { ReactNode } from "react";

export type Menu = {
  title?: string;
  icon: ReactNode;
  url?: string;
  action?: "button" | "link";
  onClick?: () => void;
};

type Props = {
  menuList: Menu[];
  onClick?: (item: Menu) => void;
};

function Footbar({ menuList, onClick }: Props) {
  const router = useRouter();

  return (
    <nav
      className="fixed bottom-4 left-1/2 z-40 flex h-16 w-[min(98%,28rem)] -translate-x-1/2 items-center justify-around rounded-full border border-gray-100 bg-white/95 px-2 font-Anuphan shadow-[0_8px_30px_rgba(44,124,209,0.12)] backdrop-blur-md md:bottom-5 md:px-5"
      aria-label="Primary"
    >
      {menuList.map((list, index) => {
        const isActive = Boolean(
          list.url &&
            (router.asPath === list.url ||
              router.asPath.startsWith(list.url.split("?")[0] + "?") ||
              (list.url.includes("/subjects") &&
                router.pathname.includes("/subjects")) ||
              (list.url.includes("/subject/") &&
                !list.url.includes("/subjects") &&
                router.pathname.startsWith("/subject/[subjectId]") &&
                !router.pathname.includes("/assignment"))),
        );

        if (list.action === "button") {
          return (
            <button
              type="button"
              key={index}
              onClick={() => {
                if (list.onClick) list.onClick();
                else if (onClick) onClick(list);
              }}
              className="relative -top-5 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary-color text-white shadow-md"
            >
              {list.icon}
            </button>
          );
        }

        return (
          <button
            type="button"
            onClick={() => {
              if (list.onClick) list.onClick();
              else if (onClick) onClick(list);
            }}
            key={index}
            className={`group flex min-w-[4.5rem] cursor-pointer flex-col items-center justify-center gap-0.5 px-2 py-1 transition-colors duration-200 ${
              isActive
                ? "text-primary-color"
                : "text-gray-400 hover:text-primary-color"
            }`}
          >
            <div
              className={`flex items-center justify-center text-2xl transition-transform duration-200 ${
                isActive ? "-translate-y-0.5 scale-105" : ""
              }`}
            >
              {list.icon}
            </div>
            {list.title ? (
              <span className="max-w-[5.5rem] truncate text-[10px] font-semibold">
                {list.title}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export default Footbar;
