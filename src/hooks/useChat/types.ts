export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ErrorState {
  count: number;
  lastError: number;
  silenced: boolean;
}

export interface ChatConfig {
  MAX_MESSAGES: number;
  MODEL: string;
}