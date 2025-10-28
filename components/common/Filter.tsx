import React, { memo, ReactNode, use, useEffect, useRef } from "react";
import {
  FaSortAmountDown,
  FaSortAmountDownAlt,
  FaSortAmountUp,
} from "react-icons/fa";
import { IoFilterSharp } from "react-icons/io5";
import useClickOutside from "../../hook/useClickOutside";

const menuFilter: {
  title: FilterTitle;
  orderBy: "asc" | "desc";
}[] = [
  {
    title: "Sort by Score",
    orderBy: "desc",
  },
  {
    title: "Sort by Name",
    orderBy: "desc",
  },
  {
    title: "Sort By Number",
    orderBy: "desc",
  },
];
export type FilterTitle = "Sort by Score" | "Sort by Name" | "Sort By Number";
type Props = {
  onValue: (
    value: { title: FilterTitle; orderBy: "asc" | "desc" } | undefined,
  ) => void;
};
function Filter({ onValue }: Props) {
  const [filter, setFilter] = React.useState<
    {
      title: FilterTitle;
      orderBy: "asc" | "desc";
    }[]
  >(menuFilter);
  const filterRef = useRef<HTMLDivElement>(null);

  const [activeShow, setActiveShow] = React.useState(false);

  const [selectFilter, setSelectFilter] = React.useState<{
    title: FilterTitle;
    orderBy: "asc" | "desc";
  }>();

  useEffect(() => {
    onValue(selectFilter);
  }, [selectFilter]);

  useClickOutside(filterRef, () => {
    setActiveShow(false);
  });

  return (
    <div ref={filterRef} className="relative h-full">
      <button
        onClick={() => setActiveShow((prev) => !prev)}
        className="flex h-full items-center justify-center gap-1 rounded-2xl px-5 py-1 transition hover:bg-gray-300/50 active:bg-gray-300/70"
      >
        <IoFilterSharp /> Filter
      </button>
      <div
        className={`bg-white drop-shadow-md transition-height ${activeShow ? "h-40 w-40" : "h-0 w-40"} absolute top-14 z-10 flex flex-col overflow-clip rounded-2xl pb-0`}
      >
        {filter.map((menu, index) => (
          <button
            onClick={() => {
              setFilter((prev) => {
                return prev.map((list) => {
                  if (menu.title === list.title) {
                    return {
                      ...list,
                      orderBy: list.orderBy === "asc" ? "desc" : "asc",
                    };
                  } else {
                    return list;
                  }
                });
              });
              setSelectFilter(() => {
                return {
                  ...menu,
                  orderBy: menu.orderBy === "asc" ? "desc" : "asc",
                };
              });
            }}
            key={index}
            className={`flex ${
              menu.title === selectFilter?.title
                ? "gradient-bg text-white"
                : "bg-white hover:bg-gray-300/50"
            } items-center justify-between gap-1 px-2 py-2 text-sm`}
          >
            {menu.title}
            {menu?.orderBy === "desc" ? (
              <FaSortAmountDown />
            ) : (
              <FaSortAmountUp />
            )}
          </button>
        ))}
        <button
          onClick={() => {
            setSelectFilter(undefined);
          }}
          className={`flex items-center px-2 py-2 ${
            !selectFilter ? "g gradient-bg text-white" : "hover:bg-gray-300/50"
          } gap-1`}
        >
          Clear Filter
        </button>
      </div>
    </div>
  );
}

export default memo(Filter);
