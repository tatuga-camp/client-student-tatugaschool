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
    <nav className="fixed bottom-5 left-1/2 z-40 flex h-16 w-[98%] max-w-md -translate-x-1/2 items-center justify-around rounded-full border border-gray-100 bg-white px-1 font-Anuphan shadow-[0_8px_30px_rgb(0,0,0,0.12)] md:px-5">
      {menuList.map((list, index) => {
        const isActive = false;

        if (list.action === "button") {
          return (
            <li
              key={index}
              onClick={() => {
                if (list.onClick) list.onClick();
                else if (onClick) onClick(list);
              }}
              className="relative -top-5 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary-color text-white"
            >
              {list.icon}
            </li>
          );
        }

        return (
          <li
            onClick={() => {
              if (list.onClick) list.onClick();
              else if (onClick) onClick(list);
            }}
            key={index}
            className={`group flex cursor-pointer flex-col items-center justify-center gap-1 transition-all duration-300 ${
              isActive ? "text-pink-500" : "text-gray-400 hover:text-pink-400"
            }`}
          >
            <div
              className={`flex items-center justify-center text-2xl transition-transform duration-300 ${isActive ? "-translate-y-1 scale-110" : ""}`}
            >
              {list.icon}
            </div>
            {list.title && (
              <span
                className={`text-[10px] font-semibold group-hover:block group-focus:block md:block`}
              >
                {list.title}
              </span>
            )}
          </li>
        );
      })}
    </nav>
  );
}

export default Footbar;
