import React from "react";

export function HeroBanner() {
  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-slate-900 min-h-[170px] sm:min-h-[190px] md:min-h-[220px] flex items-center">
      {/* Scenic Udaipur Lake Palace Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center md:bg-right"
        style={{
          backgroundImage: `url('/images/udaipur-lake-palace.jpg')`,
        }}
      />

      {/* Subtle overlay gradient to ensure high legibility on text */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:from-white/90 sm:via-white/70" />

      {/* Banner Content */}
      <div className="relative z-10 px-5 sm:px-8 py-6 max-w-xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          All Your Travel Portals <br className="hidden xs:inline" />
          <span className="text-cyatra-red">in One Place</span>
        </h1>
        <p className="mt-2 text-xs sm:text-sm md:text-base font-medium text-slate-600">
          Quick access to your booking websites.
        </p>

        {/* C-Yatra tricolor accent line */}
        <div className="mt-3 flex items-center gap-1">
          <div className="h-1 w-8 rounded-full bg-cyatra-red" />
          <div className="h-1 w-6 rounded-full bg-cyatra-green" />
        </div>
      </div>
    </div>
  );
}
