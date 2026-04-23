'use client';

/**
 * Loading spinner with logo animation
 */
export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#080D1A]">
      {/* Animated SVG Logo Spinner */}
      <div className="relative w-24 h-24 mb-6">
        <svg
          viewBox="0 0 192 192"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full animate-spin"
          style={{ animationDuration: '3s' }}
        >
          <defs>
            <linearGradient id="spinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8DC63F" stopOpacity="1" />
              <stop offset="100%" stopColor="#00B4EF" stopOpacity="1" />
            </linearGradient>
          </defs>

          <circle cx="96" cy="96" r="96" fill="#080D1A" />

          <path
            d="M 40 50 Q 90 30 140 70 Q 120 100 80 90 Q 60 85 40 50 Z"
            fill="url(#spinnerGrad)"
            opacity="0.95"
          />

          <path
            d="M 50 120 Q 100 140 150 110 Q 130 90 90 100 Q 70 105 50 120 Z"
            fill="url(#spinnerGrad)"
            opacity="0.7"
          />

          <circle cx="96" cy="96" r="35" fill="none" stroke="url(#spinnerGrad)" strokeWidth="2" opacity="0.6" />
        </svg>
      </div>

      {/* Loading Text */}
      <p className="text-lg text-cyan-400 font-medium animate-pulse">
        Loading projects...
      </p>

      {/* Subtext */}
      <p className="text-sm text-white/50 mt-2">
        Please wait while we fetch your data
      </p>
    </div>
  );
}
