import dotenv from "dotenv";

dotenv.config();

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const PORT = process.env.PORT || 4000;

if (!GEMINI_API_KEY) {
  console.error(
    "[config] GEMINI_API_KEY is not set. " +
      "AI mapping will fail on every request. " +
      "Set this variable in your .env file (local) or deployment environment (production)."
  );
}

if (!OPENAI_API_KEY) {
  console.warn(
    "[config] OPENAI_API_KEY is not set. " +
      "Fallback AI provider will be unavailable. " +
      "Gemini failures will not be recoverable."
  );
}