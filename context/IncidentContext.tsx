import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Incident, Team } from '../types';
import { INITIAL_INCIDENTS, INITIAL_TEAMS } from '../constants';

interface IncidentContextType {
  incidents: Incident[];
  teams: Team[];
  addIncident: (incident: Incident) => void;
  assignTeam: (incidentId: string, teamId: string) => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);

  const addIncident = (incident: Incident) => {
    setIncidents(prev => [incident, ...prev]);
  };

  const assignTeam = (incidentId: string, teamId: string) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, status: 'assigned', assignedIncidentId: incidentId } : t));
    setIncidents(prev => prev.map(i => i.id === incidentId ? { ...i, status: 'assigned', assignedTeamId: teamId } : i));
  };

  return (
    <IncidentContext.Provider value={{ incidents, teams, addIncident, assignTeam }}>
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};
