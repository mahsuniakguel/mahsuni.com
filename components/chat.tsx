"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

type Message = { id: number; role: "user" | "assistant"; content: string };
type Status = "idle" | "waiting" | "streaming";

class ChatError extends Error {
  constructor(
    message: string,
    readonly code?: string,
  ) {
    super(message);
  }
}

const FALLBACK_ERROR = "The assistant couldn't answer just now. Try again in a moment.";

function Thinking() {
  return (
    <div className="flex h-6 items-center gap-1.5" role="status">
      {[0, 160, 320].map((delay) => (
        <span
          key={delay}
          aria-hidden
          className="size-1 rounded-full bg-muted animate-[breathe_1.2s_ease-in-out_infinite]"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
      <span className="sr-only">Thinking</span>
    </div>
  );
}

export function Chat({
  enabled: configured,
  title,
  placeholder,
  prompts,
}: {
  enabled: boolean;
  title: string;
  placeholder: string;
  prompts: string[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  // The server knows best: if the key disappears after build, fall back to setup mode.
  const [enabled, setEnabled] = useState(configured);

  const controller = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const nextId = useRef(0);

  const titleId = useId();
  const panelId = useId();
  const busy = status !== "idle";
  const hasConversation = messages.length > 0;
  const showPanel = open && hasConversation;

  // Follow the answer as it streams in, unless the visitor scrolled up to read.
  useEffect(() => {
    const log = logRef.current;
    if (log && stickToBottom.current) log.scrollTop = log.scrollHeight;
  }, [messages, status, error, showPanel]);

  useEffect(() => () => controller.current?.abort(), []);

  async function ask(text: string, history: Message[] = messages) {
    const question = text.trim();
    if (!question || busy || !enabled) return;

    const thread: Message[] = [...history, { id: nextId.current++, role: "user", content: question }];
    const answerId = nextId.current++;
    setMessages(thread);
    setInput("");
    setError(null);
    setOpen(true);
    setStatus("waiting");
    stickToBottom.current = true;

    const abort = new AbortController();
    controller.current = abort;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: thread.map(({ role, content }) => ({ role, content })),
        }),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new ChatError(data?.message ?? FALLBACK_ERROR, data?.code);
      }

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        const content = answer;
        setMessages([...thread, { id: answerId, role: "assistant", content }]);
      }
      if (!answer.trim()) throw new ChatError("No answer came back. Try asking again.");
    } catch (err) {
      // Stopping keeps whatever arrived so far.
      if (abort.signal.aborted) return;
      if (err instanceof ChatError && err.code === "not_configured") {
        setEnabled(false);
        setMessages(history);
        setOpen(false);
        return;
      }
      setError(
        err instanceof ChatError
          ? err.message
          : "Couldn't reach the assistant. Check your connection and try again.",
      );
    } finally {
      if (controller.current === abort) {
        controller.current = null;
        setStatus("idle");
      }
    }
  }

  function retry() {
    const lastQuestion = messages.findLastIndex((m) => m.role === "user");
    if (lastQuestion === -1) return;
    ask(messages[lastQuestion].content, messages.slice(0, lastQuestion));
  }

  function stop() {
    controller.current?.abort();
    controller.current = null;
    setStatus("idle");
  }

  function startOver() {
    stop();
    setMessages([]);
    setError(null);
    setOpen(false);
    inputRef.current?.focus();
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && showPanel) {
      event.preventDefault();
      setOpen(false);
      inputRef.current?.focus();
    }
  }

  const quietButton =
    "whitespace-nowrap rounded-full border border-line px-3 py-1.5 text-[0.8125rem] text-muted transition-colors hover:border-ink/25 hover:text-ink";

  return (
    <section aria-labelledby={titleId} className="gutter relative" onKeyDown={onKeyDown}>
      <div data-sea-avoid className="relative max-w-[40rem]">
        {showPanel && (
          <div
            id={panelId}
            className="absolute inset-x-0 bottom-full z-20 mb-3 flex max-h-[min(30rem,calc(100dvh-12rem))] animate-[rise_220ms_ease-out] flex-col rounded-2xl border border-line bg-surface/[0.97] shadow-[0_24px_60px_-24px_rgb(0_0_0/0.7)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between py-2 pr-2 pl-4">
              <button
                type="button"
                onClick={startOver}
                className="rounded text-xs text-muted transition-colors hover:text-ink"
              >
                New conversation
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Hide conversation"
                className="grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-ink/[0.06] hover:text-ink"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div
              ref={logRef}
              role="log"
              aria-label="Conversation"
              aria-busy={busy}
              onScroll={(e) => {
                const el = e.currentTarget;
                stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
              }}
              className="flex flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-1 pb-5"
            >
              {messages.map((m) =>
                m.role === "user" ? (
                  <p
                    key={m.id}
                    className="max-w-[85%] self-end rounded-2xl bg-ink/[0.07] px-3.5 py-2 text-[0.9375rem] leading-snug break-words"
                  >
                    {m.content}
                  </p>
                ) : (
                  <p
                    key={m.id}
                    className="text-[0.9375rem] leading-relaxed break-words whitespace-pre-wrap text-ink/90"
                  >
                    {m.content}
                  </p>
                ),
              )}
              {status === "waiting" && <Thinking />}
              {error && (
                <div role="alert" className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                  <p className="text-[#dba895]">{error}</p>
                  <button
                    type="button"
                    onClick={retry}
                    className="rounded text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-ink/40"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <h2 id={titleId} className="text-[0.9375rem] font-medium tracking-[-0.015em] sm:text-base">
          {title}
        </h2>

        <form
          onSubmit={onSubmit}
          className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-sea/70 py-1.5 pr-1.5 pl-4 backdrop-blur-md transition-colors focus-within:border-glass/60"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => hasConversation && setOpen(true)}
            placeholder={placeholder}
            disabled={!enabled}
            aria-labelledby={titleId}
            aria-controls={showPanel ? panelId : undefined}
            maxLength={500}
            autoComplete="off"
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-base text-ink outline-none placeholder:text-faint disabled:cursor-not-allowed sm:text-[0.9375rem]"
          />
          {busy ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-lg border border-line px-3.5 py-2 text-sm text-ink transition-colors hover:border-ink/30"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!enabled || !input.trim()}
              className="rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-sky transition-colors hover:bg-white disabled:bg-transparent disabled:text-faint"
            >
              Ask
            </button>
          )}
        </form>

        <div className="prompts no-scrollbar -mx-1 mt-2 flex min-h-11 items-center gap-2 overflow-x-auto px-1 py-1.5">
          {!enabled ? (
            <p className="text-sm text-muted">
              The chat isn&apos;t connected yet. Add <code className="font-sans font-medium text-ink">CHAT_API_KEY</code> to{" "}
              <code className="font-sans font-medium text-ink">.env.local</code> to turn it on.
            </p>
          ) : hasConversation ? (
            !showPanel && (
              <>
                <button type="button" onClick={() => setOpen(true)} className={quietButton}>
                  Show conversation
                </button>
                <button type="button" onClick={startOver} className={quietButton}>
                  New conversation
                </button>
              </>
            )
          ) : (
            prompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => ask(prompt)} className={quietButton}>
                {prompt}
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
