import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  const { name, description, url, status } = project;
  const live = status?.toLowerCase() === "live";

  return (
    <li className="shrink-0 snap-start">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-52 flex-col gap-1 border-t border-line pt-3 transition-colors duration-300 hover:border-ink/40 sm:w-56"
      >
        <span className="flex items-baseline justify-between gap-3">
          <h3 className="flex min-w-0 items-baseline gap-1.5 text-[0.9375rem] font-medium tracking-[-0.01em]">
            <span className="truncate">{name}</span>
            <span
              aria-hidden
              className="-translate-x-1 text-xs text-muted opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
            >
              ↗
            </span>
          </h3>
          {status && (
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-faint">
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${live ? "bg-glass shadow-[0_0_8px_var(--glass)]" : "border border-faint"}`}
              />
              {status}
            </span>
          )}
        </span>
        <p className="truncate text-[0.8125rem] text-muted transition-colors group-hover:text-ink/80">
          {description}
          <span className="sr-only"> (opens in a new tab)</span>
        </p>
      </a>
    </li>
  );
}
