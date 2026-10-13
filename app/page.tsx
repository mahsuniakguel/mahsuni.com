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
        <h1 className="text-[clamp(2.25rem,min(6vw,8.5dvh),4.25rem)] leading-none font-medium tracking-[-0.045em]">
          {site.name}
        </h1>
        <p className="mt-4 max-w-[38ch] text-base leading-relaxed text-pretty tracking-[-0.005em] text-muted sm:mt-5 sm:text-[1.0625rem] short:mt-3">
          {site.tagline}
        </p>
        {socials.length > 0 && (
          <nav aria-label="Social profiles" className="mt-5 sm:mt-7 short:mt-4">
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

      <div className="pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-8 short:sm:pb-4">
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
