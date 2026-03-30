"use client";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream min-h-screen flex items-center">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8 flex flex-col lg:flex-row items-center gap-12">
        {/* Left content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-forest leading-tight tracking-tight">
            Find trusted local helpers on the map near you
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0">
            Electricians, cleaners, nail techs, handymen — real people in your
            neighborhood.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full bg-forest px-8 py-4 text-white font-semibold text-lg hover:bg-forest-dark transition-colors shadow-lg"
            >
              <svg
                className="w-6 h-6 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              Download on Google Play
            </a>
            <a
              href="#for-helpers"
              className="inline-flex items-center justify-center rounded-full border-2 border-forest px-8 py-4 text-forest font-semibold text-lg hover:bg-forest hover:text-white transition-colors"
            >
              Become a helper
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-500 flex items-center justify-center lg:justify-start gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Background checks
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Licensed pros
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-4 h-4 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Real reviews only
            </span>
          </p>
        </div>

        {/* Right: SVG Map */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
          <svg
            viewBox="0 0 500 400"
            className="w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Map background */}
            <rect width="500" height="400" rx="20" fill="#E8E7E0" />

            {/* Roads */}
            <path d="M0 200 L500 200" stroke="#d4d3cc" strokeWidth="3" />
            <path d="M250 0 L250 400" stroke="#d4d3cc" strokeWidth="3" />
            <path d="M0 100 L500 100" stroke="#d4d3cc" strokeWidth="2" opacity="0.5" />
            <path d="M0 300 L500 300" stroke="#d4d3cc" strokeWidth="2" opacity="0.5" />
            <path d="M125 0 L125 400" stroke="#d4d3cc" strokeWidth="2" opacity="0.5" />
            <path d="M375 0 L375 400" stroke="#d4d3cc" strokeWidth="2" opacity="0.5" />

            {/* Green areas (parks) */}
            <rect x="50" y="50" width="60" height="40" rx="8" fill="#1B6B45" opacity="0.2" />
            <rect x="300" y="250" width="80" height="50" rx="8" fill="#1B6B45" opacity="0.2" />
            <rect x="380" y="80" width="50" height="60" rx="8" fill="#1B6B45" opacity="0.2" />

            {/* Buildings */}
            <rect x="140" y="120" width="30" height="25" rx="4" fill="#c8c7c0" />
            <rect x="200" y="50" width="35" height="30" rx="4" fill="#c8c7c0" />
            <rect x="340" y="160" width="40" height="25" rx="4" fill="#c8c7c0" />
            <rect x="70" y="260" width="30" height="30" rx="4" fill="#c8c7c0" />
            <rect x="420" y="300" width="35" height="25" rx="4" fill="#c8c7c0" />

            {/* Map pins with pulse animation */}
            <g className="animate-bounce" style={{ animationDelay: "0s", animationDuration: "2s" }}>
              <circle cx="120" cy="150" r="18" fill="#1B6B45" opacity="0.2" />
              <circle cx="120" cy="150" r="10" fill="#1B6B45" />
              <text x="120" y="154" textAnchor="middle" fill="white" fontSize="12">🧹</text>
            </g>

            <g className="animate-bounce" style={{ animationDelay: "0.3s", animationDuration: "2.2s" }}>
              <circle cx="300" cy="120" r="18" fill="#1B6B45" opacity="0.2" />
              <circle cx="300" cy="120" r="10" fill="#1B6B45" />
              <text x="300" y="124" textAnchor="middle" fill="white" fontSize="12">🔧</text>
            </g>

            <g className="animate-bounce" style={{ animationDelay: "0.6s", animationDuration: "1.8s" }}>
              <circle cx="200" cy="280" r="18" fill="#1B6B45" opacity="0.2" />
              <circle cx="200" cy="280" r="10" fill="#1B6B45" />
              <text x="200" y="284" textAnchor="middle" fill="white" fontSize="12">🌿</text>
            </g>

            <g className="animate-bounce" style={{ animationDelay: "0.9s", animationDuration: "2.4s" }}>
              <circle cx="400" cy="220" r="18" fill="#1B6B45" opacity="0.2" />
              <circle cx="400" cy="220" r="10" fill="#1B6B45" />
              <text x="400" y="224" textAnchor="middle" fill="white" fontSize="12">💅</text>
            </g>

            <g className="animate-bounce" style={{ animationDelay: "1.2s", animationDuration: "2s" }}>
              <circle cx="80" cy="340" r="18" fill="#1B6B45" opacity="0.2" />
              <circle cx="80" cy="340" r="10" fill="#1B6B45" />
              <text x="80" y="344" textAnchor="middle" fill="white" fontSize="12">🚚</text>
            </g>

            {/* "You are here" pin */}
            <circle cx="250" cy="200" r="24" fill="#1B6B45" opacity="0.15">
              <animate attributeName="r" values="24;32;24" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="250" cy="200" r="12" fill="#1B6B45" stroke="white" strokeWidth="3" />
            <circle cx="250" cy="200" r="4" fill="white" />
          </svg>
        </div>
      </div>
    </section>
  );
}
