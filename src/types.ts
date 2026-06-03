export interface OverlayConfig {
  x: number;          // Left position in screen-space / or longitude offset in geo-space
  y: number;          // Top position in screen-space / or latitude offset in geo-space
  w: number;          // Width in screen px / or width span in degrees in geo-space
  h: number;          // Height in screen px / or height span in degrees in geo-space
  r: number;          // Rotation in degrees (-180 to 180)
  o: number;          // Opacity in percent (0 to 100)
  lat: number;        // Center latitude for geo-anchored mode
  lng: number;        // Center longitude for geo-anchored mode
  widthDeg: number;   // Longitude span in degrees
  heightDeg: number;  // Latitude span in degrees
  visible: boolean;   // Visibility toggle
  localImageSrc: string | null; // Base64 or object URL uploaded via file picker
}

export interface ProjectPhase {
  id: 'a' | 'b';
  phaseName: string;
  projectName: string;
  type: string;
  units: string;
  config: string;
  status: string;
  area: string;
  color: string;
  borderColor: string;
  coords: { lat: number; lng: number };
}

export type MapTileStyle = 'satellite' | 'street' | 'topo';

export type OverlayMode = 'geo' | 'screen';
