import Image from "next/image";
import type { Project } from "@/content/projects";

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ProjectCard({ project }: { project: Project }) {
  const { name, description, url, status, category, image } = project;
  const live = status?.toLowerCase() === "live";

  return (
    <li className="shrink-0 snap-start">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-(--card-h) w-(--card-w) flex-col overflow-hidden rounded-[14px] border border-line bg-surface/[0.96] p-4 transition duration-300 ease-out card-size hover:-translate-y-0.5 hover:border-ink/25 hover:bg-[#161c25]/95 focus-visible:-translate-y-0.5 sm:p-5"
      >
        {image ? (
          <div className="relative -mx-4 -mt-4 mb-3 h-[42%] overflow-hidden border-b border-line sm:-mx-5 sm:-mt-5">
            <Image
              src={image}
              alt=""
              fill
              sizes="288px"
              className="object-cover opacity-75 grayscale-[35%] transition duration-500 group-hover:opacity-100 group-hover:grayscale-0"
            />
          </div>
        ) : (
          category && <span className="text-xs text-faint">{category}</span>
        )}

        <h3 className="mt-auto text-[1.0625rem] leading-tight font-medium tracking-[-0.02em] sm:text-lg">
          {name}
        </h3>
        <p className="mt-1 line-clamp-2 text-pretty text-[0.8125rem] leading-snug text-muted sm:text-sm">
          {description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="truncate text-faint transition-colors group-hover:text-ink">
            {hostname(url)}
            <span className="sr-only"> (opens in a new tab)</span>
          </span>
          {status && (
            <span className="flex shrink-0 items-center gap-1.5 text-muted">
              <span
                aria-hidden
                className={`size-1.5 rounded-full ${live ? "bg-glass shadow-[0_0_8px_var(--glass)]" : "border border-faint"}`}
              />
              {status}
            </span>
          )}
        </div>
      </a>
    </li>
  );
}
