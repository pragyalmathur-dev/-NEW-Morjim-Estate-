import React from 'react';
import { MapPin, Layers, Sliders } from 'lucide-react';
import { ProjectPhase, MapTileStyle, OverlayConfig } from '../types';
import { ESTATE_1_VILLAS, ESTATE_2_VILLAS } from '../data/villas';

interface SidebarProps {
  phases: ProjectPhase[];
  activeOverlayTab: 'a' | 'b' | 'combined';
  setActiveOverlayTab: (id: 'a' | 'b' | 'combined') => void;
  overlayConfigs: { a: OverlayConfig; b: OverlayConfig };
  updateOverlayOpacity: (id: 'a' | 'b', value: number) => void;
  updateOverlayVisibility: (id: 'a' | 'b', value: boolean) => void;
  mapStyle: MapTileStyle;
  setMapStyle: (style: MapTileStyle) => void;
  onEnquireClick: (prefilledMessage?: string) => void;
  onFlyToProject: (coords: { lat: number; lng: number }) => void;
  selectedVilla: string | null;
  setSelectedVilla: (villaId: string | null) => void;
  onOpenRenders: (phaseId: 'a' | 'b') => void;
  onCloseSidebar?: () => void;
  onOpenFloorPlan?: (villaId: string, estateId: 'a' | 'b') => void;
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
  selectedVilla,
  setSelectedVilla,
  onOpenRenders,
  onCloseSidebar,
  onOpenFloorPlan,
}: SidebarProps) {
  return (
    <aside
      id="sidebar"
      className="w-80 min-w-80 h-full bg-[#FAF8F5] border-r border-[#ebdcd0]/70 flex flex-col overflow-hidden select-none font-sans font-light text-[#554e48]"
    >
      {/* Sidebar Header - Center aligned Vianaar luxury brand style */}
      <div className="bg-[#FAF8F5] px-6 py-9 border-b border-[#ebdcd0]/45 shrink-0 text-center relative select-none">
        {/* elegant decorative X icon on the top right like in the image to close the sidebar */}
        <div 
          onClick={onCloseSidebar}
          className="absolute top-4 right-4 text-[#8c7a6b]/40 hover:text-[#8c7a6b] font-sans text-xs font-light select-none transition-colors cursor-pointer p-1"
          title="Close Menu"
        >
          ✕
        </div>

        <div className="text-[10px] tracking-[4.5px] uppercase font-light text-[#8c7a6b] font-sans mb-1.5">
          Vianaar Homes
        </div>
        <h1 className="font-serif text-[42px] text-[#1c3c31] leading-none select-none tracking-tight font-normal">
          Morjim
        </h1>
        <div className="font-serif italic text-[24px] text-[#1c3c31]/85 mt-0.5 tracking-wide select-none">
          Estate
        </div>
        <div className="text-[9px] tracking-[3.5px] font-light text-[#8c7a6b] uppercase font-sans mt-3.5">
          Morjim . North Goa
        </div>
        
        {/* Centered gold division strike stroke */}
        <div className="w-12 h-[1.2px] bg-[#c5b59f] mx-auto mt-4" />
      </div>

      {/* Sidebar Scrollable Body */}
      <div className="flex-1 overflow-y-auto scrollbar-none bg-[#FAF8F5] p-5 space-y-6">
        
        {/* Site Plan Section Container */}
        <div>
          <div className="text-[9.5px] tracking-[3px] uppercase font-light text-[#8c7a6b] mb-4 select-none font-sans">
            Site Plan
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveOverlayTab('a');
                  const phase = phases.find(p => p.id === 'a');
                  if (phase) onFlyToProject(phase.coords);
                }}
                className={`py-3 px-4 border text-[10.5px] font-sans font-light tracking-wider transition-all duration-200 uppercase cursor-pointer rounded-none text-center ${
                  activeOverlayTab === 'a'
                    ? 'bg-[#1c3c31] text-white border-[#1c3c31] shadow-sm font-medium'
                    : 'bg-white text-[#1c3c31] border-[#ebdcd0]/75 hover:bg-[#1c3c31]/5 hover:border-[#1c3c31]/30'
                }`}
              >
                Estate 1
              </button>
              <button
                onClick={() => {
                  setActiveOverlayTab('b');
                  const phase = phases.find(p => p.id === 'b');
                  if (phase) onFlyToProject(phase.coords);
                }}
                className={`py-3 px-4 border text-[10.5px] font-sans font-light tracking-wider transition-all duration-200 uppercase cursor-pointer rounded-none text-center ${
                  activeOverlayTab === 'b'
                    ? 'bg-[#1c3c31] text-white border-[#1c3c31] shadow-sm font-medium'
                    : 'bg-white text-[#1c3c31] border-[#ebdcd0]/75 hover:bg-[#1c3c31]/5 hover:border-[#1c3c31]/30'
                }`}
              >
                Estate 2
              </button>
            </div>
            <button
              onClick={() => {
                setActiveOverlayTab('combined');
                // Fly to midpoint
                onFlyToProject({ lat: 15.641485, lng: 73.743294 });
              }}
              className={`py-3 px-4 border text-[10.5px] font-sans font-light tracking-wider transition-all duration-200 uppercase cursor-pointer rounded-none text-center w-full ${
                activeOverlayTab === 'combined'
                  ? 'bg-[#1c3c31] text-white border-[#1c3c31] shadow-sm font-medium'
                  : 'bg-white text-[#1c3c31] border-[#ebdcd0]/75 hover:bg-[#1c3c31]/5 hover:border-[#1c3c31]/30'
              }`}
            >
              Show Combined View
            </button>
          </div>
        </div>

        {/* Floor Plans Section Container */}
        <div>
          <div className="text-[9.5px] tracking-[3px] uppercase font-light text-[#8c7a6b] mb-4 select-none font-sans">
            Floor Plans
          </div>
          
          <div className="space-y-4">
            {phases.map((phase) => {
              const isSelected = activeOverlayTab === phase.id;
              const villaData = phase.id === 'a' ? ESTATE_1_VILLAS : ESTATE_2_VILLAS;
              const villaKeys = Object.keys(villaData).sort((a, b) => {
                const numA = parseInt(a, 10);
                const numB = parseInt(b, 10);
                if (!isNaN(numA) && !isNaN(numB)) {
                  return numA - numB;
                }
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
              });
              
              return (
                <div
                  key={phase.id}
                  onClick={() => {
                    setActiveOverlayTab(phase.id);
                    onFlyToProject(phase.coords);
                  }}
                  className={`transition-all duration-300 rounded-none p-5 border cursor-pointer select-none relative ${
                    isSelected
                      ? 'bg-white border-[#1c3c31] shadow-sm'
                      : 'bg-[#fffdfa]/65 border-[#ebdcd0]/50 hover:border-[#1c3c31]/30 hover:bg-white'
                  }`}
                >
                  {/* Card Title Content */}
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-serif text-[19px] font-normal text-[#1c3c31] leading-tight select-none">
                        {phase.projectName}
                      </h4>
                    </div>

                    {/* Elegant Units pill badge with 90-degree corners on the right */}
                    <span className="shrink-0 border border-[#ebdcd0] text-[#1c3c31]/80 px-2.5 py-0.5 rounded-none text-[9.5px] font-sans font-light bg-[#f9f7f4] select-none tracking-widest">
                      {phase.projectName === 'Morjim Estate 1' ? '14 UNITS' : '10 UNITS'}
                    </span>
                  </div>

                  {/* Left Nav Unit Grid & Specs appearing when card is selected */}
                  {isSelected && (
                    <div 
                      className="mt-5 pt-4 border-t border-[#ebdcd0]/45 animate-fadeIn"
                      onClick={(e) => e.stopPropagation()} /* Prevent closing when clicking grid contents */
                    >
                      <div className="text-[9px] tracking-[2.5px] uppercase font-light text-[#8c8276] mb-3.5 font-sans">
                        Select Villa / Residence
                      </div>
                      
                      {/* Straight 90 degree corner premium grid with NO status dots */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {villaKeys.map((vKey) => {
                          const isSelectedVilla = selectedVilla === vKey;
                          
                          return (
                            <button
                              key={vKey}
                              onClick={() => {
                                setSelectedVilla(vKey);
                                if (onOpenFloorPlan) {
                                  onOpenFloorPlan(vKey, phase.id as 'a' | 'b');
                                }
                              }}
                              className={`h-10 rounded-none text-xs font-sans font-light tracking-widest transition-all duration-200 relative flex items-center justify-center cursor-pointer border ${
                                isSelectedVilla
                                  ? 'bg-[#1c3c31] text-white border-[#1c3c31] shadow-sm font-medium'
                                  : 'bg-white text-[#1c3c31] border-[#ebdcd0]/45 hover:bg-[#1c3c31]/5 hover:border-[#1c3c31]/30'
                              }`}
                            >
                               {vKey}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Renders Section Container */}
        <div className="pt-2">
          <div className="text-[9.5px] tracking-[3px] uppercase font-light text-[#8c7a6b] mb-4 select-none font-sans">
            Renders
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onOpenRenders('a')}
              className="py-3 px-4 border border-[#ebdcd0]/75 bg-white text-[#1c3c31] text-[10.5px] font-sans font-light tracking-wider hover:bg-[#1c3c31]/5 hover:border-[#1c3c31]/30 transition-all duration-200 uppercase cursor-pointer rounded-none text-center"
            >
              Estate 1
            </button>
            <button
              onClick={() => onOpenRenders('b')}
              className="py-3 px-4 border border-[#ebdcd0]/75 bg-white text-[#1c3c31] text-[10.5px] font-sans font-light tracking-wider hover:bg-[#1c3c31]/5 hover:border-[#1c3c31]/30 transition-all duration-200 uppercase cursor-pointer rounded-none text-center"
            >
              Estate 2
            </button>
          </div>
        </div>

      </div>
    </aside>
  );
}
