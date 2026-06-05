import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Eye, EyeOff, Check, X, ShieldCheck, Mail, Phone, User, Landmark, Building2, HelpCircle, ChevronLeft, ChevronRight, Menu, Plus, Minus, RotateCcw } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import { OverlayConfig, ProjectPhase, MapTileStyle, OverlayMode } from './types';
import { ESTATE_1_VILLAS, ESTATE_2_VILLAS } from './data/villas';
import L from 'leaflet';

// Sample coordinates representing Morjim, North Goa
const PROJECT_A_COORDS = { lat: 15.64249708103591, lng: 73.74422550201417 };
const PROJECT_B_COORDS = { lat: 15.642776362003868, lng: 73.74419404434208 };

// Premium Architectural Renders configuration for Vianaar Morjim Estates I & II
const ESTATE_RENDERS: Record<'a' | 'b', Array<{ url: string; title: string; sub?: string; desc: string }>> = {
  a: [
    {
      url: '/assets/renders/ME1_Front.jpg',
      title: 'Morjim Estate 1',
      sub: 'Front View',
      desc: 'Note: Visual renders are indicative and subject to modification to align with final design requirements.'
    },
    {
      url: '/assets/renders/ME1_Back.jpg',
      title: 'Morjim Estate 1',
      sub: 'Back View',
      desc: 'Note: Visual renders are indicative and subject to modification to align with final design requirements.'
    }
  ],
  b: [
    {
      url: '/assets/renders/ME2_D_Front.jpg',
      title: 'Morjim Estate 2 (Villa D)',
      sub: 'Front View',
      desc: 'Note: Visual renders are indicative and subject to modification to align with final design requirements.'
    },
    {
      url: '/assets/renders/ME2_D_Back.jpg',
      title: 'Morjim Estate 2 (Villa D)',
      sub: 'Back View',
      desc: 'Note: Visual renders are indicative and subject to modification to align with final design requirements.'
    },
    {
      url: '/assets/renders/ME2_E_Front.jpg',
      title: 'Morjim Estate 2 (Villa E)',
      sub: 'Front View',
      desc: 'Note: Visual renders are indicative and subject to modification to align with final design requirements.'
    },
    {
      url: '/assets/renders/ME2_E_Back.jpg',
      title: 'Morjim Estate 2 (Villa E)',
      sub: 'Back View',
      desc: 'Note: Visual renders are indicative and subject to modification to align with final design requirements.'
    }
  ]
};

