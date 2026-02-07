import React, { useEffect } from 'react';
import { Bell, User, CloudSun } from 'lucide-react';
import LiveMap from '../components/Dashboard/LiveMap';
import IncidentCard from '../components/Dashboard/IncidentCard';
import TeamCard from '../components/Dashboard/TeamCard';
import { useIncidents } from '../context/IncidentContext';

const Dashboard: React.FC = () => {
  const { incidents, teams, assignTeam } = useIncidents();
  
  const handleAssignTeam = (incidentId: string) => {
    const incident = incidents.find(i => i.id === incidentId);
    if (!incident) return;

    // Smart team recommendation logic
    const recommendedType = incident.recommendedResponse.teamType[0];
    
    // Find best available team matching type, or any available team
    const availableTeam = teams.find(t => 
        t.status === 'available' && t.type === recommendedType
    ) || teams.find(t => t.status === 'available');
    
    if (availableTeam) {
        assignTeam(incidentId, availableTeam.id);
    } else {
        alert("No available teams matching criteria. Please wait for a unit to clear.");
    }
  };

  const activeIncidentsCount = incidents.filter(i => i.status !== 'closed').length;
  const criticalCount = incidents.filter(i => i.priority === 'P0' || i.priority === 'P1').length;
  const availableTeamsCount = teams.filter(t => t.status === 'available').length;

  return (
    <div className="flex flex-col h-screen bg-beige-light overflow-hidden">
      {/* Header */}
      <header className="bg-beige-medium border-b-4 border-emergency-darkRed px-6 py-3 flex justify-between items-center shadow-md shrink-0 z-10">
         <div className="flex items-center gap-8">
            <h2 className="text-emergency-darkerRed font-bold text-lg hidden md:block">COMMAND CENTER</h2>
            
            <div className="flex gap-4 text-sm font-medium">
               <div className="flex items-center gap-2 bg-white/50 px-3 py-1 rounded-full">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-fast"></span>
                  <span className="text-green-800">System Operational</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="text-emergency-red font-bold text-lg">{activeIncidentsCount}</span>
                  <span className="text-gray-700">Active Incidents</span>
                  {criticalCount > 0 && <span className="text-xs bg-red-100 text-red-800 px-2 rounded-full border border-red-200 font-bold">({criticalCount} Critical)</span>}
               </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
               <Bell className="w-6 h-6 text-gray-700" />
               <span className="absolute -top-1 -right-1 bg-emergency-red text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">5</span>
            </div>
            <div className="flex items-center gap-2 pl-4 border-l border-gray-400">
               <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
               </div>
               <div className="hidden md:block">
                  <div className="text-sm font-bold text-gray-800">Dispatcher Doe</div>
                  <div className="text-xs text-gray-500">ID: DSP-8842</div>
               </div>
            </div>
         </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 grid-rows-[auto_1fr] lg:grid-rows-1 gap-4 overflow-hidden">
        
        {/* Map Section (60% width on Desktop) */}
        <div className="lg:col-span-7 h-[400px] lg:h-full bg-white rounded-xl shadow-lg border border-beige-dark flex flex-col">
           <div className="p-3 border-b border-beige-medium bg-beige-light/30 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Live Incident Map</h3>
              <div className="flex gap-2">
                 <span className="text-xs px-2 py-1 bg-white rounded border border-gray-200">Heatmap: Off</span>
                 <span className="text-xs px-2 py-1 bg-white rounded border border-gray-200">Traffic: On</span>
              </div>
           </div>
           <div className="flex-1 relative">
              <LiveMap incidents={incidents} teams={teams} />
           </div>
        </div>

        {/* Incident Queue (40% width on Desktop) */}
        <div className="lg:col-span-5 h-full flex flex-col gap-4 overflow-hidden">
           {/* Queue Panel */}
           <div className="bg-white rounded-xl shadow-md border border-beige-dark flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-beige-medium bg-beige-light/30 flex justify-between items-center shrink-0">
                 <div>
                    <h3 className="font-bold text-gray-800">Incident Queue</h3>
                    <div className="text-xs text-gray-500 mt-1">
                       <span className="text-red-600 font-bold">{incidents.filter(i => !i.assignedTeamId).length} Unassigned</span>
                    </div>
                 </div>
                 <select className="text-xs border border-gray-300 rounded p-1 bg-white">
                    <option>Sort by Priority</option>
                    <option>Sort by Time</option>
                 </select>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-thin">
                 {incidents.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10">No active incidents.</div>
                 ) : (
                    incidents.map(incident => (
                        <IncidentCard key={incident.id} incident={incident} onAssign={handleAssignTeam} />
                    ))
                 )}
              </div>
           </div>

           {/* Team Panel */}
           <div className="bg-white rounded-xl shadow-md border border-beige-dark h-1/3 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-beige-medium bg-beige-light/30 flex justify-between items-center shrink-0">
                 <h3 className="font-bold text-gray-800">Available Teams ({availableTeamsCount})</h3>
                 <button className="text-xs text-blue-600 hover:underline">View All</button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 bg-beige-light/10">
                 <div className="flex flex-col gap-2">
                    {teams.map(team => (
                       <TeamCard key={team.id} team={team} />
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;