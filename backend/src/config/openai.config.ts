import * as dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const apiKey = process.env.DEEPSEEK_API_KEY;
const baseURL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

if (!apiKey) {
  throw new Error('Missing DEEPSEEK_API_KEY in .env');
}

export const openaiClient = new OpenAI({
  apiKey,
  baseURL,
});

export const openaiConfig = {
  model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 4096,
};
