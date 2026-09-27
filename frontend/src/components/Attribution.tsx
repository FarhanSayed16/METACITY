import React from 'react';

export const Attribution: React.FC = () => {
  return (
    <div className="absolute bottom-1 right-1 z-20 text-[10px] text-gray-500 bg-white/70 px-1.5 py-0.5 rounded backdrop-blur-sm max-w-[14rem] leading-snug">
      Map data ©{' '}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer"
        className="underline hover:text-[#2A9D8F]"
      >
        OpenStreetMap
      </a>{' '}
      · 3D city pack CC0 (Kenney / Poly Haven inspired) — see City Twin attribution
    </div>
  );
};
