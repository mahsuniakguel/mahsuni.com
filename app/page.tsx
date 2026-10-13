import { Chat } from "@/components/chat";
import { ProjectCard } from "@/components/project-card";
import { ProjectRail } from "@/components/project-rail";
import { Sea } from "@/components/sea";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { socials } from "@/content/socials";
import { getChatConfig } from "@/lib/chat/provider";

const HORIZON_ID = "horizon";

export default function Home() {
  const chatEnabled = getChatConfig() !== null;

  return (
    <main className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <Sea horizonId={HORIZON_ID} />

      <header className="gutter flex flex-1 flex-col justify-center py-8 short:py-5">
        <h1 data-sea-avoid className="text-[clamp(2rem,min(4.8vw,7dvh),3.5rem)] leading-none font-bold tracking-[-0.03em]">
          {site.greeting}
        </h1>
        <p data-sea-avoid className="mt-4 max-w-[38ch] text-base leading-relaxed text-pretty tracking-[-0.005em] text-muted sm:mt-5 sm:text-[1.0625rem] short:mt-3">
          {site.tagline}
        </p>
        {socials.length > 0 && (
          <nav data-sea-avoid aria-label="Social profiles" className="mt-5 sm:mt-7 short:mt-4">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="rounded text-ink/80 underline decoration-ink/20 underline-offset-[5px] transition-colors hover:text-ink hover:decoration-ink/60"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      {projects.length > 0 && (
        <ProjectRail title={site.projectsTitle} horizonId={HORIZON_ID}>
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
