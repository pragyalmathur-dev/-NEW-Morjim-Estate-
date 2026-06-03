import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Sparkles, Upload } from 'lucide-react';
import { OverlayConfig, MapTileStyle, OverlayMode } from '../types';
import { getGeneratedSitePlanSVG } from '../utils/sitePlans';

interface MapContainerProps {
  activeOverlayTab: 'a' | 'b';
  overlayConfigs: { a: OverlayConfig; b: OverlayConfig };
  mapStyle: MapTileStyle;
  overlayMode: OverlayMode;
  setMapZoomState: (zoom: number) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
}

export default function MapContainer({
  activeOverlayTab,
  overlayConfigs,
  mapStyle,
  overlayMode,
  setMapZoomState,
  mapRef,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Track pixel calculations for visual rendering
  const [pixelPositions, setPixelPositions] = useState<{
    a: { left: number; top: number; width: number; height: number; rotate: number; opacity: number };
    b: { left: number; top: number; width: number; height: number; rotate: number; opacity: number };
  }>({
    a: { left: 150, top: 120, width: 300, height: 300, rotate: 0, opacity: 0.85 },
    b: { left: 500, top: 120, width: 300, height: 300, rotate: 0, opacity: 0.85 },
  });

  const tileLayersRef = useRef<{ [key in MapTileStyle]?: L.TileLayer }>({});

  // Refs to dynamic values to prevent stale closures inside Leaflet event listeners
  const overlayConfigsRef = useRef(overlayConfigs);
  const overlayModeRef = useRef(overlayMode);

  useEffect(() => {
    overlayConfigsRef.current = overlayConfigs;
  }, [overlayConfigs]);

  useEffect(() => {
    overlayModeRef.current = overlayMode;
  }, [overlayMode]);

  // Center Coordinates for Morjim Estate
  const CENTER_LAT = 15.640944;
  const CENTER_LNG = 73.743222;

  // Set up Map instance (runs once on mount)
  useEffect(() => {
    if (!containerRef.current || mapInitialized) return;

    // Leaflet map container initialization
    const map = L.map(containerRef.current, {
      center: [CENTER_LAT, CENTER_LNG],
      zoom: 17,
      zoomControl: false,
      attributionControl: true,
    });

    mapRef.current = map;

    // Define tile layers with Google Maps rasters (highly reliable and exact match to standard maps)
    const googleSatellite = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      {
        attribution: 'Map data © Google',
        maxZoom: 22,
      }
    );

    const googleStreet = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      {
        attribution: 'Map data © Google',
        maxZoom: 22,
      }
    );

    const googleTerrain = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      {
        attribution: 'Map data © Google',
        maxZoom: 22,
      }
    );

    tileLayersRef.current = {
      satellite: googleSatellite,
      street: googleStreet,
      topo: googleTerrain,
    };

    // Add satellite layer as default
    googleSatellite.addTo(map);

    // Custom branded pins using HTML div markers
    const createCustomIcon = (phaseNumber: string, bgColor: string, borderColor: string) => {
      return L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div class="relative group cursor-pointer">
            <!-- Pulsing outer halo -->
            <div class="absolute -top-1.5 -left-1.5 w-10 h-10 bg-white/30 rounded-full animate-ping pointer-events-none duration-1000"></div>
            <!-- Pin Center -->
            <div 
              style="background-color: ${bgColor}; border-color: #ffffff;" 
              class="relative w-7 h-7 border-[2.5px] rounded-full shadow-lg flex items-center justify-center font-serif text-xs font-bold text-white transition-all transform duration-300 hover:scale-110 active:scale-95"
            >
              ${phaseNumber}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    };

    // Pin for Phase 1
    const p1Marker = L.marker([CENTER_LAT, CENTER_LNG], {
      icon: createCustomIcon('1', '#008e62', '#006b4a'),
    }).addTo(map);

    p1Marker.bindPopup(`
      <div class="p-2 font-sans select-none text-[#1a1a1a]">
        <div class="font-serif text-sm font-semibold text-[#008e62] border-b border-[#e6f5f0] pb-1 mb-1">
          Morjim Estate — Phase 1
        </div>
        <div class="text-[11px] text-[#4a4a4a]">
          Premium luxury estate villas located in the serene coastal woodlands of Morjim, North Goa.
        </div>
      </div>
    `);

    // Pin for Phase 2 (nearby)
    const p2Marker = L.marker([CENTER_LAT + 0.002, CENTER_LNG + 0.003], {
      icon: createCustomIcon('2', '#c8860a', '#a06a00'),
    }).addTo(map);

    p2Marker.bindPopup(`
      <div class="p-2 font-sans select-none text-[#1a1a1a]">
        <div class="font-serif text-sm font-semibold text-[#c8860a] border-b border-amber-50 pb-1 mb-1">
          Morjim Estate — Phase 2
        </div>
        <div class="text-[11px] text-[#4a4a4a]">
          Boutique forest villas offering pristine private sanctuaries near Chapora river and Morjim beach.
        </div>
      </div>
    `);

    const updatePixels = () => {
      try {
        if (!map || (map as any)._removed || !(map as any)._loaded || !(map as any)._mapPane) return;
        setMapZoomState(map.getZoom());
        
        const configs = overlayConfigsRef.current;
        const mode = overlayModeRef.current;

        const nextPositions: any = {};
        let hasError = false;

        ['a', 'b'].forEach((idKey) => {
          const id = idKey as 'a' | 'b';
          const cfg = configs[id];
          if (!cfg) return;

          if (mode === 'geo') {
            try {
              if (!map || (map as any)._removed || !(map as any)._mapPane) {
                hasError = true;
                return;
              }
              // Geo-anchored positioning calculation
              const centerPt = map.latLngToContainerPoint([cfg.lat, cfg.lng]);
              
              // Project bounding endpoints to calculate width/height
              const swPt = map.latLngToContainerPoint([cfg.lat - cfg.heightDeg / 2, cfg.lng - cfg.widthDeg / 2]);
              const nePt = map.latLngToContainerPoint([cfg.lat + cfg.heightDeg / 2, cfg.lng + cfg.widthDeg / 2]);

              const computedWidth = Math.abs(nePt.x - swPt.x);
              const computedHeight = Math.abs(swPt.y - nePt.y);

              nextPositions[id] = {
                left: centerPt.x - computedWidth / 2,
                top: centerPt.y - computedHeight / 2,
                width: computedWidth,
                height: computedHeight,
                rotate: cfg.r,
                opacity: cfg.o,
              };
            } catch (err) {
              hasError = true;
            }
          } else {
            // Standard screen absolute coordinates mapping
            nextPositions[id] = {
              left: cfg.x,
              top: cfg.y,
              width: cfg.w,
              height: cfg.h,
              rotate: cfg.r,
              opacity: cfg.o,
            };
          }
        });

        if (!hasError) {
          setPixelPositions((prev) => ({
            ...prev,
            ...nextPositions,
          }));
        }
      } catch (err) {
        console.warn("Leaflet positioning update postponed until ready:", err);
      }
    };

    // Hook listeners for Map viewport transformations
    map.on('move', updatePixels);
    map.on('zoom', updatePixels);
    map.on('viewreset', updatePixels);

    // Dynamic resize observer to prevent zero height containment issues in React layout frame
    const resizeObserver = new ResizeObserver(() => {
      try {
        if (!map || (map as any)._removed || !(map as any)._mapPane) return;
        map.invalidateSize();
        updatePixels();
      } catch (e) {
        // Safe check
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial projection push & safety delayed alignment refresh
    setMapInitialized(true);
    updatePixels();

    const initTimeout = setTimeout(() => {
      try {
        if (!map || (map as any)._removed || !(map as any)._mapPane) return;
        map.invalidateSize();
        updatePixels();
      } catch (e) {}
    }, 200);

    return () => {
      clearTimeout(initTimeout);
      resizeObserver.disconnect();
      try {
        map.remove();
      } catch (e) {
        console.warn("Leaflet cleanup warning:", e);
      }
      mapRef.current = null;
    };
  }, []);

  // Handle map style changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || (map as any)._removed || !(map as any)._mapPane) return;

    (Object.keys(tileLayersRef.current) as MapTileStyle[]).forEach((style) => {
      const layer = tileLayersRef.current[style];
      if (layer) {
        if (style === mapStyle) {
          try {
            layer.addTo(map);
            layer.bringToBack();
          } catch (e) {}
        } else {
          try {
            map.removeLayer(layer);
          } catch (e) {}
        }
      }
    });
  }, [mapStyle]);

  // Sync state config translations on configuration changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || (map as any)._removed || !(map as any)._mapPane) return;

    const recalculatePixelPositions = () => {
      try {
        if (!map || (map as any)._removed || !(map as any)._loaded || !(map as any)._mapPane) return;
        setMapZoomState(map.getZoom());
        
        const nextPositions: any = {};
        let hasError = false;

        ['a', 'b'].forEach((idKey) => {
          const id = idKey as 'a' | 'b';
          const cfg = overlayConfigs[id];
          if (!cfg) return;

          if (overlayMode === 'geo') {
            try {
              if (!map || (map as any)._removed || !(map as any)._mapPane) {
                hasError = true;
                return;
              }
              const centerPt = map.latLngToContainerPoint([cfg.lat, cfg.lng]);
              const swPt = map.latLngToContainerPoint([cfg.lat - cfg.heightDeg / 2, cfg.lng - cfg.widthDeg / 2]);
              const nePt = map.latLngToContainerPoint([cfg.lat + cfg.heightDeg / 2, cfg.lng + cfg.widthDeg / 2]);

              const computedWidth = Math.abs(nePt.x - swPt.x);
              const computedHeight = Math.abs(swPt.y - nePt.y);

              nextPositions[id] = {
                left: centerPt.x - computedWidth / 2,
                top: centerPt.y - computedHeight / 2,
                width: computedWidth,
                height: computedHeight,
                rotate: cfg.r,
                opacity: cfg.o,
              };
            } catch (err) {
              hasError = true;
            }
          } else {
            nextPositions[id] = {
              left: cfg.x,
              top: cfg.y,
              width: cfg.w,
              height: cfg.h,
              rotate: cfg.r,
              opacity: cfg.o,
            };
          }
        });

        if (!hasError) {
          setPixelPositions((prev) => ({
            ...prev,
            ...nextPositions,
          }));
        }
      } catch (err) {
        console.warn("Recalculation postponed until map is ready:", err);
      }
    };

    recalculatePixelPositions();
  }, [overlayConfigs, overlayMode]);

  return (
    <div className="relative flex-1 h-full overflow-hidden bg-[#faf8f4]">
      {/* Map Division */}
      <div id="map" ref={containerRef} className="w-full h-full z-0" />

      {/* Map Utilities Overlays (Site Plans) */}
      {['a', 'b'].map((idKey) => {
        const id = idKey as 'a' | 'b';
        const config = overlayConfigs[id];
        const pixels = pixelPositions[id];
        
        if (!config.visible) return null;

        // Determine if local uploaded file or actual server image
        const hasCustom = !!config.localImageSrc;
        const serverSrc = getGeneratedSitePlanSVG(id);
        const isA = id === 'a';

        return (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: `${pixels.left}px`,
              top: `${pixels.top}px`,
              width: `${pixels.width}px`,
              height: `${pixels.height}px`,
              transform: `rotate(${pixels.rotate}deg)`,
              opacity: pixels.opacity / 100,
              pointerEvents: 'none',
              transformOrigin: 'center center',
              zIndex: 10,
            }}
            className="transition-all duration-75 shadow-sm"
          >
            {/* Image render or Upload notice helper */}
            <div className="w-full h-full relative" style={{ pointerEvents: 'none' }}>
              <img
                src={config.localImageSrc || serverSrc}
                alt={`Site Plan ${isA ? 'ME1' : 'ME2'}`}
                className="w-full h-full object-fill pointer-events-none rounded border border-transparent"
                style={{ contentVisibility: 'auto' }}
                onError={(e) => {
                  // Fallback if file doesn't exist
                  if (!config.localImageSrc) {
                    // Try to hide the broken image element
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    const placeholder = parent?.querySelector('.plan-placeholder');
                    if (placeholder) {
                      (placeholder as HTMLElement).style.display = 'flex';
                    }
                  }
                }}
                onLoad={(e) => {
                  // Ensure visible
                  (e.target as HTMLImageElement).style.display = 'block';
                  const parent = (e.target as HTMLElement).parentElement;
                  const placeholder = parent?.querySelector('.plan-placeholder');
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'none';
                  }
                }}
              />
              {/* Fallback Beautiful Dashboard placeholder block */}
              <div
                className="plan-placeholder w-full h-full absolute inset-0 flex flex-col items-center justify-center p-6 text-center rounded border-2 border-dashed select-none pointer-events-none"
                style={{
                  backgroundColor: isA ? 'rgba(0,142,98,0.18)' : 'rgba(200,134,10,0.18)',
                  borderColor: isA ? 'rgba(0,142,98,0.7)' : 'rgba(200,134,10,0.7)',
                  color: isA ? '#006b4a' : '#a06a00',
                  display: 'flex', // Fallback defaults to visible, img onLoad handles hiding
                }}
              >
                <Upload className="w-8 h-8 mb-2 animate-bounce opacity-80" />
                <div className="font-serif text-sm font-semibold mb-1">
                  Morjim Estate - Plan {isA ? 'ME1' : 'ME2'}
                </div>
                <p className="text-[10px] leading-normal font-sans max-w-[200px] opacity-90 mb-1.5">
                  {hasCustom 
                    ? 'Previewing uploaded file' 
                    : `Please place "site-plan_ME${isA ? '1' : '2'}.png" inside "/public/assets/siteplan/" or use the developer panel to select a local file instantly.`
                  }
                </p>
                <div className="text-[9px] px-2 py-0.5 rounded bg-white/70 font-mono shadow-sm">
                  {overlayMode === 'geo' 
                    ? `Lat: ${config.lat.toFixed(5)}, Lng: ${config.lng.toFixed(5)}` 
                    : `X: ${config.x}px, Y: ${config.y}px`
                  }
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Compass/Attribution Rose Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none bg-white/90 backdrop-blur-sm border border-[#d8d0c8] p-2.5 rounded-md shadow-sm hidden md:flex items-center gap-2.5 select-none text-[#1a1a1a]">
        <Compass className="w-5 h-5 text-[#008e62] animate-spin-slow" />
        <div>
          <div className="text-[8px] font-bold tracking-[2px] uppercase text-[#8a8a8a]">Goa North</div>
          <div className="font-serif text-[11px] font-semibold text-[#1a1a1a]">Morjim Site Alignment</div>
        </div>
      </div>

      {/* Map Custom Zoom Utilities Controls */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-1.5 z-10 shadow-md">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-9 h-9 bg-white hover:bg-[#008e62] hover:text-white border border-[#d8d0c8] text-[#1a1a1a] font-serif text-lg leading-none font-bold rounded shadow transition-all cursor-pointer flex items-center justify-center focus:outline-none"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-9 h-9 bg-white hover:bg-[#008e62] hover:text-white border border-[#d8d0c8] text-[#1a1a1a] font-serif text-lg leading-none font-bold rounded shadow transition-all cursor-pointer flex items-center justify-center focus:outline-none"
          title="Zoom Out"
        >
          −
        </button>
      </div>
    </div>
  );
}
