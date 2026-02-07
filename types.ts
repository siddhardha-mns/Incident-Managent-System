export interface IncidentLocation {
  lat: number;
  lng: number;
  address: string;
  confidence?: number;
}

export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
export type IncidentType = 'medical' | 'fire' | 'accident' | 'disaster' | 'security';
export type TeamType = 'medical' | 'fire' | 'police' | 'rescue';
export type TeamStatus = 'available' | 'assigned' | 'en-route' | 'on-scene';

export interface CallerInfo {
  phone: string;
  language: string;
  status: 'on-line' | 'disconnected';
}

export interface SentimentAnalysis {
  panicLevel: number; // 1-10
  urgencyScore: number; // 0-100
  emotionalState: string;
  backgroundNoises?: string[];
}

export interface RecommendedResponse {
  teamType: TeamType[];
  teamQuantity: number;
  specialEquipment: string[];
}

export interface Incident {
  id: string;
  timestamp: number;
  location: IncidentLocation;
  priority: PriorityLevel;
  type: IncidentType;
  description: string;
  estimatedVictims: number;
  keywords: string[];
  callerInfo: CallerInfo;
  sentimentAnalysis: SentimentAnalysis;
  assignedTeamId?: string;
  status: 'new' | 'assigned' | 'resolved' | 'closed';
  specialFlags: string[];
  recommendedResponse: RecommendedResponse;
  transcript?: string;
}

export interface Team {
  id: string;
  type: TeamType;
  status: TeamStatus;
  location: { lat: number; lng: number; address: string };
  capacity: number;
  equipment: string[];
  members: string[];
  assignedIncidentId?: string;
  eta?: number; // minutes
}

export interface ConversationTurn {
  role: 'agent' | 'user';
  text: string;
  timestamp: number;
}

// AI Analysis Result Structure (from Gemini)
export interface AIAnalysisResult {
  location: { address: string; lat: number | null; lng: number | null; confidence: number };
  incidentType: IncidentType;
  priority: PriorityLevel;
  description: string;
  estimatedVictims: number;
  keywords: string[];
  sentimentAnalysis: {
    panicLevel: number;
    urgencyScore: number;
    emotionalState: string;
  };
  safetyInstructionsGiven: string[];
  requiresImmediateAction: boolean;
  specialFlags: string[];
  recommendedResponse: {
    teamType: string[];
    teamQuantity: number;
    specialEquipment: string[];
  };
}

// Global window augmentation for Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}