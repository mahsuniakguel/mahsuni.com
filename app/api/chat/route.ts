import { getProfile } from "@/lib/chat/profile";
import {
  getChatConfig,
  requestCompletion,
  toTextStream,
  type ChatMessage,
} from "@/lib/chat/provider";
import { isRateLimited } from "@/lib/chat/rate-limit";
import { buildSystemPrompt } from "@/lib/chat/system-prompt";

const MAX_HISTORY = 12;
const MAX_MESSAGE_LENGTH = 1000;

function error(status: number, code: string, message: string) {
  return Response.json({ code, message }, { status });
}

function parseMessages(body: unknown): ChatMessage[] | null {
  const messages = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const parsed: ChatMessage[] = [];
  for (const m of messages.slice(-MAX_HISTORY)) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      !m.content.trim()
    ) {
      return null;
    }
    parsed.push({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) });
  }
  return parsed.at(-1)?.role === "user" ? parsed : null;
}

export async function POST(request: Request) {
  const config = getChatConfig();
  if (!config) {
    return error(
      503,
      "not_configured",
      "The chat isn't connected yet. Add CHAT_API_KEY to .env.local (see .env.example) and restart the server.",
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (isRateLimited(ip)) {
    return error(429, "rate_limited", "That's a lot of questions at once. Try again in a few minutes.");
  }

  const messages = parseMessages(await request.json().catch(() => null));
  if (!messages) {
    return error(400, "bad_request", "That message couldn't be sent. Try rephrasing it.");
  }

  let upstream: Response;
  try {
    const system = buildSystemPrompt(await getProfile());
    upstream = await requestCompletion(
      config,
      [{ role: "system", content: system }, ...messages],
      request.signal,
    );
  } catch (err) {
    console.error("[chat] request failed", err);
    return error(502, "provider_error", "The assistant couldn't be reached. Try again in a moment.");
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error(`[chat] provider responded ${upstream.status}`, detail.slice(0, 500));

    if (upstream.status === 429) {
      return error(429, "provider_rate_limited", "The assistant has reached its usage limit for now. Try again in a minute.");
    }
    if (upstream.status === 401 || upstream.status === 403) {
      return error(503, "provider_auth", "The chat is temporarily unavailable.");
    }
    return error(502, "provider_error", "The assistant couldn't answer just now. Try again in a moment.");
  }

  return new Response(toTextStream(upstream.body), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
