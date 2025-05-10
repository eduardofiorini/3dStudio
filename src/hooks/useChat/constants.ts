export const ERROR_CONFIG = {
  MAX_ERRORS: 20,         // Maximum errors before silencing
  RESET_INTERVAL: 5000,   // Reset error count after 5 seconds of no errors
  COOLDOWN_PERIOD: 10000  // How long to silence errors
};

export const CHAT_CONFIG = {
  MAX_MESSAGES: 10,      // Maximum messages per session
  MODEL: "o3-mini-2025-01-31"         // OpenAI model to use
};