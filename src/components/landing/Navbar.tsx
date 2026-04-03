"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-forest/10">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg
            width="36"
            height="36"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            {/* Circle background */}
            <circle cx="20" cy="20" r="20" fill="#1B6B45" />
            {/* Map pin teardrop */}
            <path
              d="M20,8 C15.2,8 11.5,11.7 11.5,16.5 C11.5,22.5 20,32 20,32 C20,32 28.5,22.5 28.5,16.5 C28.5,11.7 24.8,8 20,8 Z"
              fill="white"
            />
            {/* Inner dot */}
            <circle cx="20" cy="16.5" r="4" fill="#1B6B45" />
            {/* Small swap arrows inside dot */}
            <path
              d="M18.2,15.5 L21,15.5 M21,15.5 L19.8,14.3 M18.2,17.5 L21,17.5 M18.2,17.5 L19.4,18.7"
              stroke="white"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xl font-bold text-forest tracking-tight group-hover:opacity-80 transition-opacity">
            SwapSpot
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-forest transition-colors">
            How it works
          </a>
          <a href="#categories" className="text-sm font-medium text-gray-600 hover:text-forest transition-colors">
            Services
          </a>
          <a href="#for-helpers" className="text-sm font-medium text-gray-600 hover:text-forest transition-colors">
            For helpers
          </a>
          <a
            href="#"
            className="inline-flex items-center rounded-full bg-forest px-5 py-2 text-sm text-white font-semibold hover:bg-forest-dark transition-colors"
          >
            Get the app
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-forest"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="6" y1="18" x2="18" y2="6" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-cream/95 backdrop-blur-md border-b border-forest/10 px-6 pb-4">
          <div className="flex flex-col gap-3">
            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-600 hover:text-forest transition-colors py-2"
            >
              How it works
            </a>
            <a
              href="#categories"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-600 hover:text-forest transition-colors py-2"
            >
              Services
            </a>
            <a
              href="#for-helpers"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-gray-600 hover:text-forest transition-colors py-2"
            >
              For helpers
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center rounded-full bg-forest px-5 py-2.5 text-sm text-white font-semibold hover:bg-forest-dark transition-colors mt-1"
            >
              Get the app
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
