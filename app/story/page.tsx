import type { Metadata } from "next";
import Link from "next/link";
import { Sea } from "@/components/sea";
import { site } from "@/content/site";
import { story } from "@/content/story";

const HORIZON_ID = "story-horizon";

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
      {/* The sea stays put while the story scrolls over it. */}
      <div aria-hidden className="fixed inset-0 -z-10">
        <Sea horizonId={HORIZON_ID} />
        <div className="absolute inset-x-0 top-[62%]">
          <div id={HORIZON_ID} />
        </div>
      </div>

      <article className="gutter pt-10 pb-[max(4rem,env(safe-area-inset-bottom))] sm:pt-14 sm:pb-28">
        <Link
          href="/"
          className="rounded text-sm text-muted transition-colors hover:text-ink"
        >
          ← Back
        </Link>

        <header className="mt-16 sm:mt-24">
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
