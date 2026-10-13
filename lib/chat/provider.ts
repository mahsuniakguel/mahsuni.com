// Any provider with an OpenAI-compatible Chat Completions API works here.
// Pick one with CHAT_PROVIDER, or point CHAT_BASE_URL at another endpoint.
const presets = {
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
  },
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: undefined,
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    model: undefined,
  },
} satisfies Record<string, { baseUrl: string; model: string | undefined }>;

type PresetName = keyof typeof presets;

export type ChatConfig = {
  baseUrl: string;
  model: string;
  apiKey: string;
};

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Returns null when the chat isn't fully configured.
export function getChatConfig(): ChatConfig | null {
  const apiKey = process.env.CHAT_API_KEY?.trim();
  if (!apiKey) return null;

  const providerName = (process.env.CHAT_PROVIDER?.trim() || "groq") as PresetName;
  const preset = presets[providerName] as (typeof presets)[PresetName] | undefined;

  const baseUrl = process.env.CHAT_BASE_URL?.trim() || preset?.baseUrl;
  const model = process.env.CHAT_MODEL?.trim() || preset?.model;
  if (!baseUrl || !model) return null;

  return { baseUrl: baseUrl.replace(/\/+$/, ""), model, apiKey };
}

export function requestCompletion(
  config: ChatConfig,
  messages: ChatMessage[],
  signal: AbortSignal,
) {
  return fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      stream: true,
      temperature: 0.4,
      max_tokens: 500,
    }),
    signal,
  });
}

// Turns an OpenAI-style server-sent event stream into a plain text stream.
export function toTextStream(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const data = line.trim();
          if (!data.startsWith("data:")) continue;
          const payload = data.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const text = JSON.parse(payload).choices?.[0]?.delta?.content;
            if (typeof text === "string" && text) {
              controller.enqueue(encoder.encode(text));
            }
          } catch {
            // Ignore keep-alive comments and partial events.
          }
        }
      },
    }),
  );
}
