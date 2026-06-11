"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { SectionLabel } from "./SectionLabel";

/** Netflix-style horizontal scroll row with arrow controls. */
export function MediaRow({
  label,
  title,
  viewAllHref,
  children,
}: {
  label?: string;
  title: string;
  viewAllHref?: string;
  children: React.ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * (scroller.current.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <section className="group/row">
      <div className="container-site mb-4 flex items-end justify-between gap-4">
        <div>
          {label && <SectionLabel className="mb-1.5">{label}</SectionLabel>}
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="btn-ghost hidden text-xs sm:inline-flex"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-zinc-300 backdrop-blur transition hover:border-race/60 hover:text-white lg:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-zinc-300 backdrop-blur transition hover:border-race/60 hover:text-white lg:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-10 [scroll-padding-inline:1rem]"
      >
        {children}
      </div>
    </section>
  );
}

/** Fixed-width snap item for MediaRow children. */
export function RowItem({ children }: { children: React.ReactNode }) {
  return <div className="w-[260px] shrink-0 snap-start sm:w-[300px] lg:w-[320px]">{children}</div>;
}
