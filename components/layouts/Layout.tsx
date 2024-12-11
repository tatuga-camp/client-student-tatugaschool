import type { ReactNode } from "react";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { IoMenu } from "react-icons/io5";
import React from "react";
import useClickOutside from "../../hook/useClickOutside";
import { useRouter } from "next/router";
import { useGetStudent, useGetSubjectById } from "../../react-query";
import { FaBookOpen, FaUser } from "react-icons/fa";

type LayoutProps = {
  children: ReactNode;
};

function Layout({ children }: LayoutProps) {
  const [trigger, setTrigger] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  useClickOutside(sidebarRef, () => {
    setTrigger(false);
  });

  const subject = useGetSubjectById({ id: router.query.subjectId as string });
  const student = useGetStudent();
  return (
    <div className="flex h-screen  flex-col">
      <Navbar trigger={trigger} setTrigger={setTrigger} />
      <div className="flex h-full ">
        <div ref={sidebarRef} className="h-full">
          {subject.data && student.data && (
            <Sidebar
              menuList={[
                {
                  title: "Profile",
                  icon: <FaUser />,
                  url: `/student/${student.data.id}`,
                },
                {
                  title: "Subject",
                  icon: <FaBookOpen />,
                  url: `/subject/${subject.data.id}`,
                },
                {
                  title: "Dashboard",
                  icon: <IoMenu />,
                  url: `/?subject_code=16ad5c`,
                },
              ]}
              active={trigger}
            />
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export default Layout;
