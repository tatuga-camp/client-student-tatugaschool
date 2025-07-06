import { ReactNode } from "react";

type Menu = { title: string; icon: ReactNode; url?: string };
type Props = {
  menuList: Menu[];
  onClick: (item: Menu) => void;
};
function Footbar({ menuList, onClick }: Props) {
  return (
    <nav className="fixed bottom-0 z-40 flex h-16 w-full items-center justify-center gap-20 border-t bg-white font-Anuphan">
      {menuList.map((list, index) => {
        return (
          <li
            onClick={() => onClick(list)}
            key={index}
            className="flex flex-col items-center justify-center gap-0 text-2xl text-gray-600"
          >
            {list.icon}
            <span className="text-xs font-semibold">{list.title}</span>
          </li>
        );
      })}
    </nav>
  );
}

export default Footbar;
