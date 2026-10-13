# mahsuni.com

A one-screen personal site: an introduction, the projects I'm building, and a small chat that answers questions about me.

## Run it

```bash
cp .env.example .env.local   # add a free CHAT_API_KEY from https://console.groq.com/keys
npm install
npm run dev
```

Without a key the site works and the chat input stays disabled instead of pretending to answer.

## Edit content

| What | Where |
| --- | --- |
| Name, tagline, chat copy, example questions | `content/site.ts` |
| Projects | `content/projects.ts` |
| Social links | `content/socials.ts` |
| What the chat knows about me | `content/profile.md` |
| How the chat behaves | `lib/chat/system-prompt.ts` |

Everything outside HTML comments in `profile.md` is public: it's sent to the model and may be quoted to any visitor.

## Chat provider

The chat calls any OpenAI-compatible API from a server route (`app/api/chat/route.ts`), so the key never reaches the browser. Groq is the default; switch with environment variables:

| Provider | Settings |
| --- | --- |
| Groq (default) | `CHAT_API_KEY` |
| Google Gemini | `CHAT_PROVIDER=gemini`, `CHAT_MODEL=<model id>` |
| OpenRouter | `CHAT_PROVIDER=openrouter`, `CHAT_MODEL=<model id>:free` |
| Anything else | `CHAT_BASE_URL=<…/v1>`, `CHAT_MODEL=<model id>` |

Set the same variables in your host's dashboard before deploying. The homepage is static, so redeploy after changing them.
