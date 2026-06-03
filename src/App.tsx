import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Eye, EyeOff, Check, X, ShieldCheck, Mail, Phone, User, Landmark, Building2, HelpCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import DevPanel from './components/DevPanel';
import { OverlayConfig, ProjectPhase, MapTileStyle, OverlayMode } from './types';
import L from 'leaflet';

// Sample coordinates representing Morjim, North Goa
const PROJECT_A_COORDS = { lat: 15.640944, lng: 73.743222 };
const PROJECT_B_COORDS = { lat: 15.642944, lng: 73.746222 };

export default function App() {
  const [activeOverlayTab, setActiveOverlayTab] = useState<'a' | 'b'>('a');
  const [mapStyle, setMapStyle] = useState<MapTileStyle>('satellite');
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('geo');
  const [mapZoomState, setMapZoomState] = useState(17);
  const [showDevTools, setShowDevTools] = useState(true);
  
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

  // Reference for direct Leaflet map interactions
  const mapRef = useRef<L.Map | null>(null);

  // Initialize Overlay configurations (Restoring from localStorage if available)
  const [overlayConfigs, setOverlayConfigs] = useState<{ a: OverlayConfig; b: OverlayConfig }>(() => {
    const saved = localStorage.getItem('vianaar_morjim_alignment');
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
        y: 110,
        w: 390,
        h: 390,
        r: 0,
        o: 85,
        lat: PROJECT_A_COORDS.lat,
        lng: PROJECT_A_COORDS.lng,
        widthDeg: 0.0032,
        heightDeg: 0.0032,
        visible: true,
        localImageSrc: null,
      },
      b: {
        x: 520,
        y: 110,
        w: 390,
        h: 390,
        r: 0,
        o: 85,
        lat: PROJECT_B_COORDS.lat,
        lng: PROJECT_B_COORDS.lng,
        widthDeg: 0.0032,
        heightDeg: 0.0032,
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
    localStorage.setItem('vianaar_morjim_alignment', JSON.stringify(serialized));
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
        setActiveOverlayTab={setActiveOverlayTab}
        overlayConfigs={overlayConfigs}
        updateOverlayOpacity={updateOverlayOpacity}
        updateOverlayVisibility={updateOverlayVisibility}
        mapStyle={mapStyle}
        setMapStyle={setMapStyle}
        onEnquireClick={() => setIsEnquiryOpen(true)}
        onFlyToProject={handleFlyToProject}
      />

      {/* MAP VIEWER PORTAL */}
      <div id="map-container" className="flex-1 h-full relative flex flex-col overflow-hidden">
        
        {/* Dynamic Map and Overlay engine */}
        <MapContainer
          activeOverlayTab={activeOverlayTab}
          overlayConfigs={overlayConfigs}
          mapStyle={mapStyle}
          overlayMode={overlayMode}
          setMapZoomState={setMapZoomState}
          mapRef={mapRef}
        />

        {/* Developer Alignment Tool Controls (Toggle Bar) */}
        <div className="absolute top-4 right-[340px] z-10 flex items-center gap-1.5 select-none bg-white/90 backdrop-blur-sm border border-[#d8d0c8] p-1.5 rounded-md shadow-sm">
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider rounded font-sans transition-all flex items-center gap-1.5 cursor-pointer border ${
              showDevTools
                ? 'bg-neutral-900 border-neutral-900 text-[#00e09e]'
                : 'bg-white border-[#d8d0c8] text-stone-600 hover:text-stone-900'
            }`}
          >
            {showDevTools ? 'Hide Dev Tool' : 'Show Calibration Tool'}
          </button>
        </div>

        {/* DEVELOPER CALIBRATION ALIGNER PANEL */}
        {showDevTools && (
          <DevPanel
            activeOverlayTab={activeOverlayTab}
            setActiveOverlayTab={setActiveOverlayTab}
            overlayConfigs={overlayConfigs}
            setOverlayConfigs={setOverlayConfigs}
            overlayMode={overlayMode}
            setOverlayMode={setOverlayMode}
            mapZoomState={mapZoomState}
            mapRef={mapRef}
          />
        )}
      </div>

      {/* LUXURY VIANAAR ENQUIRY LIGHTBOX POPUP */}
      {isEnquiryOpen && (
        <div className="fixed inset-0 bg-[#0c0d0c]/60 backdrop-blur-md z-[2000] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#fcfbfa] border border-[#d8d0c8] rounded shadow-2xl overflow-hidden font-sans text-[#1a1a1a]">
            
            {/* Modal Heading */}
            <div className="p-6 bg-[#008e62] text-white flex justify-between items-center relative select-none">
              <div>
                <div className="text-[9px] tracking-[4px] uppercase opacity-75 font-semibold">Vianaar Homes</div>
                <h3 className="font-serif text-xl font-medium mt-0.5">Enquire — Morjim Estate</h3>
              </div>
              <button 
                onClick={() => setIsEnquiryOpen(false)}
                className="text-white hover:text-stone-200 transition-colors p-1.5 cursor-pointer rounded-full bg-white/10 hover:bg-white/20 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body & Form */}
            {enquirySuccess ? (
              <div className="p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100 shadow-inner">
                  <Check className="w-8 h-8 text-[#008e62] animate-bounce" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-[#1a1a1a] mb-2">Thank you for your enquiry</h4>
                <p className="text-stone-500 text-xs leading-relaxed max-w-sm">
                  Our luxury concierge agent will reach out in less than 24 hours to provide details, pricing plans, and high-resolution renders for <strong>{enquiryForm.phase}</strong>.
                </p>
                <div className="text-[10px] text-[#8a8a8a] mt-6 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#008e62]" /> GDPR Compliant • VIP Priority Router
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="p-6 space-y-4">
                <p className="text-stone-500 text-xs leading-relaxed font-sans mb-2">
                  Submit your details below to schedule a private walkthrough or map detailing alignment chat with our North Goa project leads.
                </p>

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-widest text-[#8a8a8a] uppercase flex items-center gap-1">
                    <User className="w-3 h-3 text-[#008e62]" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={enquiryForm.name}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                    className="w-full text-sm p-2.5 border border-[#d8d0c8] bg-white rounded focus:border-[#008e62] focus:ring-1 focus:ring-[#008e62] focus:outline-none transition-all font-sans text-[#1a1a1a]"
                  />
                </div>

                {/* Contact Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-widest text-[#8a8a8a] uppercase flex items-center gap-1">
                      <Mail className="w-3 h-3 text-[#008e62]" /> Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@example.com"
                      value={enquiryForm.email}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      className="w-full text-sm p-2.5 border border-[#d8d0c8] bg-white rounded focus:border-[#008e62] focus:ring-1 focus:ring-[#008e62] focus:outline-none transition-all font-sans text-[#1a1a1a]"
                    />
                  </div>
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold tracking-widest text-[#8a8a8a] uppercase flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#008e62]" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={enquiryForm.phone}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      className="w-full text-sm p-2.5 border border-[#d8d0c8] bg-white rounded focus:border-[#008e62] focus:ring-1 focus:ring-[#008e62] focus:outline-none transition-all font-sans text-[#1a1a1a]"
                    />
                  </div>
                </div>

                {/* Phase Selection */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-widest text-[#8a8a8a] uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#008e62]" /> Intended Phase
                  </label>
                  <select
                    value={enquiryForm.phase}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, phase: e.target.value })}
                    className="w-full text-sm p-2.5 border border-[#d8d0c8] bg-white rounded focus:border-[#008e62] focus:ring-1 focus:ring-[#008e62] focus:outline-none transition-all font-sans text-[#1a1a1a] cursor-pointer"
                  >
                    <option value="Phase 1 - Morjim Estate">Phase 1 — Premium Woodland Estates</option>
                    <option value="Phase 2 - Morjim Estate">Phase 2 — Boutique Forest Sanctuaries</option>
                    <option value="Both Phases">Interested in Both Phases</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold tracking-widest text-[#8a8a8a] uppercase flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-[#008e62]" /> Custom Request / Message
                  </label>
                  <textarea
                    rows={3}
                    value={enquiryForm.message}
                    onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    className="w-full text-sm p-2.5 border border-[#d8d0c8] bg-white rounded focus:border-[#008e62] focus:ring-1 focus:ring-[#008e62] focus:outline-none transition-all font-sans text-[#1a1a1a] resize-none"
                  />
                </div>

                {/* Buttons container */}
                <div className="pt-3 border-t border-[#f0ebe3] flex justify-end gap-3 select-none">
                  <button
                    type="button"
                    onClick={() => setIsEnquiryOpen(false)}
                    className="py-2.5 px-5 border border-[#d8d0c8] hover:bg-stone-50 text-[#1a1a1a] text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-[#008e62] hover:bg-[#006b4a] text-white text-xs font-semibold uppercase tracking-wider rounded shadow transition-all cursor-pointer"
                  >
                    Submit Enquiry
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
