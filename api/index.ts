// Vercel serverless entry. The mobile app also has a browser fallback so the
// static deployment remains usable while this function is being wired to real
// database and alliance-chain services.
import { createApp } from "../apps/api/src/app";

export default createApp();
