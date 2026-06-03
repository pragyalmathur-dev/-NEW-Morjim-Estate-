import React, { useState, useRef, useEffect } from 'react';
import { Settings, Copy, Eye, Move, FolderSync, RefreshCw, ZoomIn, ArrowBigUp, ArrowBigDown, ArrowBigLeft, ArrowBigRight, Maximize, RotateCw } from 'lucide-react';
import { OverlayConfig, OverlayMode, MapTileStyle } from '../types';
import L from 'leaflet';

interface DevPanelProps {
  activeOverlayTab: 'a' | 'b';
  setActiveOverlayTab: (id: 'a' | 'b') => void;
  overlayConfigs: { a: OverlayConfig; b: OverlayConfig };
  setOverlayConfigs: React.Dispatch<React.SetStateAction<{ a: OverlayConfig; b: OverlayConfig }>>;
  overlayMode: OverlayMode;
  setOverlayMode: (mode: OverlayMode) => void;
  mapZoomState: number;
  mapRef: React.MutableRefObject<L.Map | null>;
}

export default function DevPanel({
  activeOverlayTab,
  setActiveOverlayTab,
  overlayConfigs,
  setOverlayConfigs,
  overlayMode,
  setOverlayMode,
  mapZoomState,
  mapRef,
}: DevPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [copiedConfigJson, setCopiedConfigJson] = useState('');
  const [showConfigPreview, setShowConfigPreview] = useState(false);

  // Dragging states of the panel itself
  const [panelPos, setPanelPos] = useState({ x: 0, y: 0, isDragged: false });
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const dragStartDiffRef = useRef({ x: 0, y: 0 });

  const activeCfg = overlayConfigs[activeOverlayTab];

  // Load a local file instantly as a base64 DataURL
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setOverlayConfigs(prev => ({
        ...prev,
        [activeOverlayTab]: {
          ...prev[activeOverlayTab],
          localImageSrc: dataUrl
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  // Generic direct numeric set
  const updateActiveOverlayValue = (key: keyof OverlayConfig, val: number) => {
    setOverlayConfigs(prev => ({
      ...prev,
      [activeOverlayTab]: {
        ...prev[activeOverlayTab],
        [key]: val
      }
    }));
  };

  // Centimetre-level Micro-Nudges!
  // Increments for GIS or pixel adjustment modes
  const nudge = (type: 'up' | 'down' | 'left' | 'right' | 'wPlus' | 'wMinus' | 'hPlus' | 'hMinus' | 'rCw' | 'rCcw') => {
    setOverlayConfigs(prev => {
      const current = prev[activeOverlayTab];
      
      if (overlayMode === 'geo') {
        const dLat = 0.000002; // Roughly 0.22 meters in Morjim
        const dLng = 0.000002;
        const dDeg = 0.000001; // Scale factor adjustment
        
        switch (type) {
          case 'up': return { ...prev, [activeOverlayTab]: { ...current, lat: current.lat + dLat } };
          case 'down': return { ...prev, [activeOverlayTab]: { ...current, lat: current.lat - dLat } };
          case 'left': return { ...prev, [activeOverlayTab]: { ...current, lng: current.lng - dLng } };
          case 'right': return { ...prev, [activeOverlayTab]: { ...current, lng: current.lng + dLng } };
          case 'wPlus': return { ...prev, [activeOverlayTab]: { ...current, widthDeg: current.widthDeg + dDeg } };
          case 'wMinus': return { ...prev, [activeOverlayTab]: { ...current, widthDeg: Math.max(0.00001, current.widthDeg - dDeg) } };
          case 'hPlus': return { ...prev, [activeOverlayTab]: { ...current, heightDeg: current.heightDeg + dDeg } };
          case 'hMinus': return { ...prev, [activeOverlayTab]: { ...current, heightDeg: Math.max(0.00001, current.heightDeg - dDeg) } };
          case 'rCw': return { ...prev, [activeOverlayTab]: { ...current, r: current.r + 0.2 } };
          case 'rCcw': return { ...prev, [activeOverlayTab]: { ...current, r: current.r - 0.2 } };
        }
      } else {
        const dPix = 1;      // One pixel nudge
        const dSz = 2;       // Size stretch units
        
        switch (type) {
          case 'up': return { ...prev, [activeOverlayTab]: { ...current, y: current.y - dPix } };
          case 'down': return { ...prev, [activeOverlayTab]: { ...current, y: current.y + dPix } };
          case 'left': return { ...prev, [activeOverlayTab]: { ...current, x: current.x - dPix } };
          case 'right': return { ...prev, [activeOverlayTab]: { ...current, x: current.x + dPix } };
          case 'wPlus': return { ...prev, [activeOverlayTab]: { ...current, w: current.w + dSz } };
          case 'wMinus': return { ...prev, [activeOverlayTab]: { ...current, w: Math.max(10, current.w - dSz) } };
          case 'hPlus': return { ...prev, [activeOverlayTab]: { ...current, h: current.h + dSz } };
          case 'hMinus': return { ...prev, [activeOverlayTab]: { ...current, h: Math.max(10, current.h - dSz) } };
          case 'rCw': return { ...prev, [activeOverlayTab]: { ...current, r: current.r + 0.5 } };
          case 'rCcw': return { ...prev, [activeOverlayTab]: { ...current, r: current.r - 0.5 } };
        }
      }
      return prev;
    });
  };

  // Extract total configuration JSON
  const extractFullConfiguration = () => {
    const map = mapRef.current;
    if (!map) return;
    const center = map.getCenter();
    
    const config = {
      note: "Copy this JSON into your final configuration when you have aligned both phases.",
      mode: overlayMode,
      mapZoom: map.getZoom(),
      mapCenter: { lat: center.lat, lng: center.lng },
      overlays: {
        a: {
          visible: overlayConfigs.a.visible,
          opacity: overlayConfigs.a.o,
          geo: {
            lat: overlayConfigs.a.lat,
            lng: overlayConfigs.a.lng,
            widthDeg: overlayConfigs.a.widthDeg,
            heightDeg: overlayConfigs.a.heightDeg,
            rotate: overlayConfigs.a.r,
          },
          screen: {
            x: overlayConfigs.a.x,
            y: overlayConfigs.a.y,
            width: overlayConfigs.a.w,
            height: overlayConfigs.a.h,
            rotate: overlayConfigs.a.r,
          }
        },
        b: {
          visible: overlayConfigs.b.visible,
          opacity: overlayConfigs.b.o,
          geo: {
            lat: overlayConfigs.b.lat,
            lng: overlayConfigs.b.lng,
            widthDeg: overlayConfigs.b.widthDeg,
            heightDeg: overlayConfigs.b.heightDeg,
            rotate: overlayConfigs.b.r,
          },
          screen: {
            x: overlayConfigs.b.x,
            y: overlayConfigs.b.y,
            width: overlayConfigs.b.w,
            height: overlayConfigs.b.h,
            rotate: overlayConfigs.b.r,
          }
        }
      }
    };

    const strJson = JSON.stringify(config, null, 2);
    setCopiedConfigJson(strJson);
    setShowConfigPreview(true);

    navigator.clipboard.writeText(strJson).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  // Dragging behaviors implementation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!panelPos.isDragged) return;
      setPanelPos(prev => ({
        ...prev,
        x: e.clientX - dragStartDiffRef.current.x,
        y: e.clientY - dragStartDiffRef.current.y,
      }));
    };

    const handleMouseUp = () => {
      if (panelPos.isDragged) {
        setPanelPos(prev => ({ ...prev, isDragged: false }));
      }
    };

    if (panelPos.isDragged) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [panelPos.isDragged]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (panelRef.current) {
      dragStartDiffRef.current = {
        x: e.clientX - panelRef.current.getBoundingClientRect().left,
        y: e.clientY - panelRef.current.getBoundingClientRect().top
      };
      setPanelPos(prev => ({ ...prev, isDragged: true }));
    }
  };

  // Reset overlay to default boundaries
  const resetActiveOverlay = () => {
    if (confirm(`Do you want to reset Phase ${activeOverlayTab === 'a' ? '1' : '2'} settings?`)) {
      setOverlayConfigs(prev => ({
        ...prev,
        [activeOverlayTab]: {
          ...prev[activeOverlayTab],
          x: activeOverlayTab === 'a' ? 150 : 500,
          y: 40,
          w: 420,
          h: 420,
          r: 0,
          o: 85,
          lat: activeOverlayTab === 'a' ? 15.640944 : 15.642944,
          lng: activeOverlayTab === 'a' ? 73.743222 : 73.746222,
          widthDeg: 0.0035,
          heightDeg: 0.0035,
        }
      }));
    }
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'absolute',
        top: panelPos.y ? `${panelPos.y}px` : '20px',
        right: panelPos.x ? 'auto' : '20px',
        left: panelPos.x ? `${panelPos.x}px` : 'auto',
        zIndex: 1000,
      }}
      className="w-[300px] bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl text-stone-200 overflow-hidden font-sans select-none"
    >
      {/* Panel Header (Draggable handle) */}
      <div
        ref={headerRef}
        onMouseDown={handleMouseDown}
        className="px-4 py-2 bg-neutral-800 border-b border-neutral-700 flex justify-between items-center cursor-move select-none"
      >
        <span className="text-[10px] tracking-widest uppercase font-bold text-[#00e09e] flex items-center gap-1.5 leading-none">
          <Settings className="w-3.5 h-3.5 spin-slow" /> Overlay Developer Tool
        </span>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-stone-400 hover:text-white p-0.5 text-xs font-serif font-bold transition-all focus:outline-none cursor-pointer"
        >
          {isCollapsed ? '▲' : '▼'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 space-y-3.5 max-h-[82vh] overflow-y-auto divide-y divide-neutral-800/60 pb-5">
          
          {/* Alignment Mode Picker */}
          <div className="space-y-1.5 pt-0">
            <span className="text-[9px] font-bold tracking-widest text-[#8a8a8a] uppercase block">Alignment Type</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setOverlayMode('geo')}
                className={`py-1.5 text-[10px] rounded border font-semibold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  overlayMode === 'geo'
                    ? 'bg-[#008e62] border-[#008e62] text-white shadow'
                    : 'bg-neutral-850 border-neutral-750 text-stone-400 hover:text-stone-200 hover:bg-neutral-800'
                }`}
              >
                <FolderSync className="w-3.5 h-3.5" /> Geo-locked
              </button>
              <button
                onClick={() => setOverlayMode('screen')}
                className={`py-1.5 text-[10px] rounded border font-semibold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  overlayMode === 'screen'
                    ? 'bg-[#008e62] border-[#008e62] text-white shadow'
                    : 'bg-neutral-850 border-neutral-750 text-stone-400 hover:text-stone-200 hover:bg-neutral-800'
                }`}
              >
                <Move className="w-3.5 h-3.5" /> Screen Only
              </button>
            </div>
            <p className="text-[9px] text-stone-400/80 leading-normal italic mt-1">
              {overlayMode === 'geo' 
                ? "Locked: Pans and zooms with the geography of North Goa."
                : "Fixed: Stays in the absolute viewport screen zone."
              }
            </p>
          </div>

          {/* Plan Tab Selection */}
          <div className="space-y-1.5 pt-3">
            <span className="text-[9px] font-bold tracking-widest text-[#8a8a8a] uppercase block">Selected Phase</span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setActiveOverlayTab('a')}
                className={`py-1.5 px-1 text-[11px] rounded transition-all cursor-pointer font-medium border ${
                  activeOverlayTab === 'a'
                    ? 'bg-neutral-800 text-emerald-400 border-emerald-400/45 shadow-inner'
                    : 'bg-neutral-850 text-stone-400 border-neutral-750 hover:bg-neutral-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#00e09e] mr-1.5 inline-block" />
                Morjim Plan 1
              </button>
              <button
                onClick={() => setActiveOverlayTab('b')}
                className={`py-1.5 px-1 text-[11px] rounded transition-all cursor-pointer font-medium border ${
                  activeOverlayTab === 'b'
                    ? 'bg-neutral-800 text-amber-500 border-amber-500/45 shadow-inner'
                    : 'bg-neutral-850 text-stone-400 border-neutral-750 hover:bg-neutral-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#c8860a] mr-1.5 inline-block" />
                Morjim Plan 2
              </button>
            </div>
          </div>

          {/* Local Disk Upload Picker */}
          <div className="space-y-1.5 pt-3">
            <span className="text-[9px] font-bold tracking-widest text-[#8a8a8a] uppercase block">Instant Local Asset Loader</span>
            <label className="flex flex-col items-center justify-center p-2 rounded-md border border-dashed border-neutral-800 bg-[#161616] hover:bg-[#1a1a1a]/80 hover:border-emerald-500/50 cursor-pointer text-center group transition-all duration-200">
              <FolderSync className="w-4 h-4 text-stone-500 group-hover:text-[#00e09e] mb-1 group-hover:animate-bounce" />
              <div className="text-[10px] text-stone-400 font-semibold group-hover:text-white">
                Choose site-plan_ME{activeOverlayTab === 'a' ? '1' : '2'}.png
              </div>
              <div className="text-[8px] text-stone-500 mt-0.5">
                Load local plan draft into memory
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLocalImageUpload}
                className="hidden"
              />
            </label>
            {activeCfg.localImageSrc && (
              <div className="text-[9px] text-emerald-500 flex items-center justify-between bg-emerald-900/10 px-2 py-1 rounded">
                <span>✓ Local File Active in Memory</span>
                <button 
                  onClick={() => updateActiveOverlayValue('localImageSrc', 0 as any)} // deletes local file
                  className="text-stone-400 hover:text-red-400 font-bold"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Centimetre high precision nudge dials (NUDGE MACHINE) */}
          <div className="space-y-1.5 pt-3">
            <span className="text-[9px] font-bold tracking-widest text-[#8a8a8a] uppercase block">Centimetre Micro-Nudge Console</span>
            <div className="p-2.5 bg-neutral-950/80 rounded border border-neutral-850 flex flex-col items-center">
              {/* Position Nudge Pad */}
              <div className="text-[9px] text-[#8a8a8a] tracking-wider uppercase mb-1.5 font-bold">NUDGE POSITION</div>
              <div className="grid grid-cols-3 gap-1.5 w-full max-w-[140px] mb-3">
                <div />
                <button onClick={() => nudge('up')} className="py-1 px-2.5 bg-neutral-800 hover:bg-[#008e62] hover:text-white rounded text-center cursor-pointer flex justify-center text-xs" title="Nudge Up/North"><ArrowBigUp className="w-4 h-4" /></button>
                <div />
                <button onClick={() => nudge('left')} className="py-1 px-2.5 bg-neutral-800 hover:bg-[#008e62] hover:text-white rounded text-center cursor-pointer flex justify-center text-xs" title="Nudge Left/West"><ArrowBigLeft className="w-4 h-4" /></button>
                <div />
                <button onClick={() => nudge('right')} className="py-1 px-2.5 bg-neutral-800 hover:bg-[#008e62] hover:text-white rounded text-center cursor-pointer flex justify-center text-xs" title="Nudge Right/East"><ArrowBigRight className="w-4 h-4" /></button>
                <div />
                <button onClick={() => nudge('down')} className="py-1 px-2.5 bg-neutral-800 hover:bg-[#008e62] hover:text-white rounded text-center cursor-pointer flex justify-center text-xs" title="Nudge Down/South"><ArrowBigDown className="w-4 h-4" /></button>
                <div />
              </div>

              {/* Stretch scale and Rotate pad */}
              <div className="grid grid-cols-2 gap-2 w-full mt-1.5 pt-2 border-t border-neutral-900 text-[10px]">
                <div className="space-y-1 text-center">
                  <div className="text-[8px] font-bold text-[#8a8a8a] uppercase">Fine Width</div>
                  <div className="flex gap-1 justify-center">
                    <button onClick={() => nudge('wMinus')} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-stone-200 outline-none">-</button>
                    <button onClick={() => nudge('wPlus')} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-stone-200 outline-none">+</button>
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <div className="text-[8px] font-bold text-[#8a8a8a] uppercase">Fine Height</div>
                  <div className="flex gap-1 justify-center">
                    <button onClick={() => nudge('hMinus')} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-stone-200 outline-none">-</button>
                    <button onClick={() => nudge('hPlus')} className="px-1.5 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-stone-200 outline-none">+</button>
                  </div>
                </div>
                <div className="col-span-2 space-y-1 text-center pt-1.5">
                  <div className="text-[8px] font-bold text-[#8a8a8a] uppercase flex justify-center items-center gap-1"><RotateCw className="w-3 h-3 text-[#00e09e]" /> Fine Rotation</div>
                  <div className="flex gap-1.5 justify-center">
                    <button onClick={() => nudge('rCcw')} className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-[9px]">↺ 0.5°</button>
                    <button onClick={() => nudge('rCw')} className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-[9px]">0.5° ↻</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Standard Sliders controls */}
          <div className="space-y-3 pt-3">
            <span className="text-[9px] font-bold tracking-widest text-[#8a8a8a] uppercase block">Dials and Sliders (Broad Fit)</span>
            
            {overlayMode === 'geo' ? (
              <>
                {/* Center Lat */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Center Latitude</span>
                    <span className="font-mono text-emerald-400">{activeCfg.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="15.635"
                      max="15.647"
                      step="0.000002"
                      value={activeCfg.lat}
                      onChange={(e) => updateActiveOverlayValue('lat', parseFloat(e.target.value))}
                      className="flex-1 accent-[#00e09e] h-1.5 bg-neutral-800"
                    />
                  </div>
                </div>
                {/* Center Lng */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Center Longitude</span>
                    <span className="font-mono text-emerald-400">{activeCfg.lng.toFixed(6)}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="73.738"
                      max="73.749"
                      step="0.000002"
                      value={activeCfg.lng}
                      onChange={(e) => updateActiveOverlayValue('lng', parseFloat(e.target.value))}
                      className="flex-1 accent-[#00e09e] h-1.5 bg-neutral-800"
                    />
                  </div>
                </div>
                {/* Width degree */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Width (Degrees spread)</span>
                    <span className="font-mono text-emerald-400">{activeCfg.widthDeg.toFixed(6)}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0.0005"
                      max="0.007"
                      step="0.000002"
                      value={activeCfg.widthDeg}
                      onChange={(e) => updateActiveOverlayValue('widthDeg', parseFloat(e.target.value))}
                      className="flex-1 accent-[#00e09e] h-1.5 bg-neutral-800"
                    />
                  </div>
                </div>
                {/* Height degree */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Height (Degrees spread)</span>
                    <span className="font-mono text-emerald-400">{activeCfg.heightDeg.toFixed(6)}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0.0005"
                      max="0.007"
                      step="0.000002"
                      value={activeCfg.heightDeg}
                      onChange={(e) => updateActiveOverlayValue('heightDeg', parseFloat(e.target.value))}
                      className="flex-1 accent-[#00e09e] h-1.5 bg-neutral-800"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* X Coordinate slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Left (X px)</span>
                    <span className="font-mono text-[#00e09e]">{activeCfg.x}px</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="-300"
                      max="1800"
                      value={activeCfg.x}
                      onChange={(e) => updateActiveOverlayValue('x', parseInt(e.target.value))}
                      className="flex-1 accent-[#00e09e] h-1 bg-neutral-800"
                    />
                    <input
                      type="number"
                      value={activeCfg.x}
                      onChange={(e) => updateActiveOverlayValue('x', parseInt(e.target.value) || 0)}
                      className="w-14 text-center bg-neutral-800 border border-neutral-700 text-xs py-0.5 rounded focus:outline-none"
                    />
                  </div>
                </div>
                {/* Y Coordinate slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Top (Y px)</span>
                    <span className="font-mono text-[#00e09e]">{activeCfg.y}px</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="-300"
                      max="1500"
                      value={activeCfg.y}
                      onChange={(e) => updateActiveOverlayValue('y', parseInt(e.target.value))}
                      className="flex-1 accent-[#00e09e] h-1 bg-neutral-800"
                    />
                    <input
                      type="number"
                      value={activeCfg.y}
                      onChange={(e) => updateActiveOverlayValue('y', parseInt(e.target.value) || 0)}
                      className="w-14 text-center bg-neutral-800 border border-neutral-700 text-xs py-0.5 rounded focus:outline-none"
                    />
                  </div>
                </div>
                {/* Width */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Width (pixels)</span>
                    <span className="font-mono text-[#00e09e]">{activeCfg.w}px</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      value={activeCfg.w}
                      onChange={(e) => updateActiveOverlayValue('w', parseInt(e.target.value))}
                      className="flex-1 accent-[#00e09e] h-1 bg-neutral-800"
                    />
                    <input
                      type="number"
                      value={activeCfg.w}
                      onChange={(e) => updateActiveOverlayValue('w', parseInt(e.target.value) || 100)}
                      className="w-14 text-center bg-neutral-800 border border-neutral-700 text-xs py-0.5 rounded focus:outline-none"
                    />
                  </div>
                </div>
                {/* Height */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-stone-400">Height (pixels)</span>
                    <span className="font-mono text-[#00e09e]">{activeCfg.h}px</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <input
                      type="range"
                      min="50"
                      max="1500"
                      value={activeCfg.h}
                      onChange={(e) => updateActiveOverlayValue('h', parseInt(e.target.value))}
                      className="flex-1 accent-[#00e09e] h-1 bg-neutral-800"
                    />
                    <input
                      type="number"
                      value={activeCfg.h}
                      onChange={(e) => updateActiveOverlayValue('h', parseInt(e.target.value) || 100)}
                      className="w-14 text-center bg-neutral-800 border border-neutral-700 text-xs py-0.5 rounded focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Rotation slider (used by both modes) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-400">Rotation</span>
                <span className="font-mono text-[#00e09e]">{activeCfg.r.toFixed(1)}°</span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="0.1"
                  value={activeCfg.r}
                  onChange={(e) => updateActiveOverlayValue('r', parseFloat(e.target.value))}
                  className="flex-1 accent-[#00e09e] h-1 bg-neutral-800"
                />
                <input
                  type="number"
                  value={activeCfg.r.toFixed(1)}
                  step="0.1"
                  onChange={(e) => updateActiveOverlayValue('r', parseFloat(e.target.value) || 0)}
                  className="w-14 text-center bg-neutral-800 border border-neutral-700 text-xs py-0.5 rounded focus:outline-none"
                />
              </div>
            </div>

            {/* Opacity slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-stone-400">Opacity</span>
                <span className="font-mono text-[#00e09e]">{activeCfg.o}%</span>
              </div>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeCfg.o}
                  onChange={(e) => updateActiveOverlayValue('o', parseInt(e.target.value))}
                  className="flex-1 accent-[#00e09e] h-1 bg-neutral-800"
                />
                <input
                  type="number"
                  value={activeCfg.o}
                  onChange={(e) => updateActiveOverlayValue('o', parseInt(e.target.value) || 0)}
                  className="w-14 text-center bg-neutral-800 border border-neutral-700 text-xs py-0.5 rounded focus:outline-none"
                />
              </div>
            </div>
            
            {/* Map zoom diagnostic */}
            <div className="flex justify-between text-[10px] text-stone-500 font-mono mt-1 pt-1.5 border-t border-neutral-850">
              <span>Map Zoom State:</span>
              <span>Lvl {mapZoomState}</span>
            </div>
          </div>

          {/* Controller Operations */}
          <div className="space-y-2 pt-3">
            <button
              onClick={extractFullConfiguration}
              className="w-full py-2 bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-500 hover:text-white text-emerald-400 text-xs select-none tracking-widest font-semibold uppercase rounded transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Copy className="w-4.5 h-4.5" />
              {copyFeedback ? 'Copied to clipboard ✓' : 'Copy Config JSON'}
            </button>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={resetActiveOverlay}
                className="py-1.5 bg-neutral-800 hover:bg-neutral-700 text-stone-300 text-[10px] select-none tracking-wider font-semibold uppercase rounded text-center cursor-pointer"
              >
                Reset Phase
              </button>
              <button
                onClick={() => setShowConfigPreview(!showConfigPreview)}
                className="py-1.5 bg-neutral-800 hover:bg-neutral-700 text-stone-350 text-[10px] select-none tracking-wider font-semibold uppercase rounded text-center cursor-pointer"
              >
                {showConfigPreview ? 'Hide JSON' : 'Preview JSON'}
              </button>
            </div>

            {showConfigPreview && copiedConfigJson && (
              <pre className="text-[9px] bg-neutral-950 p-2.5 rounded border border-neutral-850 overflow-auto text-stone-400 max-h-[160px] whitespace-pre select-all leading-normal">
                {copiedConfigJson}
              </pre>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
