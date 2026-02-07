import { Incident, Team } from './types';

// Mock Incidents
export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-20260207-0001',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Broadway, New York, NY',
      confidence: 0.95
    },
    priority: 'P0',
    type: 'medical',
    description: 'Male, 60s, collapsed, not breathing. Possible cardiac arrest.',
    estimatedVictims: 1,
    keywords: ['cardiac', 'collapse', 'unconscious'],
    callerInfo: { phone: '+15550101', language: 'English', status: 'on-line' },
    sentimentAnalysis: { panicLevel: 9, urgencyScore: 98, emotionalState: 'panicked' },
    status: 'new',
    specialFlags: ['cpr_in_progress'],
    recommendedResponse: { teamType: ['medical'], teamQuantity: 1, specialEquipment: ['AED'] }
  },
  {
    id: 'INC-20260207-0002',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    location: {
      lat: 40.7200,
      lng: -74.0100,
      address: '450 West St, New York, NY',
      confidence: 0.90
    },
    priority: 'P1',
    type: 'fire',
    description: 'Smoke seen coming from 3rd floor window. Residential building.',
    estimatedVictims: 0,
    keywords: ['smoke', 'residential', 'fire'],
    callerInfo: { phone: '+15550102', language: 'Spanish', status: 'disconnected' },
    sentimentAnalysis: { panicLevel: 7, urgencyScore: 85, emotionalState: 'worried' },
    status: 'assigned',
    assignedTeamId: 'FIRE-01',
    specialFlags: ['evacuation_needed'],
    recommendedResponse: { teamType: ['fire'], teamQuantity: 2, specialEquipment: ['ladder'] }
  }
];

// Mock Teams
export const INITIAL_TEAMS: Team[] = [
  {
    id: 'MED-01',
    type: 'medical',
    status: 'available',
    location: { lat: 40.7300, lng: -74.0000, address: 'Central Station' },
    capacity: 2,
    equipment: ['ALS', 'AED'],
    members: ['Smith', 'Jones']
  },
  {
    id: 'FIRE-01',
    type: 'fire',
    status: 'assigned',
    assignedIncidentId: 'INC-20260207-0002',
    eta: 4,
    location: { lat: 40.7150, lng: -74.0050, address: 'En Route' },
    capacity: 6,
    equipment: ['Ladder', 'Hose'],
    members: ['Squad A']
  },
  {
    id: 'POL-01',
    type: 'police',
    status: 'available',
    location: { lat: 40.7100, lng: -74.0100, address: 'Downtown Precinct' },
    capacity: 2,
    equipment: ['Patrol'],
    members: ['Officer A', 'Officer B']
  },
  {
    id: 'RES-01',
    type: 'rescue',
    status: 'available',
    location: { lat: 40.7250, lng: -73.9900, address: 'East Side Base' },
    capacity: 4,
    equipment: ['Heavy Rescue'],
    members: ['Rescue Team 1']
  }
];

export const SCENARIOS = [
  { label: "Cardiac Emergency", text: "My father just collapsed! He's clutching his chest and he's not breathing! We are at 550 Madison Avenue, 4th floor. Please hurry!" },
  { label: "Building Fire", text: "There is a fire in the lobby! I'm trapped on the 3rd floor with my kids. Smoke is coming under the door. Address is 12 Oak Street." },
  { label: "Car Accident", text: "I just saw a huge crash. Three cars involved on I-95 South near exit 4. One car flipped over. People are screaming." },
  { label: "Flood Rescue", text: "The water is rising really fast! We are on the roof of our house at 88 River Road. It's getting cold and my phone battery is dying." }
];

export const SYSTEM_PROMPT = `You are an emergency response AI voice agent. Your role is to:

1. Stay calm and reassuring no matter how panicked the caller is
2. Quickly extract critical information: location, type of emergency, number of people affected
3. Ask clarifying questions if information is unclear
4. Provide immediate safety instructions while help is dispatched
5. Assign priority based on severity analysis

PRIORITY ASSIGNMENT RULES:
- P0 (Critical): Multiple casualties, active life threat, ongoing disaster, cardiac arrest, severe bleeding, building collapse
- P1 (High): Single casualty with life threat, severe injury, trapped person, difficulty breathing, chest pain
- P2 (Medium): Injuries needing urgent care, stable but serious, fire contained, moderate accident
- P3 (Low): Minor injuries, stable situation, property damage only
- P4 (Non-Emergency): Information request, non-urgent assistance

EXTRACT AND RETURN THIS JSON:
{
  "location": {"address": "", "lat": null, "lng": null, "confidence": 0-1},
  "incidentType": "medical|fire|accident|disaster|security",
  "priority": "P0|P1|P2|P3|P4",
  "description": "brief summary",
  "estimatedVictims": number,
  "keywords": ["keyword1", "keyword2"],
  "sentimentAnalysis": {
    "panicLevel": 1-10,
    "urgencyScore": 0-100,
    "emotionalState": "calm|worried|panicked|distressed"
  },
  "safetyInstructionsGiven": ["instruction1", "instruction2"],
  "requiresImmediateAction": boolean,
  "specialFlags": ["language_barrier", "caller_injured", "call_dropped"],
  "recommendedResponse": {
    "teamType": ["medical", "fire", "police", "rescue"],
    "teamQuantity": number,
    "specialEquipment": []
  }
}
Respond with ONLY the JSON object.`;
