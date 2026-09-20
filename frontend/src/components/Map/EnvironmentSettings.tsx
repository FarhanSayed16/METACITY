import React from 'react';
import { useUIStore } from '../../store/uiStore';
import { Moon, Sun, Navigation, Map, CloudRain, Snowflake } from 'lucide-react';

export const EnvironmentSettings: React.FC = () => {
  const { isNightMode, toggleNightMode, walkthroughMode, setWalkthroughMode, showMiniMap, toggleMiniMap, weather, setWeather } = useUIStore();

  return (
    <div className="absolute top-4 right-4 flex gap-2 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-md border border-gray-200">
      <button 
        onClick={toggleNightMode} 
        className={`p-2 rounded-md transition-colors ${isNightMode ? 'bg-[#1B2430] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
        title="Toggle Day/Night"
      >
        {isNightMode ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      
      <button 
        onClick={() => setWalkthroughMode(!walkthroughMode)} 
        className={`p-2 rounded-md transition-colors ${walkthroughMode ? 'bg-[#2A9D8F] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
        title="Walkthrough (First Person) Mode"
      >
        <Navigation size={20} />
      </button>
      
      <button 
        onClick={toggleMiniMap} 
        className={`p-2 rounded-md transition-colors ${showMiniMap ? 'bg-[#2A9D8F] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
        title="Toggle Mini-map"
      >
        <Map size={20} />
      </button>

      <div className="w-px bg-gray-300 mx-1"></div>

      <button 
        onClick={() => setWeather(weather === 'rain' ? 'clear' : 'rain')} 
        className={`p-2 rounded-md transition-colors ${weather === 'rain' ? 'bg-[#2A9D8F] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
        title="Toggle Rain"
      >
        <CloudRain size={20} />
      </button>

      <button 
        onClick={() => setWeather(weather === 'snow' ? 'clear' : 'snow')} 
        className={`p-2 rounded-md transition-colors ${weather === 'snow' ? 'bg-[#2A9D8F] text-white' : 'hover:bg-gray-100 text-gray-700'}`}
        title="Toggle Snow"
      >
        <Snowflake size={20} />
      </button>
    </div>
  );
};
