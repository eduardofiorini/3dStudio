const HDRI_PATHS = {
  apartment: 'apartment.hdr',
  city: 'city.hdr', 
  dawn: 'dawn.hdr',
  forest: 'forest.hdr',
  lobby: 'lobby.hdr',
  night: 'night.hdr',
  park: 'park.hdr',
  studio: 'studio.hdr',
  sunset: 'sunset.hdr',
  warehouse: 'warehouse.hdr'
} as const;

export async function getHDRIUrl(preset: keyof typeof HDRI_PATHS): Promise<string | undefined> {
  try {
    // Return undefined to fall back to built-in preset
    return undefined;
  } catch (error) {
    console.warn('Failed to load custom HDRI:', error);
  }

  // Return undefined to fall back to built-in preset
  return undefined;
}