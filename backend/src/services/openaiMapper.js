import OpenAI from "openai";
import { OPENAI_API_KEY } from "../config/config.js";
import { OPENAI_MODEL, OPENAI_MAX_TOKENS, BASE_URL } from "../config/constants.js";
import { buildPrompt } from "../prompts/prompt.js";
import { CRM_FIELDS } from "../schema/crmSchema.js";
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  baseURL: BASE_URL,
});

// Strips markdown code fences from OpenAI responses — same defensive
// parsing as Gemini, since both models occasionally wrap JSON in fences
// despite being told not to.
function extractJson(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

// Sends one batch to OpenAI — used as a fallback when Gemini has
// exhausted all retries. Uses the same prompt as Gemini (pure text,
// provider-agnostic) so field mapping quality is consistent.
// One attempt only — if Gemini failed 3 times AND OpenAI fails,
// we've spent enough time on one batch; mark it as failed and move on.
export async function processBatchWithOpenAI(batch) {
  const prompt = buildPrompt(batch);

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    max_tokens: OPENAI_MAX_TOKENS,
    messages: [
      {
        role: "system",
        content:
          "You are a data mapping engine. Return only valid JSON exactly as instructed. No markdown, no explanation.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content || "";
  const parsed = extractJson(text);

  if (
    !Array.isArray(parsed.records) ||
    parsed.records.length !== batch.length
  ) {
    throw new Error(
      "OpenAI response 'records' array missing or doesn't match batch size"
    );
  }

  return parsed.records;
}