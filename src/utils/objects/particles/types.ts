import { Color } from 'three';

export interface FountainConfig {
  count: number;
  size: number;
  opacity: number;
  gravity: number;
  turbulence?: number;
  spread: {
    x: number;
    y: number;
    z: number;
  };
  initialBoost: number;
  lifetime: {
    min: number;
    max: number;
  };
  color: {
    hue: number;
    saturation: number;
    lightness: number;
  };
  colorRange?: {
    enabled: boolean;
    start: {
      hue: number;
      saturation: number;
      lightness: number;
    };
    end: {
      hue: number;
      saturation: number;
      lightness: number;
    };
  };
  blendingMode?: 'Additive' | 'Normal' | 'Multiply' | 'Subtractive';
  useDepthWrite?: boolean;
  style?: 'point' | 'textured';
  speedFactor?: number;
}