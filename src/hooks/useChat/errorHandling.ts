// Error tracking state
export const errorState = {
  count: 0,
  lastError: 0,
  silenced: false
};

export function handleError(error: any) {
  const now = Date.now();
  
  // Reset error count if enough time has passed
  if (now - errorState.lastError > ERROR_CONFIG.RESET_INTERVAL) {
    errorState.count = 0;
    errorState.silenced = false;
  }

  // Update error state
  errorState.count++;
  errorState.lastError = now;

  // Check if we should silence errors
  if (errorState.count >= ERROR_CONFIG.MAX_ERRORS) {
    if (!errorState.silenced) {
      console.warn(`Excessive errors detected (${errorState.count}). Silencing similar errors for ${ERROR_CONFIG.COOLDOWN_PERIOD/1000}s`);
      errorState.silenced = true;
      
      // Reset after cooldown
      setTimeout(() => {
        errorState.count = 0;
        errorState.silenced = false;
        console.log('Error reporting re-enabled');
      }, ERROR_CONFIG.COOLDOWN_PERIOD);
    }
    return;
  }

  // Log error if not silenced
  if (!errorState.silenced) {
    if (error instanceof ReferenceError) {
      console.warn('Reference Error:', error.message);
    } else if (error instanceof TypeError) {
      console.warn('Type Error:', error.message);
    } else {
      console.error('Chat error:', error);
    }
  }
}