/**
 * Utility to generate premium, high-fidelity architectural master plan SVGs
 * for Morjim Estate Phase 1 and Phase 2.
 * Serves as beautiful, realistic, out-of-the-box site maps that blend
 * elegantly on top of Google Satellite and street maps.
 */

export function getGeneratedSitePlanSVG(id: 'a' | 'b'): string {
  if (id === 'a') {
    // Phase 1 - 14 Exclusive Residences, 4 & 5 BHK Private Pools, Club House
    const plots = Array.from({ length: 14 }, (_, i) => {
      const idx = i + 1;
      // Grid positioning for 14 plots (2 columns, 7 rows)
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? 80 : 450;
      const y = 140 + row * 82;
      const w = 270;
      const h = 72;

      return `
        <!-- Plot ${idx} Container -->
        <g id="plot-${idx}" class="plot" transform="translate(${x}, ${y})">
          <!-- Plot boundary -->
          <rect width="${w}" height="${h}" rx="6" fill="#f4fbf8" fill-opacity="0.82" stroke="#00aa76" stroke-width="1.5" />
          
          <!-- Villa Footprint -->
          <rect x="15" y="12" width="110" height="48" rx="3" fill="#e2ede8" stroke="#008e62" stroke-width="1" />
          <line x1="15" y1="28" x2="125" y2="28" stroke="#008e62" stroke-width="0.5" stroke-dasharray="3 2" />
          <text x="70" y="41" font-family="'Mulish', sans-serif" font-size="9" font-weight="600" fill="#006b4a" text-anchor="middle">VILLA ${String(idx).padStart(2, '0')}</text>
          
          <!-- Private Swimming Pool symbol -->
          <rect x="140" y="16" width="55" height="38" rx="2" fill="#d2f1ff" stroke="#0099cc" stroke-width="1" />
          <!-- Water waves decoration inside pool -->
          <path d="M 145,28 Q 150,26 155,28 T 165,28 T 175,28 T 185,28" fill="none" stroke="#22b1e6" stroke-width="0.75" />
          <path d="M 145,38 Q 150,36 155,38 T 165,38 T 175,38 T 185,38" fill="none" stroke="#22b1e6" stroke-width="0.75" opacity="0.6" />
          <text x="167" y="23" font-family="'Mulish', sans-serif" font-size="6" font-weight="700" fill="#0077aa" text-anchor="middle" opacity="0.8">POOL</text>
          
          <!-- Garden / Landscaping outline -->
          <rect x="210" y="12" width="45" height="48" rx="3" fill="none" stroke="#66bb6a" stroke-width="0.75" stroke-dasharray="2 2" />
          <!-- Small tree icons -->
          <circle cx="222" cy="26" r="5" fill="#a5d6a7" fill-opacity="0.7" stroke="#4caf50" stroke-width="0.5" />
          <circle cx="242" cy="42" r="6" fill="#a5d6a7" fill-opacity="0.7" stroke="#4caf50" stroke-width="0.5" />
          <circle cx="225" cy="45" r="4" fill="#a5d6a7" fill-opacity="0.7" stroke="#4caf50" stroke-width="0.5" />
          <text x="232" y="18" font-family="'Mulish', sans-serif" font-size="5" font-weight="600" fill="#2e7d32" text-anchor="middle">LAWN</text>
        </g>
      `;
    }).join('\n');

    const svg = `
      <svg id="vianaar-me1-plan" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <!-- Site Boundaries and background shading -->
        <rect width="800" height="800" rx="12" fill="#faf8f4" fill-opacity="0.93" stroke="#008e62" stroke-width="3" />
        
        <!-- Blueprint Grid Pattern -->
        <g stroke="#008e62" stroke-width="0.2" opacity="0.15">
          <line x1="0" y1="100" x2="800" y2="100" />
          <line x1="0" y1="200" x2="800" y2="200" />
          <line x1="0" y1="300" x2="800" y2="300" />
          <line x1="0" y1="400" x2="800" y2="400" />
          <line x1="0" y1="500" x2="800" y2="500" />
          <line x1="0" y1="600" x2="800" y2="600" />
          <line x1="0" y1="700" x2="800" y2="700" />
          <line x1="100" y1="0" x2="100" y2="800" />
          <line x1="200" y1="0" x2="200" y2="800" />
          <line x1="350" y1="0" x2="350" y2="800" />
          <line x1="450" y1="0" x2="450" y2="800" />
          <line x1="550" y1="0" x2="550" y2="800" />
          <line x1="680" y1="0" x2="680" y2="800" />
        </g>

        <!-- Title Block Header -->
        <g transform="translate(40, 20)">
          <!-- Sub-header frame -->
          <rect width="720" height="76" rx="4" fill="none" stroke="#008e62" stroke-width="1.2" opacity="0.6" />
          <text x="360" y="30" font-family="'Cardo', serif" font-size="18" font-weight="700" fill="#008e62" letter-spacing="4" text-anchor="middle">VIANAAR • MORJIM ESTATE I</text>
          <text x="360" y="52" font-family="'Mulish', sans-serif" font-size="9" font-weight="600" fill="#5a5a5a" letter-spacing="2" text-anchor="middle">SITE PLAN ALIGNMENT OVERLAY — 14 EXCLUSIVE LUXURY VILLAS</text>
          <line x1="300" y1="38" x2="420" y2="38" stroke="#008e62" stroke-width="1" />
        </g>

        <!-- Central Pathway / Main Driveway -->
        <g id="main-road">
          <!-- Pathway boundaries -->
          <rect x="360" y="110" width="80" height="650" fill="#ede9e2" stroke="#d5cebe" stroke-width="1.5" />
          <!-- Center line divider -->
          <line x1="400" y1="120" x2="400" y2="750" stroke="#a59e8f" stroke-width="1.2" stroke-dasharray="14 8" />
          <text x="400" y="440" font-family="'Mulish', sans-serif" font-size="9" font-weight="700" fill="#756f61" letter-spacing="3" text-anchor="middle" transform="rotate(-90, 400, 440)">MAIN ESTATE BOULEVARD</text>
        </g>

        <!-- Render plot subdivisions -->
        ${plots}

        <!-- Community Clubhouse & Common Pool (Top layout edge) -->
        <g id="clubhouse" transform="translate(80, 110)">
          <rect width="270" height="20" rx="3" fill="#e8f8f2" stroke="#00aa76" stroke-width="1" />
          <text x="135" y="13" font-family="'Mulish', sans-serif" font-size="8" font-weight="700" fill="#006b4a" text-anchor="middle" letter-spacing="1">COMMON RECREATION &amp; GARDEN WALKWAY</text>
        </g>
        <g id="clubhouse2" transform="translate(450, 110)">
          <rect width="270" height="20" rx="3" fill="#e8f8f2" stroke="#00aa76" stroke-width="1" />
          <text x="135" y="13" font-family="'Mulish', sans-serif" font-size="8" font-weight="700" fill="#006b4a" text-anchor="middle" letter-spacing="1">COMMUNITY CLUBHOUSE &amp; CAFE DECK</text>
        </g>

        <!-- Beautiful Compass Rose & Scale bottom details -->
        <g transform="translate(400, 755)" font-family="'Mulish', sans-serif" fill="#6a6a6a" font-size="8">
          <circle cx="0" cy="15" r="12" fill="none" stroke="#00aa76" stroke-width="1" opacity="0.6"/>
          <!-- Compass Arrow -->
          <path d="M 0,2 L 4,15 L -4,15 Z" fill="#008e62" />
          <path d="M 0,28 L 4,15 L -4,15 Z" fill="#888" opacity="0.5" />
          <text x="0" y="-1" font-size="7" font-weight="800" fill="#008e62" text-anchor="middle">N</text>
          
          <text x="-310" y="18" text-anchor="start">ARCHITECTURAL REFERENCE DRAWING | PRE-APPROVED</text>
          <text x="310" y="18" text-anchor="end">SCALE: 1" = 30'-0" | CO-ALIGNED VIA GEO-ANCHORS</text>
        </g>
      </svg>
    `;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
  } else {
    // Phase 2 - 8 Private Sanctuaries, 5 BHK Forest Views
    const plots = Array.from({ length: 8 }, (_, i) => {
      const idx = i + 1;
      // Grid positioning for 8 plots (2 columns, 4 rows)
      const col = i % 2;
      const row = Math.floor(i / 4);
      const x = col === 0 ? 80 : 450;
      const y = 180 + row * 190;
      const w = 270;
      const h = 150;

      return `
        <!-- Plot ${idx} Container -->
        <g id="phase2-plot-${idx}" transform="translate(${x}, ${y})">
          <!-- Plot boundary curves and layout -->
          <rect width="${w}" height="${h}" rx="10" fill="#fbfaf4" fill-opacity="0.85" stroke="#b08316" stroke-width="1.5" />
          
          <!-- Master Forest Villa Footprint -->
          <rect x="20" y="20" width="130" height="110" rx="4" fill="#f4efe2" stroke="#906505" stroke-width="1.2" />
          <text x="85" y="55" font-family="'Mulish', sans-serif" font-size="11" font-weight="700" fill="#704e03" text-anchor="middle">FOREST SANCTUARY</text>
          <text x="85" y="72" font-family="'Mulish', sans-serif" font-size="9" font-weight="600" fill="#906505" text-anchor="middle">VILLA 2B_${String(idx).padStart(2, '0')}</text>
          <text x="85" y="86" font-family="'Mulish', sans-serif" font-size="7" font-weight="500" fill="#a07a20" text-anchor="middle">5 BHK • TRIPLE ASPECT DECK</text>
          
          <!-- Lagoon style swimming pool with rounded custom corners -->
          <rect x="165" y="30" width="85" height="90" rx="14" fill="#e3f8ff" stroke="#00a0dc" stroke-width="1.2" />
          <path d="M 175,60 Q 185,55 195,60 T 215,60 T 235,60" fill="none" stroke="#2bbbff" stroke-width="1" />
          <path d="M 175,85 Q 185,80 195,85 T 215,85 T 235,85" fill="none" stroke="#2bbbff" stroke-width="1" opacity="0.6"/>
          <text x="207" y="47" font-family="'Mulish', sans-serif" font-size="7" font-weight="700" fill="#0072a0" text-anchor="middle">LAGOON POOL</text>
          
          <!-- Botanical elements around villa -->
          <circle cx="15" cy="135" r="5" fill="#aed581" fill-opacity="0.75" stroke="#7cb342" stroke-width="0.5" />
          <circle cx="255" cy="135" r="5" fill="#aed581" fill-opacity="0.75" stroke="#7cb342" stroke-width="0.5" />
          <circle cx="255" cy="15" r="5" fill="#aed581" fill-opacity="0.75" stroke="#7cb342" stroke-width="0.5" />
        </g>
      `;
    }).join('\n');

    const svg = `
      <svg id="vianaar-me2-plan" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
        <!-- Site Boundaries and background shading -->
        <rect width="800" height="800" rx="12" fill="#faf9f5" fill-opacity="0.94" stroke="#c8860a" stroke-width="3" />
        
        <!-- Blueprint Grid Pattern in Soft Gold -->
        <g stroke="#c8860a" stroke-width="0.2" opacity="0.15">
          <line x1="0" y1="100" x2="800" y2="100" />
          <line x1="0" y1="200" x2="800" y2="200" />
          <line x1="0" y1="300" x2="800" y2="300" />
          <line x1="0" y1="400" x2="800" y2="400" />
          <line x1="0" y1="500" x2="800" y2="500" />
          <line x1="0" y1="600" x2="800" y2="600" />
          <line x1="0" y1="700" x2="800" y2="700" />
          <line x1="100" y1="0" x2="100" y2="800" />
          <line x1="200" y1="0" x2="200" y2="800" />
          <line x1="350" y1="0" x2="350" y2="800" />
          <line x1="450" y1="0" x2="450" y2="800" />
          <line x1="550" y1="0" x2="550" y2="800" />
          <line x1="680" y1="0" x2="680" y2="800" />
        </g>

        <!-- Title Block Header -->
        <g transform="translate(40, 20)">
          <rect width="720" height="76" rx="4" fill="none" stroke="#c8860a" stroke-width="1.2" opacity="0.6" stroke-dasharray="4 2" />
          <text x="360" y="30" font-family="'Cardo', serif" font-size="18" font-weight="700" fill="#906505" letter-spacing="4" text-anchor="middle">VIANAAR • MORJIM ESTATE II</text>
          <text x="360" y="52" font-family="'Mulish', sans-serif" font-size="9" font-weight="600" fill="#5a5a5a" letter-spacing="2" text-anchor="middle">BOUTIQUE FOREST SANCTUARIES SITE PLAN — 8 ESTATES</text>
          <line x1="300" y1="38" x2="420" y2="38" stroke="#c8860a" stroke-width="1" />
        </g>

        <!-- Morjim Forest Walk Winding Path -->
        <g id="pathway-forest">
          <path d="M 400,120 C 420,250 380,380 430,500 C 410,610 390,680 400,750" fill="none" stroke="#ded5c5" stroke-width="24" stroke-linecap="round" />
          <path d="M 400,120 C 420,250 380,380 430,500 C 410,610 390,680 400,750" fill="none" stroke="#9a8e78" stroke-dasharray="8 8" stroke-width="1" />
          <text x="380" y="320" font-family="'Mulish', sans-serif" font-size="8" font-weight="700" fill="#756545" letter-spacing="2" transform="rotate(78, 380, 320)">NATURAL CANOPY TRAIL</text>
        </g>

        <!-- Canopy Symbolism Background Trees (Dense Forest Aesthetic) -->
        <g opacity="0.12" fill="#7cb342" stroke="#558b2f" stroke-width="1">
          <circle cx="100" cy="140" r="30" />
          <circle cx="130" cy="150" r="24" />
          <circle cx="330" cy="530" r="35" />
          <circle cx="490" cy="490" r="32" />
          <circle cx="700" cy="350" r="40" />
          <circle cx="730" cy="680" r="38" />
          <circle cx="90" cy="710" r="42" />
        </g>

        <!-- Plots subdivisions -->
        ${plots}

        <!-- Stream of Morjim Springs along the top portion -->
        <path d="M 0,110 Q 200,90 400,105 T 800,100" fill="none" stroke="#b2ebf2" stroke-width="12" opacity="0.6"/>
        <path d="M 0,110 Q 200,90 400,105 T 800,100" fill="none" stroke="#4dd0e1" stroke-width="1.5" opacity="0.8" stroke-dasharray="15 6"/>
        <text x="160" y="114" font-family="'Mulish', sans-serif" font-size="7" font-weight="600" fill="#00838f" letter-spacing="1">NATURAL RIPARIAN BUFFER CORRIDOR</text>

        <!-- Beautiful Compass Rose & Scale bottom details -->
        <g transform="translate(400, 755)" font-family="'Mulish', sans-serif" fill="#6a6a6a" font-size="8">
          <circle cx="0" cy="15" r="12" fill="none" stroke="#c8860a" stroke-width="1" opacity="0.6"/>
          <!-- Compass Arrow -->
          <path d="M 0,2 L 4,15 L -4,15 Z" fill="#c8860a" />
          <path d="M 0,28 L 4,15 L -4,15 Z" fill="#888" opacity="0.5" />
          <text x="0" y="-1" font-size="7" font-weight="800" fill="#a07a16" text-anchor="middle">N</text>
          
          <text x="-310" y="18" text-anchor="start">ARCHITECTURAL SCHEMATIC DRAWING | PRE-LAUNCH STAGE</text>
          <text x="310" y="18" text-anchor="end">SCALE: 1" = 40'-0" | CO-ALIGNED VIA GEO-ANCHORS</text>
        </g>
      </svg>
    `;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
  }
}
