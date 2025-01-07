import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  onClose: () => void;
};

function PopupLayout({ children, onClose }: LayoutProps) {
  return (
    <section
      className="w-screen h-screen
      flex items-center justify-center fixed z-50 top-0 right-0 left-0 bottom-0 m-auto"
    >
      {children}
      <footer
        onClick={() => onClose()}
        className="w-screen h-screen
   fixed -z-10 bg-black/30 top-0 right-0 left-0 bottom-0 m-auto"
      ></footer>
    </section>
  );
}

export default PopupLayout;
