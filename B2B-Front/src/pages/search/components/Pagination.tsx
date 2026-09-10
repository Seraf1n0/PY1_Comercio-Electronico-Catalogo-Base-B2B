import React from "react";
import { usePagination, type UsePaginationProps } from "react-instantsearch";

// Tomado de https://www.algolia.com/doc/api-reference/widgets/pagination/react y el estilo es de tailwind
export default function Pagination(props: UsePaginationProps) {
  const {
    pages,
    currentRefinement,
    nbPages,
    isFirstPage,
    isLastPage,
    refine,
    createURL,
  } = usePagination(props);
  const firstPageIndex = 0;
  const previousPageIndex = currentRefinement - 1;
  const nextPageIndex = currentRefinement + 1;
  const lastPageIndex = nbPages - 1;

  return (
    <ul className="flex items-center justify-center gap-1 flex-wrap mt-8">
      <PaginationItem
        isDisabled={isFirstPage}
        href={createURL(firstPageIndex)}
        onClick={() => refine(firstPageIndex)}
      >
        «
      </PaginationItem>
      <PaginationItem
        isDisabled={isFirstPage}
        href={createURL(previousPageIndex)}
        onClick={() => refine(previousPageIndex)}
      >
        ‹
      </PaginationItem>
      {pages.map((page) => {
        const label = page + 1;
        const isCurrent = page === currentRefinement;

        return (
          <PaginationItem
            key={page}
            isDisabled={false}
            isCurrent={isCurrent}
            aria-label={`Page ${label}`}
            href={createURL(page)}
            onClick={() => refine(page)}
          >
            {label}
          </PaginationItem>
        );
      })}
      <PaginationItem
        isDisabled={isLastPage}
        href={createURL(nextPageIndex)}
        onClick={() => refine(nextPageIndex)}
      >
        ›
      </PaginationItem>
      <PaginationItem
        isDisabled={isLastPage}
        href={createURL(lastPageIndex)}
        onClick={() => refine(lastPageIndex)}
      >
        »
      </PaginationItem>
    </ul>
  );
}

type PaginationItemProps = Omit<React.ComponentProps<"a">, "onClick"> & {
  onClick: NonNullable<React.ComponentProps<"a">["onClick"]>;
  isDisabled: boolean;
  isCurrent?: boolean;
};

function PaginationItem({
  isDisabled,
  isCurrent,
  href,
  onClick,
  className,
  ...props
}: PaginationItemProps) {
  const estiloBase =
    "flex items-center justify-center min-w-[2.25rem] h-9 px-2 rounded-md text-sm font-medium transition-colors select-none";

  if (isDisabled) {
    return (
      <li>
        <span
          className={`${estiloBase} text-gray-300 cursor-not-allowed`}
          {...props}
        />
      </li>
    );
  }

  const stateStyles = isCurrent
    ? "bg-indigo-600 text-white shadow-sm"
    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700";

  return (
    <li>
      <a
        href={href}
        className={`${estiloBase} ${stateStyles} cursor-pointer`}
        onClick={(event) => {
          if (isModifierClick(event)) {
            return;
          }
          event.preventDefault();
          onClick(event);
        }}
        {...props}
      />
    </li>
  );
}

function isModifierClick(event: React.MouseEvent) {
  const isMiddleClick = event.button === 1;

  return Boolean(
    isMiddleClick ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
  );
}