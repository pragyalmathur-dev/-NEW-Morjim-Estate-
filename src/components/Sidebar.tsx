import React from 'react';
import { MapPin, Layers, Sliders } from 'lucide-react';
import { ProjectPhase, MapTileStyle, OverlayConfig } from '../types';

interface SidebarProps {
  phases: ProjectPhase[];
  activeOverlayTab: 'a' | 'b';
  setActiveOverlayTab: (id: 'a' | 'b') => void;
  overlayConfigs: { a: OverlayConfig; b: OverlayConfig };
  updateOverlayOpacity: (id: 'a' | 'b', value: number) => void;
  updateOverlayVisibility: (id: 'a' | 'b', value: boolean) => void;
  mapStyle: MapTileStyle;
  setMapStyle: (style: MapTileStyle) => void;
  onEnquireClick: () => void;
  onFlyToProject: (coords: { lat: number; lng: number }) => void;
}

export default function Sidebar({
  phases,
  activeOverlayTab,
  setActiveOverlayTab,
  overlayConfigs,
  updateOverlayOpacity,
  updateOverlayVisibility,
  mapStyle,
  setMapStyle,
  onEnquireClick,
  onFlyToProject,
}: SidebarProps) {
  return (
    <aside
      id="sidebar"
      className="w-80 min-w-80 h-full bg-[#fcfbfa] border-r border-[#d8d0c8] flex flex-col overflow-hidden select-none"
    >
      {/* Sidebar Header */}
      <div className="bg-[#008e62] p-6 text-white shrink-0 shadow-sm">
        <div className="text-[10px] tracking-[4px] uppercase opacity-75 font-semibold font-sans mb-1">
          Vianaar Homes
        </div>
        <h1 className="font-serif text-2xl font-semibold leading-tight">
          Morjim Estate
        </h1>
        <div className="text-xs opacity-70 font-sans tracking-[0.5px] mt-1">
          Interactive Location Map
        </div>
      </div>

      {/* Sidebar Scrollable Body */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#e8e2dc] scrollbar-thin scrollbar-thumb-gray-200">
        
        {/* Phase Cards */}
        <div className="py-2">
          <div className="px-5 pt-3 pb-1 text-[9px] tracking-[2.5px] uppercase font-bold text-[#8a8a8a] select-none">
            Project Phases
          </div>
          {phases.map((phase) => {
            const config = overlayConfigs[phase.id];
            
            return (
              <div 
                key={phase.id} 
                className={`transition-colors duration-200 hover:bg-[#f6f3ee]`}
              >
                {/* Header Selector */}
                <div 
                  className="flex items-center justify-between px-5 py-4 cursor-pointer gap-3"
                  onClick={() => {
                    setActiveOverlayTab(phase.id);
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className={`w-3 h-3 rounded-full shrink-0 border-2 transition-transform duration-200 ${
                        activeOverlayTab === phase.id ? 'scale-125 ring-2 ring-emerald-100' : ''
                      }`}
                      style={{ 
                        backgroundColor: phase.color, 
                        borderColor: phase.borderColor 
                      }}
                    />
                    <div className="min-w-0">
                      <div className="font-serif text-base font-semibold text-[#1a1a1a] truncate">
                        {phase.projectName}
                      </div>
                      <div className="text-[11px] text-[#8a8a8a] font-sans">
                        {phase.phaseName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Map Locate Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onFlyToProject(phase.coords);
                        setActiveOverlayTab(phase.id);
                      }}
                      className="p-1 px-1.5 rounded hover:bg-[#e6f5f0] border border-transparent hover:border-[#b2dfd0] text-[#008e62] transition-all cursor-pointer"
                      title="Zoom to location"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>

                    {/* Visibility Toggle Switch */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateOverlayVisibility(phase.id, !config.visible);
                      }}
                      className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 focus:outline-none ${
                        config.visible ? 'bg-[#008e62]' : 'bg-[#d8d0c8]'
                      }`}
                      title={config.visible ? 'Hide site plan' : 'Show site plan'}
                    >
                      <span 
                        className={`absolute w-3.5 h-3.5 bg-white rounded-full top-[3px] left-[3px] transition-transform duration-200 shadow-sm ${
                          config.visible ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Site Coordinates Block */}
        <div className="p-5">
          <div className="text-[9px] tracking-[2.5px] uppercase font-bold text-[#8a8a8a] mb-2.5 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-[#008e62]" /> Site Coordinates
          </div>
          <div className="font-serif text-base text-[#4a4a4a] leading-relaxed">
            15°38′27.8″N <br />
            73°44′35.6″E
          </div>
          <div className="text-xs text-[#8a8a8a] mt-1.5 font-sans">
            Morjim, North Goa, India
          </div>
        </div>

        {/* Map Layers style */}
        <div className="p-5">
          <div className="text-[9px] tracking-[2.5px] uppercase font-bold text-[#8a8a8a] mb-3.5 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-[#008e62]" /> Map Base Layer
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(['satellite', 'street', 'topo'] as MapTileStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`py-2 px-1 text-[11px] capitalize rounded font-sans transition-all cursor-pointer text-center border ${
                  mapStyle === style
                    ? 'bg-[#008e62] text-white border-[#008e62] font-medium shadow-sm'
                    : 'bg-white text-[#4a4a4a] border-[#d8d0c8] hover:border-[#008e62] hover:text-[#008e62]'
                }`}
              >
                {style === 'topo' ? 'Terrain' : style}
              </button>
            ))}
          </div>
        </div>

        {/* Live Opacity adjustment */}
        <div className="p-5">
          <div className="text-[9px] tracking-[2.5px] uppercase font-bold text-[#8a8a8a] mb-4.5 flex items-center gap-1.5">
            <Sliders className="w-3 h-3 text-[#008e62]" /> Plan Transparency
          </div>
          <div className="space-y-4">
            {phases.map((phase) => {
              const cfg = overlayConfigs[phase.id];
              return (
                <div key={phase.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-serif text-sm font-medium text-[#1a1a1a] flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: phase.color }}
                      />
                      {phase.projectName}
                    </span>
                    <span className="font-mono text-[11px] text-[#4a4a4a] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      {cfg.o}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cfg.o}
                      onChange={(e) => updateOverlayOpacity(phase.id, parseInt(e.target.value))}
                      className="flex-1 accent-[#008e62] h-1.5 bg-[#ebdcd0] rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </aside>
  );
}
