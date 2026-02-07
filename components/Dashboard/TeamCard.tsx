import React from 'react';
import { Ambulance, Flame, Shield, Truck, Users } from 'lucide-react';
import { Team } from '../../types';

interface TeamCardProps {
  team: Team;
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const getIcon = () => {
    switch (team.type) {
      case 'medical': return <Ambulance className="w-5 h-5 text-red-600" />;
      case 'fire': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'police': return <Shield className="w-5 h-5 text-blue-600" />;
      case 'rescue': return <Truck className="w-5 h-5 text-green-600" />;
    }
  };

  const statusColors = {
    available: 'border-emergency-success',
    assigned: 'border-blue-500',
    'en-route': 'border-emergency-warning',
    'on-scene': 'border-emergency-red'
  };

  const statusBadges = {
    available: 'bg-green-100 text-green-800',
    assigned: 'bg-blue-100 text-blue-800',
    'en-route': 'bg-orange-100 text-orange-800',
    'on-scene': 'bg-red-100 text-red-800'
  };

  return (
    <div 
      className={`bg-white border-l-4 ${statusColors[team.status]} shadow-sm rounded-r-lg p-3 min-w-[200px] mb-2 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors`}
      draggable
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <div>
            <h4 className="text-sm font-bold text-gray-800">{team.id}</h4>
            <span className="text-[10px] text-gray-500 uppercase">{team.type}</span>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${statusBadges[team.status]}`}>
          {team.status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
        <Users className="w-3 h-3" />
        <span>{team.capacity} / {team.equipment[0]}</span>
      </div>

      {team.assignedIncidentId && (
         <div className="mt-2 text-[10px] bg-gray-100 p-1 rounded text-gray-600">
           Heading to: <span className="font-mono">{team.assignedIncidentId}</span>
         </div>
      )}
    </div>
  );
};

export default TeamCard;