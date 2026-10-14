import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { story } from "@/content/story";

const title = `${story.title} · ${site.name}`;

export const metadata: Metadata = {
  title,
  description: story.intro,
  alternates: { canonical: "/story" },
  // Replaces the layout's openGraph and twitter objects as a whole, not field by field.
  openGraph: { type: "website", url: "/story", siteName: site.name, title, description: story.intro },
  twitter: { card: "summary_large_image", title, description: story.intro },
};

export default function StoryPage() {
  return (
    <main className="relative isolate min-h-dvh">
      <article className="gutter relative pb-[max(4rem,env(safe-area-inset-bottom))] sm:pb-28">
        <Link
          href="/"
          aria-label="Back"
          className="absolute top-[calc(max(var(--page-top)/2,var(--page-top)-3.5rem)-1rem)] left-[calc(var(--gutter)-0.6875rem)] grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M13 8H3M7.5 3.5 3 8l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        {/* Same place as the homepage heading. The arrow sits in the space above it. */}
        <header className="page-top">
          <h1 className="text-[clamp(2rem,min(4.8vw,7dvh),3.5rem)] leading-none font-bold tracking-[-0.03em]">
            {story.title}
          </h1>
          <p className="mt-4 text-base text-muted sm:mt-5 sm:text-[1.0625rem]">{story.intro}</p>
        </header>

        <div className="mt-10 max-w-[36rem] space-y-6 text-base leading-[1.75] text-pretty tracking-[-0.005em] text-ink/85 sm:mt-14 sm:text-[1.0625rem]">
          {story.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
