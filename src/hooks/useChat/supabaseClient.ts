import OpenAI from 'openai';

// Import the mock supabase client
import { supabase } from '../../utils/supabaseClient';

export async function getOpenAIKey() {
  try {
    // Return a mock API key since we're not using Supabase
    return 'sk-mock-api-key';
  } catch (error) {
    console.error('Error fetching API key:', error);
    throw error;
  }
}

export async function createOpenAIClient() {
  // Use a mock API key
  const apiKey = 'sk-mock-api-key';
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });
}