export default function App() {
  const [activeOverlayTab, setActiveOverlayTab] = useState<'a' | 'b' | 'combined'>('combined');
  const [selectedVilla, setSelectedVilla] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapTileStyle>('satellite');
  const [overlayMode, setOverlayMode] = useState<OverlayMode>('geo');
  const [mapZoomState, setMapZoomState] = useState(19);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alignModeEnabled, setAlignModeEnabled] = useState(false);
  const [alignSelectedId, setAlignSelectedId] = useState<'a' | 'b'>('b');
  const [configCopied, setConfigCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<'a' | 'b' | 'full' | null>(null);
  
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

  // Floor Plans Modal States
  const [floorPlanModalOpen, setFloorPlanModalOpen] = useState(false);
  const [floorPlanVilla, setFloorPlanVilla] = useState<string>('2');
  const [floorPlanEstateId, setFloorPlanEstateId] = useState<'a' | 'b'>('a');
  const [withDimension, setWithDimension] = useState<boolean>(true);
  const [floorLevel, setFloorLevel] = useState<'GF' | 'FF'>('GF');
  const [floorPlanZoom, setFloorPlanZoom] = useState<number>(1.0);
  const [floorPlanPan, setFloorPlanPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingFloorPlan, setIsDraggingFloorPlan] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [floorPlanLoadState, setFloorPlanLoadState] = useState<'loading' | 'loaded' | 'failed'>('loading');

  // Reset zoom and dynamically verify image size/status on filter/floor plan changes
  useEffect(() => {
    setFloorPlanLoadState('loading');
    setFloorPlanZoom(1.0);
    setFloorPlanPan({ x: 0, y: 0 });

    const fileBaseName = `ME${floorPlanEstateId === 'a' ? '1' : '2'}_${floorPlanVilla}_${floorLevel}_${withDimension ? 'WD' : 'WOD'}`;
    const imageUrl = `/assets/floorplans/${fileBaseName}.jpg`;

    let isMounted = true;

    fetch(imageUrl)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Image not found on server or cannot be retrieved');
        }
        const blob = await res.blob();
        // Since empty created files have 0 bytes, we intercept them and trigger the elegant fallback
        if (blob.size < 100) {
          throw new Error('Image is empty or uninitialized (0 bytes)');
        }
        
        if (isMounted) {
          // Pre-load layout image into memory to guarantee valid decoding
          const img = new Image();
          img.src = imageUrl;
          img.onload = () => {
            if (isMounted) setFloorPlanLoadState('loaded');
          };
          img.onerror = () => {
            if (isMounted) setFloorPlanLoadState('failed');
          };
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Floor plan file check triggered blueprint preview mode:", err.message);
          setFloorPlanLoadState('failed');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [floorPlanVilla, withDimension, floorLevel, floorPlanEstateId]);

  // Reference for direct Leaflet map interactions
  const mapRef = useRef<L.Map | null>(null);

  // Initialize Overlay configurations (Restoring from localStorage if available)
  const [overlayConfigs, setOverlayConfigs] = useState<{ a: OverlayConfig; b: OverlayConfig }>(() => {
    const saved = localStorage.getItem('vianaar_morjim_alignment_v6');
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
        r: -14.9,
        o: 100,
        lat: PROJECT_A_COORDS.lat,
        lng: PROJECT_A_COORDS.lng,
        widthDeg: 0.0034114026751831403,
        heightDeg: 0.0020172273992486553,
        visible: true,
        localImageSrc: null,
      },
      b: {
        x: 340,
        y: 103,
        w: 441,
        h: 301,
        r: -14.8,
        o: 100,
        lat: PROJECT_B_COORDS.lat,
        lng: PROJECT_B_COORDS.lng,
        widthDeg: 0.003396683398,
        heightDeg: 0.002011435145,
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
    localStorage.setItem('vianaar_morjim_alignment_v6', JSON.stringify(serialized));
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

  const handleNudge = (direction: 'up' | 'down' | 'left' | 'right' | 'scale-up' | 'scale-down' | 'width-up' | 'width-down' | 'height-up' | 'height-down' | 'rotate-left' | 'rotate-right') => {
    setOverlayConfigs((prev) => {
      const config = prev[alignSelectedId];
      let { lat, lng, widthDeg, heightDeg, r, x, y, w, h } = config;

      if (overlayMode === 'geo') {
        const moveStep = 0.000002; // ultra high precision step for spatial fine-tuning
        const rotateStep = 0.2;     // degrees
        const scaleStep = 1.002;    // multiplier for aspect-locked custom scaling
        
        switch (direction) {
          case 'up':
            lat += moveStep;
            break;
          case 'down':
            lat -= moveStep;
            break;
          case 'left':
            lng -= moveStep;
            break;
          case 'right':
            lng += moveStep;
            break;
          case 'scale-up':
            widthDeg = parseFloat((widthDeg * scaleStep).toFixed(12));
            heightDeg = parseFloat((heightDeg * scaleStep).toFixed(12));
            break;
          case 'scale-down':
            widthDeg = parseFloat((widthDeg / scaleStep).toFixed(12));
            heightDeg = parseFloat((heightDeg / scaleStep).toFixed(12));
            break;
          case 'width-up':
            widthDeg = parseFloat((widthDeg * scaleStep).toFixed(12));
            break;
          case 'width-down':
            widthDeg = parseFloat((widthDeg / scaleStep).toFixed(12));
            break;
          case 'height-up':
            heightDeg = parseFloat((heightDeg * scaleStep).toFixed(12));
            break;
          case 'height-down':
            heightDeg = parseFloat((heightDeg / scaleStep).toFixed(12));
            break;
          case 'rotate-left':
            r = parseFloat((r - rotateStep).toFixed(2));
            break;
          case 'rotate-right':
            r = parseFloat((r + rotateStep).toFixed(2));
            break;
        }
      } else {
        const moveStep = 1; // screen px step
        const rotateStep = 0.2;
        const scaleStep = 1.002;

        switch (direction) {
          case 'up':
            y -= moveStep;
            break;
          case 'down':
            y += moveStep;
            break;
          case 'left':
            x -= moveStep;
            break;
          case 'right':
            x += moveStep;
            break;
          case 'scale-up':
            w = Math.max(20, Math.round(w * scaleStep));
            h = Math.max(20, Math.round(h * scaleStep));
            break;
          case 'scale-down':
            w = Math.max(20, Math.round(w / scaleStep));
            h = Math.max(20, Math.round(h / scaleStep));
            break;
          case 'width-up':
            w = Math.max(20, Math.round(w * scaleStep));
            break;
          case 'width-down':
            w = Math.max(20, Math.round(w / scaleStep));
            break;
          case 'height-up':
            h = Math.max(20, Math.round(h * scaleStep));
            break;
          case 'height-down':
            h = Math.max(20, Math.round(h / scaleStep));
            break;
          case 'rotate-left':
            r = parseFloat((r - rotateStep).toFixed(2));
            break;
          case 'rotate-right':
            r = parseFloat((r + rotateStep).toFixed(2));
            break;
        }
      }

      // wrap rotation boundaries
      if (r > 180) r -= 360;
      if (r < -180) r += 360;

      return {
        ...prev,
        [alignSelectedId]: {
          ...config,
          lat,
          lng,
          widthDeg,
          heightDeg,
          r,
          x,
          y,
          w,
          h,
        }
      };
    });
  };

  return (
    <div id="app" className="relative flex h-screen w-screen overflow-hidden bg-[#faf8f4] font-sans antialiased text-[#1a1a1a]">
      
      {/* 3 Parallel Line Hamburger Button to open menu, visible when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-[1700] bg-[#FAF8F5] border border-[#ebdcd0]/80 hover:bg-[#ebdcd0]/10 shadow-md transition-all duration-200 text-[#1c3c31] hover:scale-105 flex flex-col gap-1.5 w-11 h-11 p-0 justify-center items-center cursor-pointer rounded-none"
          title="Open Menu"
        >
          <span className="w-5 h-[1px] bg-[#1c3c31]" />
          <span className="w-5 h-[1px] bg-[#1c3c31]" />
          <span className="w-5 h-[1px] bg-[#1c3c31]" />
        </button>
      )}

      {/* Backdrop overlay for closing the drawer, visible when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-transparent z-[1800] pointer-events-auto"
        />
      )}

      {/* SIDEBAR NAVIGATION DRAWER */}
      <div
        className={`fixed top-0 left-0 h-full z-[1900] bg-[#FAF8F5] transition-transform duration-300 ease-in-out shadow-2xl border-r border-[#ebdcd0]/70 flex flex-col transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '320px' }}
      >
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
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onOpenFloorPlan={(villaId, estateId) => {
            setFloorPlanVilla(villaId);
            setFloorPlanEstateId(estateId);
            setFloorPlanModalOpen(true);
          }}
        />
      </div>

      {/* MAP VIEWER PORTAL */}
      <div 
        id="map-container" 
        className={`flex-1 h-full relative flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'pl-[0px]' : 'pl-0'
        }`}
      >
        
        {/* Dynamic Map and Overlay engine */}
        <MapContainer
          activeOverlayTab={activeOverlayTab}
          overlayConfigs={overlayConfigs}
          setOverlayConfigs={setOverlayConfigs}
          mapStyle={mapStyle}
          overlayMode={overlayMode}
          setMapZoomState={setMapZoomState}
          mapRef={mapRef}
          alignModeEnabled={alignModeEnabled}
          alignSelectedId={alignSelectedId}
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
                className="w-full h-full object-contain select-none transition-all duration-500"
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
              <h4 className="font-serif text-lg tracking-wide font-normal text-white mt-1.5 mb-0.5 select-none">
                {ESTATE_RENDERS[rendersActiveId][rendersActiveImageIdx].title}
              </h4>
              {ESTATE_RENDERS[rendersActiveId][rendersActiveImageIdx].sub && (
                <div className="text-[11px] tracking-[2px] text-[#ebdcd0]/90 uppercase font-light mb-2 select-none">
                  {ESTATE_RENDERS[rendersActiveId][rendersActiveImageIdx].sub}
                </div>
              )}
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

      {/* LUXURY FLOOR PLAN DIALOG BOX */}
      {floorPlanModalOpen && (() => {
        // Retrieve villa details
        const activeVillaData = floorPlanEstateId === 'a' 
          ? ESTATE_1_VILLAS[floorPlanVilla] 
          : ESTATE_2_VILLAS[floorPlanVilla];
        
        const villaStatus = activeVillaData?.status || 'Available';
        const bhkConfig = activeVillaData?.config || '4 BHK';
        const totalArea = activeVillaData?.area || '4,500 sq.ft.';
        
        // Padded formatted villa name (e.g. '04' instead of '4')
        const formattedVillaName = /^[0-9]+$/.test(floorPlanVilla) 
          ? `VILLA ${floorPlanVilla.padStart(2, '0')}` 
          : `VILLA ${floorPlanVilla}`;

        // Construct dynamic file name and URL based on user's schema:
        // ME1_2_GF_WD.jpg or ME1_3_FF_WOD.jpg
        const fileBaseName = `ME${floorPlanEstateId === 'a' ? '1' : '2'}_${floorPlanVilla}_${floorLevel}_${withDimension ? 'WD' : 'WOD'}`;
        const imageUrl = `/assets/floorplans/${fileBaseName}.jpg`;

        return (
          <div className="fixed inset-0 bg-[#0c0d0c]/70 backdrop-blur-md z-[3000] flex items-center justify-center p-4 animate-fadeIn font-sans">
            <div className="w-full max-w-4xl bg-[#FAF8F5] border border-[#ebdcd0]/75 rounded-none shadow-2xl flex flex-col md:max-h-[85vh] overflow-hidden select-none font-sans font-light">
              
              {/* Header section matching exact Vianaar style */}
              <div className="px-6 py-5 border-b border-[#ebdcd0]/45 flex justify-between items-center bg-[#FAF8F5] shrink-0">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3.5 flex-wrap">
                    <h2 className="font-serif text-3xl font-normal text-[#1c3c31] leading-none tracking-wide select-none">
                      {formattedVillaName}
                    </h2>
                  </div>
                </div>

                {/* Close Button Top Right */}
                <button
                  onClick={() => setFloorPlanModalOpen(false)}
                  className="text-[#8c7a6b]/60 hover:text-[#1c3c31] hover:bg-stone-100 transition-all p-2 rounded-none cursor-pointer focus:outline-none"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2-Column Split Body */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-white">
                
                {/* Left Side Pane: Selectors / Controls */}
                <div className="w-full md:w-[240px] px-6 py-8 border-b md:border-b-0 md:border-r border-[#ebdcd0]/45 bg-[#FAF8F5] shrink-0 space-y-8 flex flex-col justify-start">
                  
                  {/* Dimensions Filter */}
                  <div>
                    <h3 className="text-[10px] tracking-[2.5px] font-sans font-medium uppercase text-[#8c8276] mb-3">
                      Dimensions
                    </h3>
                    <div className="bg-[#efede9] rounded-full p-1 flex w-full select-none">
                      <button
                        onClick={() => setWithDimension(true)}
                        className={`py-2 px-3 rounded-full text-xs font-sans tracking-wide transition-all duration-200 cursor-pointer w-1/2 text-center focus:outline-none ${
                          withDimension
                            ? 'bg-[#1c3c31] text-white shadow-md font-medium'
                            : 'text-[#8c8276] hover:text-[#1c3c31]'
                        }`}
                      >
                        With
                      </button>
                      <button
                        onClick={() => setWithDimension(false)}
                        className={`py-2 px-3 rounded-full text-xs font-sans tracking-wide transition-all duration-200 cursor-pointer w-1/2 text-center focus:outline-none ${
                          !withDimension
                            ? 'bg-[#1c3c31] text-white shadow-md font-medium'
                            : 'text-[#8c8276] hover:text-[#1c3c31]'
                        }`}
                      >
                        Without
                      </button>
                    </div>
                  </div>

                  {/* Floor Level Filter */}
                  <div>
                    <h3 className="text-[10px] tracking-[2.5px] font-sans font-medium uppercase text-[#8c8276] mb-3">
                      Floor Level
                    </h3>
                    <div className="flex flex-col gap-2.5">
                      <button
                        onClick={() => setFloorLevel('GF')}
                        className={`w-full py-3 px-5 border rounded-full flex justify-between items-center text-xs font-sans tracking-widest uppercase transition-all duration-200 focus:outline-none cursor-pointer ${
                          floorLevel === 'GF'
                            ? 'bg-[#1c3c31] border-[#1c3c31] text-white shadow-md font-medium'
                            : 'bg-white border-[#ebdcd0]/75 hover:border-[#1c3c31]/40 text-[#1c3c31]/80 hover:text-[#1c3c31]'
                        }`}
                      >
                        <span>Ground Floor</span>
                        {floorLevel === 'GF' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ebdcd0]" />
                        )}
                      </button>
                      <button
                        onClick={() => setFloorLevel('FF')}
                        className={`w-full py-3 px-5 border rounded-full flex justify-between items-center text-xs font-sans tracking-widest uppercase transition-all duration-200 focus:outline-none cursor-pointer ${
                          floorLevel === 'FF'
                            ? 'bg-[#1c3c31] border-[#1c3c31] text-white shadow-md font-medium'
                            : 'bg-white border-[#ebdcd0]/75 hover:border-[#1c3c31]/40 text-[#1c3c31]/80 hover:text-[#1c3c31]'
                        }`}
                      >
                        <span>First Floor</span>
                        {floorLevel === 'FF' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ebdcd0]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Aesthetic Tip / Usage Note on Bottom of Sidebar */}
                  <div className="pt-6 border-t border-[#ebdcd0]/35 mt-auto hidden md:block">
                    <p className="text-[10px] text-[#8c8276] tracking-wide font-sans leading-relaxed font-light select-none">
                      Drag plan image anywhere within viewport to pan and inspect fine measurements. Use buttons to zoom.
                    </p>
                  </div>

                </div>

                {/* Right Side Pane: Interactive Viewport */}
                <div className="flex-1 bg-[#FAF8F5] p-4 md:p-6 flex flex-col min-h-[360px] md:min-h-0 relative">
                  
                  {/* Viewport Box */}
                  <div
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsDraggingFloorPlan(true);
                      setDragStart({ x: e.clientX - floorPlanPan.x, y: e.clientY - floorPlanPan.y });
                    }}
                    onMouseMove={(e) => {
                      if (!isDraggingFloorPlan) return;
                      setFloorPlanPan({
                        x: e.clientX - dragStart.x,
                        y: e.clientY - dragStart.y
                      });
                    }}
                    onMouseUp={() => setIsDraggingFloorPlan(false)}
                    onMouseLeave={() => setIsDraggingFloorPlan(false)}
                    className="flex-1 border border-[#ebdcd0]/60 rounded-2xl bg-white relative overflow-hidden flex items-center justify-center select-none cursor-grab active:cursor-grabbing shadow-inner"
                  >
                    {/* Architectural Blueprint Placeholder or Real Loaded Image */}
                    <div
                      style={{
                        transform: `translate(${floorPlanPan.x}px, ${floorPlanPan.y}px) scale(${floorPlanZoom})`,
                        transition: isDraggingFloorPlan ? 'none' : 'transform 100ms ease-out'
                      }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      {floorPlanLoadState === 'failed' ? (
                        /* Premium mock-up blueprint if the asset file is not uploaded yet */
                        <div className="p-8 w-full h-full flex flex-col justify-center items-center text-center bg-[#fdfcfa] select-none relative overflow-hidden">
                          {/* Blueprint Grid Lines & Compass Graphics */}
                          <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
                            backgroundImage: 'radial-gradient(circle, #1c3c31 1.5px, transparent 1.5px)',
                            backgroundSize: '24px 24px',
                          }} />
                          
                          {/* Radial background representing drafting draft circles */}
                          <div className="absolute w-[240px] h-[240px] border border-[#1c3c31]/5 rounded-full flex items-center justify-center opacity-85 pointer-events-none">
                            <div className="w-[180px] h-[180px] border border-dashed border-[#1c3c31]/5 rounded-full" />
                            <div className="w-[120px] h-[120px] border border-[#1c3c31]/5 rounded-full" />
                          </div>

                          {/* Decorative draft pointer angle */}
                          <div className="absolute pointer-events-none w-full h-[1px] bg-gradient-to-r from-transparent via-[#1c3c31]/5 to-transparent rotate-12" />
                          <div className="absolute pointer-events-none w-full h-[1px] bg-gradient-to-r from-transparent via-[#1c3c31]/5 to-transparent -rotate-45" />

                          {/* Technical drawing identifier watermark on bottom right */}
                          <div className="absolute bottom-5 right-5 text-right font-mono text-[9px] text-[#8c8276]/30 select-none hidden sm:block leading-relaxed uppercase">
                            <div>Vianaar Drawing Registry</div>
                            <div>Sheet Ref: ME{floorPlanEstateId === 'a' ? '1' : '2'} - FP - {floorPlanVilla}</div>
                            <div>Scale: 1:120 Structural</div>
                          </div>

                          {/* Center Content */}
                          <Building2 className="w-12 h-12 text-[#1c3c31]/10 mb-4 animate-pulse shrink-0" />
                          <div className="text-[10px] tracking-[4px] uppercase text-[#ebdcd0] bg-[#1c3c31] px-3.5 py-1.5 mb-3 font-medium select-none shadow-sm">
                            Blueprint Under Preparation
                          </div>
                          
                          <h4 className="font-serif text-xl tracking-wide font-normal text-[#1c3c31] mb-2 px-4 max-w-sm">
                            {bhkConfig} Floor Layout
                          </h4>
                          
                          <p className="text-[#8c8276] text-[11px] leading-relaxed max-w-sm mb-4 font-light select-none font-sans px-4">
                            The visual floor plan asset with detailed partitions and layout is currently loading or being synchronized for publication. Current target asset lookup:
                          </p>

                          <code className="text-stone-700 bg-stone-100 font-mono text-[10px] px-3.5 py-1.5 rounded border border-stone-200 max-w-md select-all">
                            /assets/floorplans/{fileBaseName}.jpg
                          </code>

                          <p className="text-[9.5px] italic text-[#8c8276]/85 mt-3 select-none font-sans font-light">
                            Tip: Once you upload a JPEG with this name to the folder, it shows up here.
                          </p>
                        </div>
                      ) : (
                        /* Normal image display */
                        <img
                          src={imageUrl}
                          alt={`${formattedVillaName} ${floorLevel === 'GF' ? 'Ground' : 'First'} Floor`}
                          className="max-w-[90%] max-h-[90%] object-contain pointer-events-none select-none transition-all duration-300"
                          onLoad={() => setFloorPlanLoadState('loaded')}
                          onError={() => setFloorPlanLoadState('failed')}
                        />
                      )}
                    </div>

                    {/* Loading Indicator Spinner Overlay */}
                    {floorPlanLoadState === 'loading' && (
                      <div className="absolute inset-0 bg-[#FAF8F5]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 select-none">
                        <div className="w-10 h-10 border-2 border-[#1c3c31]/10 border-t-[#1c3c31] rounded-full animate-spin mb-3" />
                        <span className="text-[10px] tracking-[2px] uppercase text-[#1c3c31]/80 font-light font-sans select-none">
                          Loading Layout Asset...
                        </span>
                      </div>
                    )}

                    {/* Floating Zoom Controls Bottom Right (Exactly matching Mockup!) */}
                    <div className="absolute bottom-5 right-5 flex flex-col gap-1 shadow-xl z-20 select-none">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFloorPlanZoom(prev => Math.min(3.5, prev + 0.15));
                        }}
                        className="w-9 h-9 bg-neutral-900 border-none text-white hover:bg-neutral-800 flex items-center justify-center focus:outline-none transition-all rounded-t select-none cursor-pointer active:scale-95 text-base font-bold"
                        title="Zoom In"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFloorPlanZoom(prev => Math.max(0.5, prev - 0.15));
                        }}
                        className="w-9 h-9 bg-neutral-900 border-none text-white hover:bg-neutral-800 flex items-center justify-center focus:outline-none transition-all select-none cursor-pointer active:scale-95 text-base font-bold"
                        title="Zoom Out"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFloorPlanZoom(1.0);
                          setFloorPlanPan({ x: 0, y: 0 });
                        }}
                        className="w-9 h-9 bg-neutral-900 border-none text-white hover:bg-neutral-800 flex items-center justify-center focus:outline-none transition-all rounded-b select-none cursor-pointer active:scale-95 text-xs font-light animate-none"
                        title="Reset View"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#ebdcd0]" />
                      </button>
                    </div>

                    {/* Mockup Watermark Floor Details on Bottom-Right of the Image Box */}
                    {floorPlanLoadState === 'loaded' && (
                      <div className="absolute bottom-5 left-5 bg-white/80 border border-[#ebdcd0]/45 px-3.5 py-2 z-10 backdrop-blur-sm flex flex-col pointer-events-none select-none">
                        <div className="text-[12px] font-sans font-light tracking-[2px] uppercase text-[#1c3c31] leading-none mb-0.5">
                          {formattedVillaName}
                        </div>
                        <div className="text-[9px] font-sans font-light text-[#8c8276] uppercase tracking-[1px] leading-none">
                          {floorLevel === 'GF' ? 'Ground Floor' : 'First Floor'} Plan
                        </div>
                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
