// Preserve the original console.error method
const originalConsoleError = console.error;

// Override console.error
console.error = function (...args) {
  // Check if the specific error message is present
  if (
    args.length > 0 &&
    typeof args[0] === 'string' &&
    args[0].includes('TransformControls: The attached 3D object must be a part of the scene graph')
  ) {
    // Suppress this specific error message
    return;
  }
  // Call the original console.error method for other messages
  originalConsoleError.apply(console, args);
};