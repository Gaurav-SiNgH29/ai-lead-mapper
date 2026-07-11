import dotenv from "dotenv";

// Load environment variables once, in one place. Every other module
// imports values FROM here instead of calling dotenv.config() itself —
// this guarantees env vars are ready before anything else runs, and
// avoids scattering dotenv.config() calls across multiple files.
dotenv.config();

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const PORT = process.env.PORT || 4000;