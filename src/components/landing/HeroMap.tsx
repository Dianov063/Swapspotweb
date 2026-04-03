export default function HeroMap() {
  return (
    <svg
      viewBox="0 0 600 480"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Pin gradient */}
        <linearGradient id="pinGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A8A5A" />
          <stop offset="100%" stopColor="#1B6B45" />
        </linearGradient>

        {/* Pin drop shadow */}
        <filter id="pinShadow" x="-30%" y="-10%" width="160%" height="160%">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
        </filter>

        {/* Soft shadow for cards/labels */}
        <filter id="labelShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.12" />
        </filter>

        {/* Clip to rounded rectangle */}
        <clipPath id="mapClip">
          <rect width="600" height="480" rx="20" />
        </clipPath>

        {/* Pin teardrop shape: center at 0,0, point at bottom */}
        <symbol id="pinShape" viewBox="-14 -32 28 40" overflow="visible">
          <path
            d="M0,-28 C-7.7,-28 -14,-21.7 -14,-14 C-14,-6.3 0,4 0,4 C0,4 14,-6.3 14,-14 C14,-21.7 7.7,-28 0,-28 Z"
            fill="url(#pinGrad)"
            stroke="#145534"
            strokeWidth="0.5"
          />
          <circle cx="0" cy="-14" r="9" fill="white" opacity="0.95" />
        </symbol>
      </defs>

      <g clipPath="url(#mapClip)">
        {/* === Layer 1: Background === */}
        <rect width="600" height="480" fill="#F0EDE8" />

        {/* === Layer 2: Water (river) === */}
        <path
          d="M-10,380 Q80,360 120,340 Q180,310 200,270 Q220,230 190,200 Q160,170 170,130 Q180,90 220,60 Q260,30 300,-10"
          fill="none"
          stroke="#AADAFF"
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M-10,380 Q80,360 120,340 Q180,310 200,270 Q220,230 190,200 Q160,170 170,130 Q180,90 220,60 Q260,30 300,-10"
          fill="none"
          stroke="#89C4E8"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.4"
        />

        {/* === Layer 3: Roads === */}
        {/* Highway (top) */}
        <path d="M-10,65 Q150,55 300,70 Q450,85 610,60" stroke="#FFF5CC" strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M-10,65 Q150,55 300,70 Q450,85 610,60" stroke="#E8DFB0" strokeWidth="10" strokeLinecap="round" fill="none" strokeDasharray="0.5 9.5" />

        {/* Major road 1 (horizontal, through center) */}
        <path d="M-10,240 Q100,235 200,245 Q350,260 450,240 Q530,225 610,235" stroke="#D6D5CE" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M-10,240 Q100,235 200,245 Q350,260 450,240 Q530,225 610,235" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Major road 2 (vertical) */}
        <path d="M380,-10 Q375,80 385,160 Q395,260 380,340 Q370,420 375,490" stroke="#D6D5CE" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M380,-10 Q375,80 385,160 Q395,260 380,340 Q370,420 375,490" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />

        {/* Minor roads */}
        <path d="M-10,150 Q120,145 250,155 Q320,160 380,155" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M380,155 Q440,150 520,160 Q570,165 610,158" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M-10,360 Q80,355 180,365 Q280,375 380,360" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M380,360 Q450,350 530,365 Q580,370 610,362" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M130,-10 Q135,70 128,150 Q120,230 130,310 Q140,390 135,490" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M520,-10 Q515,100 525,200 Q530,300 520,400 Q515,440 520,490" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Small connecting roads */}
        <path d="M130,150 Q180,148 230,155" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M250,245 Q255,290 260,340" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M450,240 Q455,200 460,155" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
        <path d="M450,240 Q458,290 460,360" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />

        {/* === Layer 4: Parks === */}
        <path d="M395,100 Q430,90 470,100 Q490,120 480,150 Q460,165 430,160 Q400,155 390,135 Q385,115 395,100 Z" fill="#C8E6C0" />
        <path d="M60,260 Q100,250 140,265 Q150,290 130,310 Q100,320 70,310 Q50,295 55,275 Z" fill="#C8E6C0" />
        <path d="M480,330 Q510,320 545,330 Q560,350 550,375 Q530,390 500,385 Q475,370 475,350 Z" fill="#C8E6C0" />
        {/* Small park patches */}
        <ellipse cx="300" cy="310" rx="18" ry="14" fill="#C8E6C0" opacity="0.7" />
        <ellipse cx="160" cy="200" rx="12" ry="10" fill="#C8E6C0" opacity="0.5" />

        {/* === Layer 4b: Buildings === */}
        {/* Cluster 1: top-left residential */}
        <rect x="55" y="100" width="18" height="14" rx="2" fill="#E2E0D8" />
        <rect x="77" y="98" width="14" height="18" rx="2" fill="#E2E0D8" />
        <rect x="95" y="102" width="20" height="12" rx="2" fill="#E2E0D8" />
        <rect x="60" y="118" width="22" height="10" rx="2" fill="#E2E0D8" />
        <rect x="86" y="120" width="16" height="12" rx="2" fill="#E2E0D8" />

        {/* Cluster 2: center area */}
        <rect x="270" y="170" width="24" height="16" rx="2" fill="#E2E0D8" />
        <rect x="298" y="168" width="16" height="20" rx="2" fill="#E2E0D8" />
        <rect x="318" y="172" width="20" height="14" rx="2" fill="#E2E0D8" />
        <rect x="275" y="190" width="18" height="12" rx="2" fill="#E2E0D8" />
        <rect x="297" y="192" width="22" height="10" rx="2" fill="#E2E0D8" />

        {/* Cluster 3: right side */}
        <rect x="430" y="180" width="20" height="16" rx="2" fill="#E2E0D8" />
        <rect x="454" y="178" width="16" height="20" rx="2" fill="#E2E0D8" />
        <rect x="474" y="182" width="14" height="14" rx="2" fill="#E2E0D8" />
        <rect x="435" y="200" width="24" height="10" rx="2" fill="#E2E0D8" />
        <rect x="463" y="202" width="18" height="12" rx="2" fill="#E2E0D8" />

        {/* Cluster 4: bottom center-right */}
        <rect x="400" y="275" width="22" height="14" rx="2" fill="#E2E0D8" />
        <rect x="426" y="273" width="14" height="18" rx="2" fill="#E2E0D8" />
        <rect x="404" y="293" width="18" height="10" rx="2" fill="#E2E0D8" />
        <rect x="426" y="295" width="20" height="12" rx="2" fill="#E2E0D8" />

        {/* Cluster 5: bottom-left */}
        <rect x="60" y="375" width="18" height="14" rx="2" fill="#E2E0D8" />
        <rect x="82" y="373" width="14" height="18" rx="2" fill="#E2E0D8" />
        <rect x="65" y="393" width="20" height="12" rx="2" fill="#E2E0D8" />

        {/* Scattered individual buildings */}
        <rect x="330" y="380" width="16" height="12" rx="2" fill="#E2E0D8" />
        <rect x="555" y="130" width="18" height="14" rx="2" fill="#E2E0D8" />
        <rect x="555" y="260" width="14" height="16" rx="2" fill="#E2E0D8" />

        {/* === Layer 5: Labels === */}
        {/* Street names */}
        <text x="70" y="233" fill="#8C8C8C" fontSize="7" fontFamily="sans-serif" letterSpacing="1.5" opacity="0.8">
          MAIN ST
        </text>
        <text x="430" y="233" fill="#8C8C8C" fontSize="7" fontFamily="sans-serif" letterSpacing="1.5" opacity="0.8">
          MAIN ST
        </text>
        <text x="387" y="130" fill="#8C8C8C" fontSize="7" fontFamily="sans-serif" letterSpacing="1.5" opacity="0.8"
          transform="rotate(90, 387, 130)">
          OAK AVE
        </text>
        <text x="137" y="210" fill="#8C8C8C" fontSize="7" fontFamily="sans-serif" letterSpacing="1.5" opacity="0.8"
          transform="rotate(90, 137, 210)">
          ELM ST
        </text>
        <text x="440" y="57" fill="#8C8C8C" fontSize="6" fontFamily="sans-serif" letterSpacing="1" opacity="0.6">
          HWY 12
        </text>
        <text x="455" y="148" fill="#8C8C8C" fontSize="6" fontFamily="sans-serif" letterSpacing="1" opacity="0.7">
          MAPLE DR
        </text>
        <text x="280" y="355" fill="#8C8C8C" fontSize="6" fontFamily="sans-serif" letterSpacing="1" opacity="0.7">
          PINE RD
        </text>

        {/* Neighborhood labels */}
        <text x="300" y="215" fill="#A0A0A0" fontSize="11" fontFamily="sans-serif" letterSpacing="3" opacity="0.5" textAnchor="middle">
          MIDTOWN
        </text>
        <text x="480" y="310" fill="#A0A0A0" fontSize="8" fontFamily="sans-serif" letterSpacing="2" opacity="0.4" textAnchor="middle">
          RIVERSIDE
        </text>

        {/* Compass rose */}
        <g transform="translate(560, 35)">
          <circle cx="0" cy="0" r="14" fill="white" opacity="0.8" />
          <line x1="0" y1="-10" x2="0" y2="8" stroke="#8C8C8C" strokeWidth="1" />
          <line x1="-8" y1="0" x2="8" y2="0" stroke="#8C8C8C" strokeWidth="0.5" opacity="0.5" />
          <polygon points="0,-11 -3,-5 3,-5" fill="#D04040" />
          <text x="0" y="-14" textAnchor="middle" fill="#8C8C8C" fontSize="7" fontWeight="bold" fontFamily="sans-serif">N</text>
        </g>

        {/* === Layer 6: "You are here" blue dot === */}
        <circle cx="305" cy="250" r="28" fill="#4285F4" opacity="0.12">
          <animate attributeName="r" values="28;40;28" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.12;0.03;0.12" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="305" cy="250" r="10" fill="#4285F4" stroke="white" strokeWidth="3" />
        <circle cx="305" cy="250" r="3.5" fill="white" />

        {/* === Layer 7: Helper Pins === */}
        {/* Pin 1: Cleaning — near residential cluster top-left */}
        <g className="pin-animate" style={{ animationDelay: "0s" }} filter="url(#pinShadow)">
          <use href="#pinShape" x="90" y="90" width="28" height="40" />
          <text x="90" y="78" textAnchor="middle" fontSize="13">🧹</text>
          <g filter="url(#labelShadow)">
            <rect x="64" y="100" width="52" height="16" rx="8" fill="white" opacity="0.92" />
            <text x="90" y="112" textAnchor="middle" fill="#374151" fontSize="7" fontFamily="sans-serif" fontWeight="600">Cleaning</text>
          </g>
        </g>

        {/* Pin 2: Handyman — center-right near buildings */}
        <g className="pin-animate" style={{ animationDelay: "0.2s" }} filter="url(#pinShadow)">
          <use href="#pinShape" x="460" y="190" width="28" height="40" />
          <text x="460" y="178" textAnchor="middle" fontSize="13">🔧</text>
          <g filter="url(#labelShadow)">
            <rect x="428" y="200" width="64" height="16" rx="8" fill="white" opacity="0.92" />
            <text x="460" y="212" textAnchor="middle" fill="#374151" fontSize="7" fontFamily="sans-serif" fontWeight="600">Handyman</text>
          </g>
        </g>

        {/* Pin 3: Lawn — near park bottom-left */}
        <g className="pin-animate" style={{ animationDelay: "0.4s" }} filter="url(#pinShadow)">
          <use href="#pinShape" x="110" y="285" width="28" height="40" />
          <text x="110" y="273" textAnchor="middle" fontSize="13">🌿</text>
          <g filter="url(#labelShadow)">
            <rect x="87" y="295" width="46" height="16" rx="8" fill="white" opacity="0.92" />
            <text x="110" y="307" textAnchor="middle" fill="#374151" fontSize="7" fontFamily="sans-serif" fontWeight="600">Lawn</text>
          </g>
        </g>

        {/* Pin 4: Beauty — along main road right */}
        <g className="pin-animate" style={{ animationDelay: "0.6s" }} filter="url(#pinShadow)">
          <use href="#pinShape" x="490" y="115" width="28" height="40" />
          <text x="490" y="103" textAnchor="middle" fontSize="13">💅</text>
          <g filter="url(#labelShadow)">
            <rect x="466" y="125" width="48" height="16" rx="8" fill="white" opacity="0.92" />
            <text x="490" y="137" textAnchor="middle" fill="#374151" fontSize="7" fontFamily="sans-serif" fontWeight="600">Beauty</text>
          </g>
        </g>

        {/* Pin 5: Moving — near highway */}
        <g className="pin-animate" style={{ animationDelay: "0.8s" }} filter="url(#pinShadow)">
          <use href="#pinShape" x="340" y="390" width="28" height="40" />
          <text x="340" y="378" textAnchor="middle" fontSize="13">🚚</text>
          <g filter="url(#labelShadow)">
            <rect x="314" y="400" width="52" height="16" rx="8" fill="white" opacity="0.92" />
            <text x="340" y="412" textAnchor="middle" fill="#374151" fontSize="7" fontFamily="sans-serif" fontWeight="600">Moving</text>
          </g>
        </g>

        {/* Inner edge vignette for depth */}
        <rect width="600" height="480" rx="20" fill="none" stroke="#00000008" strokeWidth="20" />
      </g>
    </svg>
  );
}
