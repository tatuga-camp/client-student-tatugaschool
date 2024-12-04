import type { ReactNode } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { IoMenu } from "react-icons/io5";
import React from "react";
import useClickOutside from "../../hook/useClickOutside";

type LayoutProps = {
  children: ReactNode;
  code: string;
  setSelectMenu: React.Dispatch<React.SetStateAction<string>>;
  selectMenu: string;
};

function Layout({ children, code, setSelectMenu, selectMenu }: LayoutProps) {
  const [trigger, setTrigger] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  useClickOutside(sidebarRef, () => {
    setTrigger(false);
  });
  return (
    <div className="flex h-screen  flex-col">
      <Navbar trigger={trigger} setTrigger={setTrigger} />
      <div className="flex h-full ">
        <div ref={sidebarRef} className="h-full">
          <Sidebar
            menuList={[
              { title: "Dashboard", icon: <IoMenu />, url: "/" },
              { title: "Profile", icon: <IoMenu />, url: "/profile" },
            ]}
            setSelectMenu={setSelectMenu}
            active={trigger}
            selectMenu={selectMenu}
            code={code}
          />
        </div>
        {children}
      </div>
    </div>
  );
}

export default Layout;
