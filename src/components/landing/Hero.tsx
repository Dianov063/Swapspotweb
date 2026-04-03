"use client";

import HeroMap from "./HeroMap";

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

        {/* Right: Google Maps-style SVG Map */}
        <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
          <HeroMap />
        </div>
      </div>
    </section>
  );
}
