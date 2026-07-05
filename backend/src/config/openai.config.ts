import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const apiKey = process.env.DEEPSEEK_API_KEY;
const baseURL = process.env.DEEPSEEK_BASE_URL;
const model = process.env.DEEPSEEK_MODEL;

const missing: string[] = [];
if (!apiKey) {
  missing.push('DEEPSEEK_API_KEY');
}
if (!baseURL) {
  missing.push('DEEPSEEK_BASE_URL');
}
if (!model) {
  missing.push('DEEPSEEK_MODEL');
}

if (missing.length > 0) {
  throw new Error(`Missing Error`);
}

export const openaiClient = new OpenAI({
  apiKey,
  baseURL,
});

export const openaiConfig = {
  model: model,
  temperature: 0.7,
  maxTokens: 4096,
};
