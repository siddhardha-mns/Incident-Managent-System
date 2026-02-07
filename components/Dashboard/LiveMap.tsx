import React from 'react';
import { MapPin } from 'lucide-react';
import { Incident, Team } from '../../types';

interface LiveMapProps {
  incidents: Incident[];
  teams: Team[];
}

// A simulated map since we can't easily include a Google Maps key in a generated response without user config.
// It uses a grid system to place relative markers.
const LiveMap: React.FC<LiveMapProps> = ({ incidents, teams }) => {
  return (
    <div className="bg-gray-200 w-full h-full relative overflow-hidden rounded-xl shadow-inner group">
      {/* Map Background Pattern */}
      <div 
        className="absolute inset-0 opacity-40" 
        style={{
            backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            backgroundColor: '#e2e8f0'
        }}
      ></div>
      
      {/* City Features (Abstract) */}
      <div className="absolute top-1/2 left-0 right-0 h-4 bg-gray-400 rotate-12 transform -translate-y-12"></div>
      <div className="absolute top-0 bottom-0 left-1/3 w-6 bg-gray-400"></div>
      
      {/* Labels */}
      <div className="absolute top-4 right-4 bg-white/80 px-2 py-1 rounded text-xs font-bold text-gray-600">
        Live City Grid: Manhattan Sector 4
      </div>

      {/* Incidents Markers */}
      {incidents.map((inc) => (
        <div
          key={inc.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform z-10"
          style={{
            // Generate pseudo-random positions based on hash of ID if actual lat/long mapping is too complex for this demo
            top: `${((inc.location.lat * 1000) % 80) + 10}%`,
            left: `${Math.abs((inc.location.lng * 1000) % 80) + 10}%`,
          }}
          title={inc.description}
        >
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 border-white ${
             inc.priority === 'P0' || inc.priority === 'P1' ? 'bg-emergency-red animate-pulse' : 'bg-emergency-warning'
          }`}>
             <span className="text-white font-bold text-xs">{inc.priority}</span>
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
            {inc.type}
          </div>
        </div>
      ))}

      {/* Team Markers */}
      {teams.map((team) => (
        <div
          key={team.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform z-20"
          style={{
            top: `${((team.location.lat * 1000) % 80) + 15}%`,
            left: `${Math.abs((team.location.lng * 1000) % 80) + 15}%`,
          }}
        >
          <div className={`flex items-center justify-center w-8 h-8 rounded bg-white shadow-md border-2 ${
            team.status === 'available' ? 'border-emergency-success' : 'border-blue-500'
          }`}>
             <MapPin className={`w-4 h-4 ${team.status === 'available' ? 'text-emergency-success' : 'text-blue-500'}`} />
          </div>
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] font-bold text-gray-700 whitespace-nowrap">
            {team.id}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveMap;