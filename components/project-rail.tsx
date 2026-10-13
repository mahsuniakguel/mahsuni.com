"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d={direction === "left" ? "M10 3.5 5.5 8l4.5 4.5" : "M6 3.5 10.5 8 6 12.5"}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// A horizontal row of projects that sits on the horizon line. Arrows appear
// only when the row overflows; swiping, trackpads, and Tab work regardless.
export function ProjectRail({
  title,
  horizonId,
  children,
}: {
  title: string;
  horizonId: string;
  children: ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      const atStart = list.scrollLeft <= 4;
      const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 4;
      setEdges((prev) =>
        prev.atStart === atStart && prev.atEnd === atEnd ? prev : { atStart, atEnd },
      );
    };

    update();
    list.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => {
      list.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const scroll = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const smooth = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    list.scrollBy({
      left: direction * list.clientWidth * 0.75,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const overflows = !(edges.atStart && edges.atEnd);
  const button =
    "grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink disabled:pointer-events-none disabled:opacity-30";

  const mask = [
    edges.atStart ? "black 0" : "transparent 0, black var(--gutter)",
    edges.atEnd ? "black 100%" : "black calc(100% - 4rem), transparent 100%",
  ].join(", ");

  return (
    <section aria-labelledby="projects-title" className="relative">
      <div className="gutter flex items-center justify-between">
        <h2 id="projects-title" className="text-sm text-muted">
          {title}
        </h2>
        <div className={`-mr-2 flex gap-1 ${overflows ? "" : "invisible"}`}>
          <button
            type="button"
            className={button}
            onClick={() => scroll(-1)}
            disabled={edges.atStart}
            aria-label="Previous projects"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            className={button}
            onClick={() => scroll(1)}
            disabled={edges.atEnd}
            aria-label="More projects"
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>

      <div className="relative mt-3">
        <div id={horizonId} aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-ink/15" />
        <ul
          ref={listRef}
          className="gutter no-scrollbar relative flex snap-x snap-mandatory gap-3 overflow-x-auto py-1.5 sm:gap-4"
          style={{
            scrollPaddingInline: "var(--gutter)",
            maskImage: `linear-gradient(to right, ${mask})`,
          }}
        >
          {children}
        </ul>
      </div>
    </section>
  );
}
