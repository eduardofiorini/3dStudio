# The Browser Lab

A 3D editor and creative coding environment that runs entirely in the browser. Built with React, Three.js, and TypeScript. 

<img src="./public/media/demo.gif" alt="Demo" width="800" />

## Features

- Full 3D scene editor with transform controls (translate, rotate, scale)
- Physics simulation with Rapier
   - Dynamic, static, and kinematic body types
   - Realistic collision detection and response
   - Configurable physics properties (mass, friction, restitution)
- Particle systems
- Particle systems
- Code editor for custom Three.js scripts
- Material and shader editor
- Timeline for animations
   - Keyframe-based animation system
   - Support for position, rotation, and scale keyframes
   - Visual timeline editor with drag-and-drop keyframes
- Camera controls and preview
- Scene hierarchy management
- WebXR support

## Getting Started

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Start the development server
   ```bash
   npm run dev
   ```

## AI Features (Optional)

This version of the Browser Lab has AI features disabled by default. To enable AI features like chat assistance and image generation, you'll need to:

1.  Set up a Supabase project and enable the Edge Functions.
2.  Add the following entries as Edge Function secrets in your Supabase project. You can find this under the "Secrets" tab within the "Edge Functions" section:
    *   `OPENAI_API_KEY` with your OpenAI API key
    *   `STABILITY_API_KEY` with your Stability AI API key

3.  Create the Edge Functions under the 'Functions' tab within the 'Edge Functions' section. This ensures users can access AI functionality securely, without exposing any API keys.

4.  Update the `.env` file with your Supabase URL and anon key:
    ```
    VITE_SUPABASE_URL=your_supabase_url_here
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
    ```

## Features Requiring Supabase

The following features require a Supabase connection:

## OpenAI
- AI Chat Assistant: Uses OpenAI to generate Three.js code based on your prompts
- Audio Transcription: Converts speech to text for chat commands
<img src="./public/media/openai.gif" alt="Demo" width="800" />

## StabilityAI
- AI Image Generation: Uses Stability AI to transform your viewport captures based on text prompts
<img src="./public/media/stability.gif" alt="Demo" width="800" />

## License

MIT