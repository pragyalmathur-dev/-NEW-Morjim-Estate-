import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Eye, EyeOff, Check, X, ShieldCheck, Mail, Phone, User, Landmark, Building2, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import { OverlayConfig, ProjectPhase, MapTileStyle, OverlayMode } from './types';
import L from 'leaflet';

// Sample coordinates representing Morjim, North Goa
const PROJECT_A_COORDS = { lat: 15.641536252028756, lng: 73.74335110187532 };
const PROJECT_B_COORDS = { lat: 15.641435519694143, lng: 73.7432384490967 };

// Premium Architectural Renders configuration for Vianaar Morjim Estates I & II
const ESTATE_RENDERS = {
  a: [
    {
      url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      title: 'ESTATE 1 — GRAND WOODLAND PALACE FACADE',
      desc: 'Elegant staved-wood columns framing the premium double-height lap pool deck.'
    },
    {
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      title: 'ESTATE 1 — TRIPLE-ASPECT SUNKEN LOUNGE',
      desc: 'Seamless transition between imported travertine indoor flooring and nature trails.'
    },
    {
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
      title: 'ESTATE 1 — MASTER BEDROOM CANOPY VIEW',
      desc: 'Floor-to-ceiling glass wrapping around ancient forest groves with private wrap-around terrace.'
    }
  ],
  b: [
    {
      url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      title: 'ESTATE 2 — DEEP FOREST SUNSET VILLA',
      desc: 'Warm indirect cove lights reflecting on infinity-edge pools nestled in dense banyan canopies.'
    },
    {
      url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      title: 'ESTATE 2 — FLOATING GLASS TEA PAVILION',
      desc: 'Private outdoor pavilion suspended over natural springwater cascades.'
    },
    {
      url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
      title: 'ESTATE 2 — HYDRODYNAMIC PRIVATE GARDEN SPA',
      desc: 'Dappled sunlight filtering through teak leaves over the custom-crafted stone wellness pool.'
    }
  ]
};

