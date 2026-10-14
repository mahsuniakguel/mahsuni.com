import Image from "next/image";
import type { Project } from "@/content/projects";

function Logo({ name, logo }: Pick<Project, "name" | "logo">) {
  const frame = "grid size-5 shrink-0 place-items-center overflow-hidden rounded-md ring-1 ring-line";

  if (logo) {
    return (
      <span className={frame}>
        <Image src={logo} alt="" width={20} height={20} className="size-full object-cover" />
      </span>
    );
  }

  return (
    <span aria-hidden className={`${frame} bg-ink/[0.06] text-[0.625rem] font-medium text-muted uppercase`}>
      {name.charAt(0)}
    </span>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  const { name, description, url, status, logo } = project;
  const live = status?.toLowerCase() === "live";

  return (
    <li className="shrink-0 snap-start">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex w-56 flex-col gap-1 border-t border-line pt-3 transition-colors duration-300 hover:border-ink/40 sm:w-60"
      >
        <span className="flex items-center justify-between gap-3">
          <h3 className="flex min-w-0 items-center gap-2.5 text-[0.9375rem] font-medium tracking-[-0.01em]">
            <Logo name={name} logo={logo} />
            <span className="truncate">{name}</span>
            <span
              aria-hidden
              className="-ml-1 -translate-x-1 text-xs text-muted opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
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
        <p className="truncate pl-[1.875rem] text-[0.8125rem] text-muted transition-colors group-hover:text-ink/80">
          {description}
          <span className="sr-only"> (opens in a new tab)</span>
        </p>
      </a>
    </li>
  );
}
