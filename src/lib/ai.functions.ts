import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const SERPER_URL = "https://google.serper.dev/search";

async function groqChat(messages: Array<{ role: string; content: string }>, opts?: { model?: string; temperature?: number; max_tokens?: number }) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY missing");
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts?.model ?? "llama-3.3-70b-versatile",
      temperature: opts?.temperature ?? 0.85,
      max_tokens: opts?.max_tokens ?? 1024,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content as string ?? "";
}

async function serperSearch(query: string) {
  const key = process.env.SERPER_API_KEY;
  if (!key) throw new Error("SERPER_API_KEY missing");
  const res = await fetch(SERPER_URL, {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num: 8 }),
  });
  if (!res.ok) throw new Error(`Serper error ${res.status}`);
  return res.json();
}

function buildSystemPrompt(c: Record<string, unknown>) {
  return [
    `You are ${c.name}. ${c.tagline ?? ""}`.trim(),
    c.personality ? `Personality: ${c.personality}` : "",
    Array.isArray(c.traits) && c.traits.length ? `Traits: ${(c.traits as string[]).join(", ")}` : "",
    c.speaking_style ? `Speaking style: ${c.speaking_style}` : "",
    c.tone ? `Tone: ${c.tone}` : "",
    c.backstory ? `Backstory: ${c.backstory}` : "",
    Array.isArray(c.powers) && c.powers.length ? `Powers: ${(c.powers as string[]).join(", ")}` : "",
    Array.isArray(c.weaknesses) && c.weaknesses.length ? `Weaknesses: ${(c.weaknesses as string[]).join(", ")}` : "",
    c.memory_rules ? `Memory rules: ${c.memory_rules}` : "",
    c.system_prompt ? `Additional rules: ${c.system_prompt}` : "",
    "Stay fully in character. Never break the fourth wall.",
  ].filter(Boolean).join("\n");
}

// Run a 20-prompt simulation against a character
export const simulateCharacter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    character: z.record(z.string(), z.unknown()),
    samplePrompts: z.array(z.string()).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    if (!context.userId) throw new Error("Unauthorized");
    const prompts = data.samplePrompts ?? [
      "Hi, who are you?","What do you want from me?","Tell me your darkest secret.",
      "Show me your power.","Why should I trust you?","Say something romantic.",
      "What scares you?","Insult me.","Compliment me.","Describe your home.",
      "What's your weakness?","Tell me a joke.","If I died, what would you do?",
      "Teach me your strongest move.","Are you a hero or a villain?","Sing me a song.",
      "What's your favorite memory?","Lie to me.","Be brutally honest.","Goodbye for now."
    ];
    const sys = buildSystemPrompt(data.character);
    const results: Array<{ prompt: string; reply: string }> = [];
    for (const p of prompts) {
      try {
        const reply = await groqChat([
          { role: "system", content: sys },
          { role: "user", content: p },
        ], { max_tokens: 220 });
        results.push({ prompt: p, reply });
      } catch (e) {
        results.push({ prompt: p, reply: `[error: ${(e as Error).message}]` });
      }
    }
    return { results };
  });

// Generate a character draft from a name (uses Serper if scraping enabled, then GROQ to structure)
export const aiGenerateCharacterDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    name: z.string().min(1).max(120),
    scrape: z.boolean().default(false),
    sources: z.array(z.enum(["web","reddit","wiki","youtube"])).default(["web"]),
  }).parse(d))
  .handler(async ({ data }) => {
    let context = "";
    if (data.scrape) {
      const queries: string[] = [];
      if (data.sources.includes("web")) queries.push(`${data.name} character personality lore`);
      if (data.sources.includes("reddit")) queries.push(`${data.name} site:reddit.com personality`);
      if (data.sources.includes("wiki")) queries.push(`${data.name} site:fandom.com`);
      if (data.sources.includes("youtube")) queries.push(`${data.name} character analysis site:youtube.com`);
      const all: string[] = [];
      for (const q of queries) {
        try {
          const r = await serperSearch(q);
          for (const item of (r.organic ?? []).slice(0, 5)) {
            all.push(`- ${item.title}: ${item.snippet}`);
          }
        } catch (e) {
          all.push(`(search failed: ${(e as Error).message})`);
        }
      }
      context = all.join("\n").slice(0, 6000);
    }

    const sys = `You are an expert character designer for an interactive AI roleplay app. Given a name${data.scrape ? " and research snippets" : ""}, output ONLY a JSON object matching this schema:
{
 "name": string, "tagline": string, "description": string, "backstory": string,
 "universe": string, "personality": string, "tone": string, "speaking_style": string,
 "traits": string[], "powers": string[], "weaknesses": string[], "special_abilities": string[],
 "aggression": number(0-100), "friendliness": number(0-100), "danger": number(0-100), "humor": number(0-100),
 "can_kill": boolean, "is_nsfw": boolean,
 "system_prompt": string, "memory_rules": string,
 "greeting_message": string, "starter_scenarios": string[], "tags": string[]
}
Return raw JSON only, no markdown.`;

    const user = data.scrape
      ? `Character name: ${data.name}\n\nResearch:\n${context}`
      : `Character name: ${data.name}`;
    const raw = await groqChat([
      { role: "system", content: sys },
      { role: "user", content: user },
    ], { temperature: 0.7, max_tokens: 1500 });
    const cleaned = raw.replace(/^```json\s*|\s*```$/g, "").trim();
    try {
      return { draft: JSON.parse(cleaned) };
    } catch {
      return { draft: null, raw: cleaned };
    }
  });
