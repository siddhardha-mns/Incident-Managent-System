import React from 'react';
import { Clock, MapPin, AlertCircle, Phone } from 'lucide-react';
import { Incident } from '../../types';

interface IncidentCardProps {
  incident: Incident;
  onAssign: (id: string) => void;
}

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onAssign }) => {
  const priorityColors = {
    P0: 'bg-emergency-red',
    P1: 'bg-emergency-red',
    P2: 'bg-emergency-warning',
    P3: 'bg-emergency-warning',
    P4: 'bg-gray-400',
  };

  const getStripeColor = (p: string) => priorityColors[p as keyof typeof priorityColors] || 'bg-gray-400';

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    return `${minutes} min ago`;
  };

  return (
    <div className="bg-white border-2 border-beige-medium rounded-xl relative overflow-hidden hover:shadow-lg transition-all mb-4 group">
      {/* Priority Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${getStripeColor(incident.priority)}`}></div>

      <div className="pl-6 p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className={`${getStripeColor(incident.priority)} text-white px-2 py-0.5 rounded text-xs font-bold`}>
              {incident.priority}
            </span>
            <span className="uppercase text-xs font-bold text-gray-500 tracking-wider">
              {incident.type}
            </span>
          </div>
          <div className="flex items-center text-gray-400 text-xs gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(incident.timestamp)}
          </div>
        </div>

        {/* Content */}
        <h4 className="font-mono text-sm text-gray-400 mb-1">{incident.id}</h4>
        <p className="text-gray-800 font-medium text-sm mb-3 line-clamp-2">{incident.description}</p>

        <div className="flex items-start gap-2 text-gray-600 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 mt-0.5 text-emergency-red" />
          <span>{incident.location.address}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-beige-light/30 p-2 rounded">
          <div className="text-xs">
            <span className="text-gray-500">Victims:</span> <span className="font-semibold">{incident.estimatedVictims}</span>
          </div>
          <div className="text-xs flex items-center gap-1">
             <Phone className="w-3 h-3" /> <span className="font-semibold">{incident.callerInfo.phone}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
           {incident.assignedTeamId ? (
             <div className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-1 rounded">
               Assigned: {incident.assignedTeamId}
             </div>
           ) : (
             <button 
               onClick={() => onAssign(incident.id)}
               className="bg-emergency-red hover:bg-emergency-darkRed text-white text-xs font-bold py-1.5 px-3 rounded shadow transition-colors"
             >
               ASSIGN TEAM
             </button>
           )}
           <div className="flex gap-1">
             {incident.specialFlags.map(flag => (
               <span key={flag} className="text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded border border-yellow-200">
                 {flag.replace('_', ' ')}
               </span>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;