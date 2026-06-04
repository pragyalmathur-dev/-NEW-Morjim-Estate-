import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Sparkles, Upload, RotateCw } from 'lucide-react';
import { OverlayConfig, MapTileStyle, OverlayMode } from '../types';
import { getGeneratedSitePlanSVG } from '../utils/sitePlans';

interface MapContainerProps {
  activeOverlayTab: 'a' | 'b' | 'combined';
  overlayConfigs: { a: OverlayConfig; b: OverlayConfig };
  setOverlayConfigs: React.Dispatch<React.SetStateAction<{ a: OverlayConfig; b: OverlayConfig }>>;
  mapStyle: MapTileStyle;
  overlayMode: OverlayMode;
  setMapZoomState: (zoom: number) => void;
  mapRef: React.MutableRefObject<L.Map | null>;
  alignModeEnabled?: boolean;
  alignSelectedId?: 'a' | 'b';
}

export default function MapContainer({
  activeOverlayTab,
  overlayConfigs,
  setOverlayConfigs,
  mapStyle,
  overlayMode,
  setMapZoomState,
  mapRef,
  alignModeEnabled = false,
  alignSelectedId = 'a',
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Track image load/error state to handle fallbacks and placeholders cleanly in React without DOM conflicts
  const [imageStates, setImageStates] = useState<{
    a: 'loading' | 'loaded' | 'failed';
    b: 'loading' | 'loaded' | 'failed';
  }>({
    a: 'loading',
    b: 'loading',
  });

  // Track pixel calculations for visual rendering
  const [pixelPositions, setPixelPositions] = useState<{
    a: { left: number; top: number; width: number; height: number; rotate: number; opacity: number };
    b: { left: number; top: number; width: number; height: number; rotate: number; opacity: number };
  }>({
    a: { left: 150, top: 120, width: 300, height: 300, rotate: 0, opacity: 0.85 },
    b: { left: 500, top: 120, width: 300, height: 300, rotate: 0, opacity: 0.85 },
  });

  const [activeTransform, setActiveTransform] = useState<{
    id: 'a' | 'b';
    type: 'move' | 'resize-nw' | 'resize-ne' | 'resize-se' | 'resize-sw' | 'rotate';
    clientX: number;
    clientY: number;
    startLeft: number;
    startTop: number;
    startWidth: number;
    startHeight: number;
    startRotate: number;
    startLat: number;
    startLng: number;
    startWidthDeg: number;
    startHeightDeg: number;
    startCenterX: number;
    startCenterY: number;
  } | null>(null);

  // Set up mouseup/mousemove listeners for dragging, scaling or rotating
  useEffect(() => {
    if (!activeTransform) return;

    const handleMouseMove = (e: MouseEvent) => {
      const map = mapRef.current;
      if (!map) return;

      const {
        id,
        type,
        clientX,
        clientY,
        startLeft,
        startTop,
        startWidth,
        startHeight,
        startRotate,
        startLat,
        startLng,
        startWidthDeg,
        startHeightDeg,
        startCenterX,
        startCenterY,
      } = activeTransform;

      const dx = e.clientX - clientX;
      const dy = e.clientY - clientY;

      if (type === 'move') {
        if (overlayMode === 'geo') {
          try {
            const startCenterPt = map.latLngToContainerPoint([startLat, startLng]);
            const newCenterPt = L.point(startCenterPt.x + dx, startCenterPt.y + dy);
            const newLatLng = map.containerPointToLatLng(newCenterPt);
            
            setOverlayConfigs(prev => ({
              ...prev,
              [id]: {
                ...prev[id],
                lat: newLatLng.lat,
                lng: newLatLng.lng,
              }
            }));
          } catch (err) {
            // Ignore temporary projection errors during rapid pans
          }
        } else {
          setOverlayConfigs(prev => ({
            ...prev,
            [id]: {
              ...prev[id],
              x: Math.round(startLeft + dx),
              y: Math.round(startTop + dy),
            }
          }));
        }
      } else if (type.startsWith('resize')) {
        let ratioX = 1;
        let ratioY = 1;

        if (type === 'resize-se') {
          ratioX = (startWidth + dx) / startWidth;
          ratioY = (startHeight + dy) / startHeight;
        } else if (type === 'resize-sw') {
          ratioX = (startWidth - dx) / startWidth;
          ratioY = (startHeight + dy) / startHeight;
        } else if (type === 'resize-ne') {
          ratioX = (startWidth + dx) / startWidth;
          ratioY = (startHeight - dy) / startHeight;
        } else if (type === 'resize-nw') {
          ratioX = (startWidth - dx) / startWidth;
          ratioY = (startHeight - dy) / startHeight;
        }

        // Average horizontal and vertical ratios to create a perfect uniform scale factor
        const scale = Math.max(0.01, (ratioX + ratioY) / 2);

        if (overlayMode === 'geo') {
          setOverlayConfigs(prev => ({
            ...prev,
            [id]: {
              ...prev[id],
              widthDeg: Math.max(0.00001, startWidthDeg * scale),
              heightDeg: Math.max(0.00001, startHeightDeg * scale),
            }
          }));
        } else {
          setOverlayConfigs(prev => ({
            ...prev,
            [id]: {
              ...prev[id],
              w: Math.max(20, Math.round(startWidth * scale)),
              h: Math.max(20, Math.round(startHeight * scale)),
            }
          }));
        }
      } else if (type === 'rotate') {
        const startAngle = Math.atan2(clientY - startCenterY, clientX - startCenterX);
        const currentAngle = Math.atan2(e.clientY - startCenterY, e.clientX - startCenterX);
        const diffR = ((currentAngle - startAngle) * 180) / Math.PI;

        let newR = startRotate + diffR;
        if (newR > 180) newR -= 360;
        if (newR < -180) newR += 360;

        setOverlayConfigs(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            r: parseFloat(newR.toFixed(1)),
          }
        }));
      }
    };

    const handleMouseUp = () => {
      setActiveTransform(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeTransform, overlayMode, setOverlayConfigs]);

  const startDragMove = (id: 'a' | 'b', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const config = overlayConfigs[id];
    const pixels = pixelPositions[id];
    setActiveTransform({
      id,
      type: 'move',
      clientX: e.clientX,
      clientY: e.clientY,
      startLeft: config.x,
      startTop: config.y,
      startWidth: pixels.width,
      startHeight: pixels.height,
      startRotate: config.r,
      startLat: config.lat,
      startLng: config.lng,
      startWidthDeg: config.widthDeg,
      startHeightDeg: config.heightDeg,
      startCenterX: 0,
      startCenterY: 0,
    });
  };

  const startDragResize = (id: 'a' | 'b', corner: 'nw' | 'ne' | 'se' | 'sw', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const config = overlayConfigs[id];
    const pixels = pixelPositions[id];
    setActiveTransform({
      id,
      type: `resize-${corner}` as any,
      clientX: e.clientX,
      clientY: e.clientY,
      startLeft: pixels.left,
      startTop: pixels.top,
      startWidth: pixels.width,
      startHeight: pixels.height,
      startRotate: config.r,
      startLat: config.lat,
      startLng: config.lng,
      startWidthDeg: config.widthDeg,
      startHeightDeg: config.heightDeg,
      startCenterX: 0,
      startCenterY: 0,
    });
  };

  const startDragRotate = (id: 'a' | 'b', e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const config = overlayConfigs[id];
    const pixels = pixelPositions[id];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const startCenterX = rect.left + pixels.left + pixels.width / 2;
    const startCenterY = rect.top + pixels.top + pixels.height / 2;

    setActiveTransform({
      id,
      type: 'rotate',
      clientX: e.clientX,
      clientY: e.clientY,
      startLeft: pixels.left,
      startTop: pixels.top,
      startWidth: pixels.width,
      startHeight: pixels.height,
      startRotate: config.r,
      startLat: config.lat,
      startLng: config.lng,
      startWidthDeg: config.widthDeg,
      startHeightDeg: config.heightDeg,
      startCenterX,
      startCenterY,
    });
  };

  // Reset imageStates when custom local images or visible configurations change
  useEffect(() => {
    setImageStates(prev => ({ ...prev, a: 'loading' }));
  }, [overlayConfigs.a.localImageSrc, overlayConfigs.a.visible]);

  useEffect(() => {
    setImageStates(prev => ({ ...prev, b: 'loading' }));
  }, [overlayConfigs.b.localImageSrc, overlayConfigs.b.visible]);

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
  const CENTER_LAT = 15.641513006109792;
  const CENTER_LNG = 73.7436729669571;

  // Set up Map instance (runs once on mount)
  useEffect(() => {
    if (!containerRef.current || mapInitialized) return;

    // Leaflet map container initialization
    const map = L.map(containerRef.current, {
      center: [CENTER_LAT, CENTER_LNG],
      zoom: 19,
      zoomControl: false,
      attributionControl: false,
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

    // Markers and popups have been removed per user preference for a cleaner landscape view


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
      {/* Map Utilities Overlays (Site Plans) */}
      {['a', 'b'].map((idKey) => {
        const id = idKey as 'a' | 'b';
        const config = overlayConfigs[id];
        const pixels = pixelPositions[id];
        
        if (!config.visible) return null;

        // Determine if local uploaded file or actual server image
        const hasCustom = !!config.localImageSrc;
        const serverSrc = id === 'a'
          ? '/assets/siteplan/site-plan_ME1.png'
          : '/assets/siteplan/site-plan_ME2.png';
        const isA = id === 'a';
        const isTransforming = activeTransform?.id === id;
        const isSelected = alignModeEnabled && (alignSelectedId === id);

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
              pointerEvents: isSelected ? 'auto' : 'none',
              transformOrigin: 'center center',
              zIndex: isSelected ? 100 : 10,
            }}
            className={`transition-all duration-75 shadow-lg select-none ${
              isSelected 
                ? 'border-2 border-[#00e09e] ring-4 ring-emerald-500/10 rounded' 
                : 'border border-transparent'
            }`}
          >
            {/* Image render or Upload notice helper */}
            <div 
              className="w-full h-full relative cursor-move" 
              style={{ pointerEvents: isSelected ? 'auto' : 'none' }}
              onMouseDown={(e) => {
                if (isSelected) {
                  startDragMove(id, e);
                }
              }}
            >
              <img
                src={config.localImageSrc || serverSrc}
                alt={`Site Plan ${isA ? 'ME1' : 'ME2'}`}
                className="w-full h-full object-fill pointer-events-none rounded"
                style={{ contentVisibility: 'auto' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  const fallback = getGeneratedSitePlanSVG(id);
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />

              {/* Dynamic Interactive Resize Controls Overlay */}
              {isSelected && (
                <>
                  {/* Bounding info tag */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-neutral-950/95 backdrop-blur-sm px-2.5 py-1 rounded text-stone-200 text-[10px] font-sans shadow-md border border-neutral-800 pointer-events-none z-50 flex items-center gap-1.5 whitespace-nowrap">
                    <span className={`w-1.5 h-1.5 rounded-full ${isTransforming ? 'bg-[red]' : 'bg-[#00e09e]'} animate-pulse`} />
                    <span>Adjusting ME{isA ? '1' : '2'} via {overlayMode === 'geo' ? 'GIS (Geo-locked)' : 'Viewport (Screen)'}</span>
                  </div>

                  {/* Connecting line to Rotate Handle */}
                  <div className="absolute -top-[16px] left-1/2 -translate-x-1/2 w-[1.5px] h-[16px] bg-[#00e09e]/80" />

                  {/* Rotate handle */}
                  <button
                    onMouseDown={(e) => startDragRotate(id, e)}
                    className="absolute -top-[30px] left-1/2 -translate-x-1/2 w-7 h-7 bg-neutral-900 hover:bg-[#008e62] border border-[#00e09e] text-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 shadow-lg pointer-events-auto transition-all z-50"
                    title="Drag to Rotate Site Plan"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#00e09e] hover:text-white" />
                  </button>

                  {/* Corner Resize handles */}
                  {/* NW */}
                  <div
                    onMouseDown={(e) => startDragResize(id, 'nw', e)}
                    className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-[#00e09e] hover:bg-[#00e09e] rounded-full shadow-md cursor-nwse-resize pointer-events-auto z-50 transition-all hover:scale-125"
                    title="Resize North West"
                  />
                  {/* NE */}
                  <div
                    onMouseDown={(e) => startDragResize(id, 'ne', e)}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-[#00e09e] hover:bg-[#00e09e] rounded-full shadow-md cursor-nesw-resize pointer-events-auto z-50 transition-all hover:scale-125"
                    title="Resize North East"
                  />
                  {/* SE */}
                  <div
                    onMouseDown={(e) => startDragResize(id, 'se', e)}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-[#00e09e] hover:bg-[#00e09e] rounded-full shadow-md cursor-nwse-resize pointer-events-auto z-50 transition-all hover:scale-125"
                    title="Resize South East"
                  />
                  {/* SW */}
                  <div
                    onMouseDown={(e) => startDragResize(id, 'sw', e)}
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-[#00e09e] hover:bg-[#00e09e] rounded-full shadow-md cursor-nesw-resize pointer-events-auto z-50 transition-all hover:scale-125"
                    title="Resize South West"
                  />
                </>
              )}
            </div>
          </div>
        );
      })}



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
