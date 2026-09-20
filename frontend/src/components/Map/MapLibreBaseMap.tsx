import React, { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useUIStore } from '../../store/uiStore';

export const MapLibreBaseMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const isNightMode = useUIStore((state) => state.isNightMode);

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // MVP: Using a generic OSM raster tile for simplicity.
    // In production, this would use a vector tile server.
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap Contributors'
          }
        },
        layers: [
          {
            id: 'osm-tiles',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [-0.1276, 51.5074], // Default London
      zoom: 12,
      interactive: false // Managed by R3F instead
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (map.current) {
      // Very basic night mode approximation for raster tiles using CSS filters
      const canvas = map.current.getCanvas();
      if (isNightMode) {
        canvas.style.filter = 'invert(100%) hue-rotate(180deg) brightness(80%) contrast(120%)';
      } else {
        canvas.style.filter = 'none';
      }
    }
  }, [isNightMode]);

  return (
    <div 
      ref={mapContainer} 
      className="absolute inset-0 z-[-1]" 
      style={{ opacity: 0.5 }} // Faded to let the 3D grid pop
    />
  );
};
