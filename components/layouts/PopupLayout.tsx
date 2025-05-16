import type { ReactNode } from "react";
import { IoMdClose } from "react-icons/io";

type LayoutProps = {
  children: ReactNode;
  onClose: () => void;
};

function PopupLayout({ children, onClose }: LayoutProps) {
  return (
    <section className="fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex h-screen w-screen items-center justify-center">
      {children}
      <footer
        onClick={() => onClose()}
        className="fixed bottom-0 left-0 right-0 top-0 -z-10 m-auto h-screen w-screen bg-black/30"
      ></footer>
    </section>
  );
}

export default PopupLayout;
