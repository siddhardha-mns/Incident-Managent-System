import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Phone, Activity, ArrowRight, Clock, StopCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { transcribeAudio, generateSpeech, analyzeEmergencyCall } from '../services/geminiService';
import { base64ToUint8Array, decodeAudioData } from '../utils/audioUtils';
import { useIncidents } from '../context/IncidentContext';
import { Incident } from '../types';

interface TranscriptItem {
  role: 'agent' | 'user';
  text: string;
  timestamp: number;
}

const VoiceAgentTest: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'connected' | 'analyzing' | 'responded'>('idle');
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  
  const { addIncident } = useIncidents();
  const navigate = useNavigate();
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Auto-scroll to bottom of transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Agent speaks (TTS)
  const agentSpeak = async (text: string) => {
    setTranscript(prev => [...prev, { role: 'agent', text, timestamp: Date.now() }]);
    try {
      const audioBase64 = await generateSpeech(text);
      if (audioBase64) {
         if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitSpeechRecognition)({sampleRate: 24000});
         }
         const ctx = audioContextRef.current;
         // Ensure context is running (sometimes suspended by browser policy)
         if (ctx.state === 'suspended') {
            await ctx.resume();
         }
         
         const buffer = await decodeAudioData(base64ToUint8Array(audioBase64), ctx, 24000);
         const source = ctx.createBufferSource();
         source.buffer = buffer;
         source.connect(ctx.destination);
         source.start();
      }
    } catch (e) {
      console.error("TTS Error", e);
    }
  };

  const startCall = () => {
    setCallStatus('connected');
    setTranscript([]);
    setLastAnalysis(null);
    agentSpeak("911 Emergency. What is your location and the nature of your emergency?");
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        // Validation: Check if we actually recorded something meaningful
        if (chunksRef.current.length === 0) {
           setCallStatus('connected');
           return;
        }
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (blob.size < 1000) { // < 1kb is likely too short/noise
           console.warn("Audio too short");
           setCallStatus('connected');
           return;
        }

        setCallStatus('analyzing');
        
        // Convert Blob to Base64 for Gemini
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          const base64data = (reader.result as string).split(',')[1];
          try {
            // 1. Transcribe
            const text = await transcribeAudio(base64data, blob.type);
            
            if (!text || text.trim().length === 0) {
                 setCallStatus('connected');
                 // Optionally alert user "Didn't catch that"
                 return;
            }

            const userTimestamp = Date.now();
            
            // Add to transcript state immediately
            const newUserMsg: TranscriptItem = { role: 'user', text, timestamp: userTimestamp };
            setTranscript(prev => [...prev, newUserMsg]);
            
            // Construct history context for the AI
            const historyContext = [...transcript, newUserMsg]
                .map(t => `${t.role.toUpperCase()} (${new Date(t.timestamp).toLocaleTimeString()}): ${t.text}`)
                .join('\n');
            
            // 2. Analyze with History Context
            const analysis = await analyzeEmergencyCall(historyContext);
            
            if (analysis) {
               setLastAnalysis(analysis);
               
               // 3. Create Incident
               const newIncident: Incident = {
                  id: `INC-${Date.now().toString().slice(-6)}`,
                  timestamp: Date.now(),
                  location: analysis.location as any,
                  priority: analysis.priority,
                  type: analysis.incidentType,
                  description: analysis.description,
                  estimatedVictims: analysis.estimatedVictims,
                  keywords: analysis.keywords,
                  callerInfo: { phone: 'Unknown', language: 'English', status: 'on-line' },
                  sentimentAnalysis: analysis.sentimentAnalysis,
                  status: 'new',
                  specialFlags: analysis.specialFlags,
                  recommendedResponse: analysis.recommendedResponse as any,
                  transcript: historyContext
               };

               // 4. Save to Dashboard
               addIncident(newIncident);
               
               // 5. Respond based on analysis
               let responseText = "";
               if (analysis.location.address && analysis.incidentType) {
                   responseText = `I have logged the ${analysis.incidentType} at ${analysis.location.address}. Units are being dispatched. Stay on the line.`;
                   setCallStatus('responded');
               } else {
                   responseText = "I've logged the details. Dispatching units now.";
                   setCallStatus('responded');
               }
               
               await agentSpeak(responseText);
               
            } else {
               await agentSpeak("I couldn't hear you clearly. Please repeat.");
               setCallStatus('connected');
            }

          } catch (e) {
            console.error(e);
            setCallStatus('connected');
            await agentSpeak("System error. Please state your emergency again.");
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Mic access denied", e);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const formatTime = (ts: number) => {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans relative overflow-hidden">
       {/* Background Grid */}
       <div 
         className="absolute inset-0 opacity-10 pointer-events-none" 
         style={{
             backgroundImage: 'linear-gradient(#4b5563 1px, transparent 1px), linear-gradient(90deg, #4b5563 1px, transparent 1px)',
             backgroundSize: '40px 40px'
         }}
       ></div>

       <div className="container mx-auto max-w-4xl p-8 flex flex-col h-full relative z-10">
          <header className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
             <h1 className="text-2xl font-bold tracking-wider text-gray-100 flex items-center gap-3">
                <Activity className="text-emergency-red animate-pulse" />
                VOICE INTAKE CONSOLE
             </h1>
             <div className="text-sm text-gray-400 font-mono">
                AGENT_ID: AI_SENTINEL_01
             </div>
          </header>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-h-0">
             {/* Left: Call Control */}
             <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700 backdrop-blur-sm shadow-xl">
                
                {/* Status Display */}
                <div className="mb-8 text-center w-full">
                   <div className={`text-sm font-bold tracking-widest uppercase mb-2 ${
                      callStatus === 'analyzing' ? 'text-yellow-400 animate-pulse' : 
                      callStatus === 'responded' ? 'text-green-400' : 'text-gray-500'
                   }`}>
                      {callStatus === 'idle' ? 'SYSTEM READY' : 
                       callStatus === 'connected' ? 'LINE ACTIVE' :
                       callStatus === 'analyzing' ? 'ANALYZING...' : 'INCIDENT LOGGED'}
                   </div>
                   <div className="h-1 w-full bg-gray-700 mx-auto rounded overflow-hidden max-w-[200px]">
                      <div className={`h-full transition-all duration-500 ${
                         callStatus === 'analyzing' ? 'w-full bg-yellow-400' : 
                         isRecording ? 'w-full bg-emergency-red animate-pulse' : 'w-0'
                      }`}></div>
                   </div>
                </div>

                {/* Main Action Button */}
                {callStatus === 'idle' ? (
                   <button 
                      onClick={startCall}
                      className="w-40 h-40 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all transform hover:scale-105"
                   >
                      <Phone className="w-16 h-16 text-white" />
                   </button>
                ) : (
                   <button 
                      onClick={toggleRecording}
                      disabled={callStatus === 'analyzing'}
                      className={`w-40 h-40 rounded-full border-4 flex items-center justify-center transition-all ${
                         isRecording 
                           ? 'bg-red-600 border-red-400 scale-110 shadow-[0_0_40px_rgba(220,38,38,0.5)]' 
                           : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      } ${callStatus === 'analyzing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                   >
                      {isRecording ? <StopCircle className="w-16 h-16 text-white animate-pulse" /> : <Mic className="w-16 h-16 text-gray-400" />}
                   </button>
                )}
                
                <p className="mt-6 text-gray-400 text-center text-sm font-medium">
                   {callStatus === 'idle' ? 'Click to Initiate Emergency Protocol' : 
                    isRecording ? 'Recording... Click to Stop' : 'Click Mic to Speak'}
                </p>
             </div>

             {/* Right: Transcript & Intel */}
             <div className="flex flex-col gap-4 min-h-0">
                <div className="flex-1 bg-black/40 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
                    <div className="bg-gray-800/80 p-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-700 flex justify-between items-center">
                        <span>Live Transcript</span>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>REC</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                        {transcript.length === 0 && <div className="text-gray-600 italic text-center mt-10 text-sm">Waiting for connection...</div>}
                        {transcript.map((t, i) => (
                            <div key={i} className={`flex flex-col ${t.role === 'agent' ? 'items-start' : 'items-end'}`}>
                                <div className={`max-w-[90%] p-3 rounded-lg text-sm relative ${
                                    t.role === 'agent' 
                                    ? 'bg-gray-800 text-green-400 rounded-tl-none border border-gray-700' 
                                    : 'bg-blue-900/40 text-blue-100 rounded-tr-none border border-blue-800/50'
                                }`}>
                                    <p>{t.text}</p>
                                </div>
                                <span className="text-[10px] text-gray-500 mt-1 px-1">
                                    {t.role === 'agent' ? 'AI SENTINEL' : 'CALLER'} • {formatTime(t.timestamp)}
                                </span>
                            </div>
                        ))}
                        <div ref={transcriptEndRef} />
                    </div>
                </div>

                {/* Detected Intel Card */}
                {lastAnalysis && (
                   <div className="bg-gray-800 p-4 rounded-xl border-l-4 border-emergency-red animate-in fade-in slide-in-from-bottom duration-500 shadow-lg">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <h3 className="font-bold text-white flex items-center gap-2">
                               INCIDENT LOGGED
                               <span className="text-xs bg-red-600 px-2 py-0.5 rounded text-white shadow-sm">{lastAnalysis.priority}</span>
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 font-mono">{lastAnalysis.incidentType.toUpperCase()} • {lastAnalysis.location.address || "Unknown Location"}</p>
                         </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                         <button 
                            onClick={() => navigate('/')}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded flex items-center justify-center gap-2 transition-colors shadow"
                         >
                            VIEW IN DASHBOARD <ArrowRight className="w-3 h-3" />
                         </button>
                      </div>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

export default VoiceAgentTest;