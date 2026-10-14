import Link from "next/link";
import { Chat } from "@/components/chat";
import { ProjectCard } from "@/components/project-card";
import { ProjectRail } from "@/components/project-rail";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { socials } from "@/content/socials";
import { story } from "@/content/story";
import { getChatConfig } from "@/lib/chat/provider";

const navLink =
  "rounded text-ink/80 underline decoration-ink/20 underline-offset-[5px] transition-colors hover:text-ink hover:decoration-ink/60";

export default function Home() {
  const chatEnabled = getChatConfig() !== null;

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      {/* Shifted down to --page-top rather than padded, so the header keeps its
          size and the projects and horizon below stay where they are. */}
      <header className="gutter relative top-[calc(var(--page-top)-2rem)] flex flex-1 flex-col py-8 short:top-[calc(var(--page-top)-1.25rem)] short:py-5">
        <h1 data-sea-avoid className="text-[clamp(2rem,min(4.8vw,7dvh),3.5rem)] leading-none font-bold tracking-[-0.03em]">
          {site.greeting}
        </h1>
        <p data-sea-avoid className="mt-4 max-w-[38ch] text-base leading-relaxed text-pretty tracking-[-0.005em] text-muted sm:mt-5 sm:text-[1.0625rem] short:mt-3">
          {site.tagline}
        </p>
        <nav data-sea-avoid aria-label="Links" className="mt-5 sm:mt-7 short:mt-4">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer me" className={navLink}>
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <Link href="/story" className={navLink}>
                {story.title}
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {projects.length > 0 && (
        <ProjectRail title={site.projectsTitle}>
          {projects.map((project) => (
            <ProjectCard key={project.url} project={project} />
          ))}
        </ProjectRail>
      )}

      <div className="min-h-6 flex-[0.55]" />

      <div className="pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-14 short:sm:pb-8">
        <Chat
          enabled={chatEnabled}
          title={site.chat.title}
          placeholder={site.chat.placeholder}
          prompts={site.chat.prompts}
        />
      </div>
    </main>
  );
}
