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
        className="group flex w-56 flex-col gap-1 rounded-xl border border-line bg-surface/[0.96] px-4 py-3.5 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-ink/25 hover:bg-[#161c25]/95 focus-visible:-translate-y-0.5 sm:w-60"
      >
        <span className="flex items-baseline justify-between gap-3">
          <h3 className="truncate text-[0.9375rem] font-medium tracking-[-0.01em]">{name}</h3>
          {status && (
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
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