export default function App() {
  const [activeOverlayTab, setActiveOverlayTab] = useState<'a' | 'b' | 'combined'>('combined');
  const [selectedVilla, setSelectedVilla] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapTileStyle>('satellite');
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('geo');
  const [mapZoomState, setMapZoomState] = useState(19);
  
  // Enquiry Modal States
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState(false);
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    phase: 'Phase 1 - Morjim Estate',
    message: 'Hello, I would like to receive pricing brochures and site layouts for the ultra-luxury villas in Morjim Estate.',
  });

  // Renders Gallery Modal States
  const [rendersModalOpen, setRendersModalOpen] = useState(false);
  const [rendersActiveId, setRendersActiveId] = useState<'a' | 'b'>('a');
  const [rendersActiveImageIdx, setRendersActiveImageIdx] = useState(0);

  // Reference for direct Leaflet map interactions
  const mapRef = useRef<L.Map | null>(null);

  // Initialize Overlay configurations (Restoring from localStorage if available)
  const [overlayConfigs, setOverlayConfigs] = useState<{ a: OverlayConfig; b: OverlayConfig }>(() => {
    const saved = localStorage.getItem('vianaar_morjim_alignment_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Clear local image data on reload to prevent inflating localStorage
        if (parsed.a) parsed.a.localImageSrc = null;
        if (parsed.b) parsed.b.localImageSrc = null;
        return parsed;
      } catch (e) {
        // Fallback below
      }
    }

    return {
      a: {
        x: 180,
        y: 195,
        w: 382,
        h: 279,
        r: -143.6,
        o: 100,
        lat: PROJECT_A_COORDS.lat,
        lng: PROJECT_A_COORDS.lng,
        widthDeg: 0.0017719999999999995,
        heightDeg: 0.0010478173618940247,
        visible: true,
        localImageSrc: null,
      },
      b: {
        x: 340,
        y: 103,
        w: 441,
        h: 301,
        r: -142.69999999999993,
        o: 100,
        lat: PROJECT_B_COORDS.lat,
        lng: PROJECT_B_COORDS.lng,
        widthDeg: 0.0017319999999999994,
        heightDeg: 0.0011198983384940466,
        visible: true,
        localImageSrc: null,
      },
    };
  });

  // Save current positioning parameters to localStorage to prevent losing setup on refresh
  useEffect(() => {
    const serialized = {
      a: { ...overlayConfigs.a, localImageSrc: null },
      b: { ...overlayConfigs.b, localImageSrc: null },
    };
    localStorage.setItem('vianaar_morjim_alignment_v5', JSON.stringify(serialized));
  }, [overlayConfigs]);

  // Project details definitions matching top-end architectural specs
  const phases: ProjectPhase[] = [
    {
      id: 'a',
      phaseName: 'Phase 1 — Premium Woodland Estates',
      projectName: 'Morjim Estate 1',
      type: 'Ultra-Luxury Villas',
      units: '14 Exclusive Residences',
      config: '4 & 5 BHK Private Pools',
      status: 'Civil Works/Finishing',
      area: '4,500 - 6,800 sq.ft.',
      color: '#008e62',
      borderColor: '#006b4a',
      coords: PROJECT_A_COORDS,
    },
    {
      id: 'b',
      phaseName: 'Phase 2 — Boutique Forest Sanctuaries',
      projectName: 'Morjim Estate 2',
      type: 'Bespoke Forest Villas',
      units: '8 Private Sanctuaries',
      config: '5 BHK Forest Views',
      status: 'Launching Soon / RERA Approved',
      area: '5,500 - 8,400 sq.ft.',
      color: '#c8860a',
      borderColor: '#a06a00',
      coords: PROJECT_B_COORDS,
    },
  ];

  // Fly Map to coordinate
  const handleFlyToProject = (coords: { lat: number; lng: number }) => {
    if (mapRef.current) {
      mapRef.current.setView([coords.lat, coords.lng], 18, {
        animate: true,
        duration: 1.5,
      });
    }
  };

  const updateOverlayOpacity = (id: 'a' | 'b', value: number) => {
    setOverlayConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        o: value,
      },
    }));
  };

  const updateOverlayVisibility = (id: 'a' | 'b', value: boolean) => {
    setOverlayConfigs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        visible: value,
      },
    }));
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySuccess(true);
    // Simulate real communication
    setTimeout(() => {
      setIsEnquiryOpen(false);
      setEnquirySuccess(false);
      setEnquiryForm({
        name: '',
        email: '',
        phone: '',
        phase: 'Phase 1 - Morjim Estate',
        message: 'Hello, I would like to receive pricing brochures and site layouts for the ultra-luxury villas in Morjim Estate.',
      });
    }, 2800);
  };

  return (
    <div id="app" className="flex h-screen w-screen overflow-hidden bg-[#faf8f4] font-sans antialiased text-[#1a1a1a]">
      
      {/* SIDEBAR NAVIGATION BAR */}
      <Sidebar
        phases={phases}
        activeOverlayTab={activeOverlayTab}
        setActiveOverlayTab={(id) => {
          setActiveOverlayTab(id);
          if (id === 'combined') {
            setSelectedVilla(null);
            setOverlayConfigs((prev) => ({
              ...prev,
              a: { ...prev.a, o: 100 },
              b: { ...prev.b, o: 100 },
            }));
          } else {
            setSelectedVilla(id === 'a' ? '1' : 'A');
            // Automatically focus / set opacity of current estate to 100 and the other to 30
            setOverlayConfigs((prev) => ({
              ...prev,
              [id]: { ...prev[id], o: 100 },
              [id === 'a' ? 'b' : 'a']: { ...prev[id === 'a' ? 'b' : 'a'], o: 30 },
            }));
          }
        }}
        overlayConfigs={overlayConfigs}
        updateOverlayOpacity={updateOverlayOpacity}
        updateOverlayVisibility={updateOverlayVisibility}
        mapStyle={mapStyle}
        setMapStyle={setMapStyle}
        onEnquireClick={(prefilledMessage?: string) => {
          if (prefilledMessage) {
            setEnquiryForm((prev) => ({
              ...prev,
              message: prefilledMessage,
              phase: activeOverlayTab === 'a' ? 'Phase 1 - Morjim Estate' : activeOverlayTab === 'b' ? 'Phase 2 - Morjim Estate' : 'Combined Morjim Estates',
            }));
          }
          setIsEnquiryOpen(true);
        }}
        onFlyToProject={handleFlyToProject}
        selectedVilla={selectedVilla}
        setSelectedVilla={setSelectedVilla}
        onOpenRenders={(phaseId) => {
          setRendersActiveId(phaseId);
          setRendersActiveImageIdx(0);
          setRendersModalOpen(true);
        }}
      />

      {/* MAP VIEWER PORTAL */}
      <div id="map-container" className="flex-1 h-full relative flex flex-col overflow-hidden">
        
        {/* Dynamic Map and Overlay engine */}
        <MapContainer
          activeOverlayTab={activeOverlayTab}
          overlayConfigs={overlayConfigs}
          setOverlayConfigs={setOverlayConfigs}
          mapStyle={mapStyle}
          overlayMode={overlayMode}
          setMapZoomState={setMapZoomState}
          mapRef={mapRef}
        />
      </div>

      {/* LUXURY VIANAAR ENQUIRY LIGHTBOX POPUP */}
      {isEnquiryOpen && (
        <div className="fixed inset-0 bg-[#0c0d0c]/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#FAF8F5] border border-[#ebdcd0]/80 rounded-none shadow-2xl overflow-hidden font-sans font-light text-[#554e48]">
            
            {/* Modal Heading */}
            <div className="p-6 bg-[#1c3c31] text-white flex justify-between items-center relative select-none">
              <div>
                <div className="text-[9px] tracking-[4px] uppercase opacity-75 font-light font-sans">Vianaar Homes</div>
                <h3 className="font-serif text-2xl font-normal mt-0.5 tracking-wide">Enquire — Morjim Estate</h3>
              </div>
              <button 
                onClick={() => setIsEnquiryOpen(false)}
                className="text-white/75 hover:text-white transition-colors p-1.5 cursor-pointer rounded-none hover:bg-white/10 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body & Form */}
            {enquirySuccess ? (
              <div className="p-10 text-center flex flex-col items-center justify-center min-h-[300px] bg-white">
                <div className="w-16 h-16 bg-[#1c3c31]/5 rounded-none flex items-center justify-center mb-5 border border-[#1c3c31]/10">
                  <Check className="w-7 h-7 text-[#1c3c31] animate-pulse" />
                </div>
                <h4 className="font-serif text-[22px] font-normal text-[#1c3c31] mb-2.5">Thank you for your enquiry</h4>
                <p className="text-[#8c8276] text-xs leading-relaxed max-w-sm font-sans font-light">
                  Our luxury concierge agent will reach out in less than 24 hours to provide details, pricing plans, and high-resolution renders for <strong>{enquiryForm.phase}</strong>.
                </p>
                <div className="text-[10px] text-[#8a8a8a] mt-7 flex items-center gap-1 font-sans font-light tracking-wide uppercase">
                  <ShieldCheck className="w-4 h-4 text-[#16a34a]" /> GDPR Compliant • VIP Priority Router
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="p-7 space-y-5 bg-white">
                <p className="text-[#756f61] text-xs leading-relaxed font-sans font-light mb-2">
                  Submit your details below to schedule a private walkthrough or map detailing alignment chat with our North Goa project leads.
                </p>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-light tracking-widest text-[#8a8276] uppercase flex items-center gap-1.5 font-sans">
                    <User className="w-3.5 h-3.5 text-[#1c3c31]/80" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    className="w-full text-sm p-3 border border-[#ebdcd0]/75 bg-[#fffdfa]/50 rounded-none focus:border-[#1c3c31] focus:ring-1 focus:ring-[#1c3c31] focus:outline-none transition-all font-sans font-light text-[#1c3c31]"
                  />
                </div>

                {/* Contact Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-light tracking-widest text-[#8a8276] uppercase flex items-center gap-1.5 font-sans">
                      <Mail className="w-3.5 h-3.5 text-[#1c3c31]/80" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      className="w-full text-sm p-3 border border-[#ebdcd0]/75 bg-[#fffdfa]/50 rounded-none focus:border-[#1c3c31] focus:ring-1 focus:ring-[#1c3c31] focus:outline-none transition-all font-sans font-light text-[#1c3c31]"
                    />
                  </div>
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-light tracking-widest text-[#8a8276] uppercase flex items-center gap-1.5 font-sans">
                      <Phone className="w-3.5 h-3.5 text-[#1c3c31]/80" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      className="w-full text-sm p-3 border border-[#ebdcd0]/75 bg-[#fffdfa]/50 rounded-none focus:border-[#1c3c31] focus:ring-1 focus:ring-[#1c3c31] focus:outline-none transition-all font-sans font-light text-[#1c3c31]"
                    />
                  </div>
                </div>

                {/* Phase Selection */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-light tracking-widest text-[#8a8276] uppercase flex items-center gap-1.5 font-sans">
                    <Building2 className="w-3.5 h-3.5 text-[#1c3c31]/80" /> Intended Phase
                  </label>
                  <select
                    value={enquiryForm.phase}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phase: e.target.value })}
                    className="w-full text-sm p-3 border border-[#ebdcd0]/75 bg-[#fffdfa]/50 rounded-none focus:border-[#1c3c31] focus:ring-1 focus:ring-[#1c3c31] focus:outline-none transition-all font-sans font-light text-[#1c3c31] cursor-pointer"
                  >
                    <option value="Phase 1 - Morjim Estate">Phase 1 — Premium Woodland Estates</option>
                    <option value="Phase 2 - Morjim Estate">Phase 2 — Boutique Forest Sanctuaries</option>
                    <option value="Both Phases">Interested in Both Phases</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-light tracking-widest text-[#8a8276] uppercase flex items-center gap-1.5 font-sans">
                    <HelpCircle className="w-3.5 h-3.5 text-[#1c3c31]/80" /> Custom Request / Message
                  </label>
                  <textarea
                    rows={3}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="w-full text-sm p-3 border border-[#ebdcd0]/75 bg-[#fffdfa]/50 rounded-none focus:border-[#1c3c31] focus:ring-1 focus:ring-[#1c3c31] focus:outline-none transition-all font-sans font-light text-[#1c3c31] resize-none"
                  />
                </div>

                {/* Buttons container */}
                <div className="pt-4 border-t border-[#ebdcd0]/45 flex justify-end gap-3 select-none">
                  <button
                    type="button"
                    onClick={() => setIsEnquiryOpen(false)}
                    className="py-3 px-6 border border-[#ebdcd0] hover:bg-stone-50 text-[#1c3c31] text-[11px] font-sans font-light uppercase tracking-widest rounded-none transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-3 px-7 bg-[#1c3c31] hover:bg-[#2c4c3e] text-white text-[11px] font-sans font-light uppercase tracking-widest rounded-none shadow-sm transition-all cursor-pointer"
                  >
                    Submit Enquiry
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* LUXURY RENDERS GALLERY DIALOG BOX */}
      {rendersModalOpen && (
        <div className="fixed inset-0 bg-[#0c0d0c]/90 backdrop-blur-md z-[3000] flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl w-full bg-[#1c3c31] border border-[#ebdcd0]/40 rounded-none shadow-2xl overflow-hidden flex flex-col select-none font-sans font-light">
            
            {/* Close Button Top Right */}
            <button
              onClick={() => setRendersModalOpen(false)}
              className="absolute top-4 right-4 z-50 text-white/80 hover:text-white bg-black/40 hover:bg-black/65 p-2 rounded-none transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Slider container with arrows */}
            <div className="relative aspect-video w-full bg-stone-950 flex items-center justify-center overflow-hidden">
              {/* Left Arrow */}
              <button
                onClick={() => {
                  const arr = ESTATE_RENDERS[rendersActiveId];
                  setRendersActiveImageIdx((prev) => (prev === 0 ? arr.length - 1 : prev - 1));
                }}
                className="absolute left-4 z-40 text-white hover:text-[#1c3c31] bg-black/40 hover:bg-[#ebdcd0] p-3 rounded-none transition-all duration-200 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Main Image */}
              <img
                src={ESTATE_RENDERS[rendersActiveId][rendersActiveImageIdx].url}
                alt={ESTATE_RENDERS[rendersActiveId][rendersActiveImageIdx].title}
                className="w-full h-full object-cover select-none transition-all duration-500"
                referrerPolicy="no-referrer"
              />

              {/* Right Arrow */}
              <button
                onClick={() => {
                  const arr = ESTATE_RENDERS[rendersActiveId];
                  setRendersActiveImageIdx((prev) => (prev === arr.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 z-40 text-white hover:text-[#1c3c31] bg-black/40 hover:bg-[#ebdcd0] p-3 rounded-none transition-all duration-200 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Premium Header/Caption area - Straight 90 degree edges matching Vianaar style */}
            <div className="p-6 bg-[#1c3c31] border-t border-[#ebdcd0]/20 text-white text-center">
              <span className="text-[10px] tracking-[4px] text-[#ebdcd0] uppercase font-light">
                {rendersActiveId === 'a' ? 'Morjim Estate I Renders' : 'Morjim Estate II Renders'}
              </span>
              <h4 className="font-serif text-lg tracking-wide font-normal text-white mt-1.5 mb-1 select-none">
                {ESTATE_RENDERS[rendersActiveId][rendersActiveImageIdx].title}
              </h4>
              <p className="text-[#ebdcd0]/75 text-[11px] font-light max-w-xl mx-auto leading-relaxed select-none">
                {ESTATE_RENDERS[rendersActiveId][rendersActiveImageIdx].desc}
              </p>
              
              {/* Bullets indicator */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {ESTATE_RENDERS[rendersActiveId].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setRendersActiveImageIdx(idx)}
                    className={`h-1 transition-all duration-300 ${
                      rendersActiveImageIdx === idx ? 'w-8 bg-[#ebdcd0]' : 'w-2 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
