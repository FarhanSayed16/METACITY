import React from 'react';

export const Attribution: React.FC = () => {
  return (
    <div className="absolute bottom-1 right-1 z-20 text-[10px] text-gray-500 bg-white/70 px-1 rounded backdrop-blur-sm">
      Data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-[#2A9D8F]">OpenStreetMap contributors</a> (ODbL)
    </div>
  );
};
