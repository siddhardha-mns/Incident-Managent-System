import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Radio } from 'lucide-react';
import { getGenAI } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decodeAudioData } from '../utils/audioUtils';

const LiveAgent: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [transcription, setTranscription] = useState('');
  
  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    try {
      setStatus('Connecting...');
      const genAI = getGenAI();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Input Context (16kHz for Gemini)
      const inputCtx = new (window.AudioContext || window.webkitSpeechRecognition)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;
      
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Output Context (24kHz for playback)
      const outputCtx = new (window.AudioContext || window.webkitSpeechRecognition)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const ai = genAI;
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: "You are Sentinel, an advanced emergency response AI. Be concise, calm, and authoritative.",
        },
        callbacks: {
          onopen: () => {
            setStatus('Connected - Listening');
            setIsConnected(true);
            
            // Start streaming audio
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session: any) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Audio Output
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio) {
               setIsTalking(true);
               const ctx = audioContextRef.current;
               if (ctx) {
                 const buffer = await decodeAudioData(base64ToUint8Array(base64Audio), ctx, 24000);
                 const source = ctx.createBufferSource();
                 source.buffer = buffer;
                 source.connect(ctx.destination);
                 
                 // Schedule gapless playback
                 const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
                 source.start(startTime);
                 nextStartTimeRef.current = startTime + buffer.duration;
                 
                 source.onended = () => setIsTalking(false);
               }
             }

             // Handle Turn Complete (could implement transcription display here if enabled in config)
             if (message.serverContent?.turnComplete) {
               // turn complete logic
             }
          },
          onclose: () => {
            setStatus('Disconnected');
            setIsConnected(false);
            cleanup();
          },
          onerror: (err: any) => {
            console.error(err);
            setStatus('Error occurred');
            setIsConnected(false);
            cleanup();
          }
        }
      });
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      setStatus('Failed to connect');
    }
  };

  const stopSession = () => {
    cleanup();
    setStatus('Disconnected');
    setIsConnected(false);
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    // Note: session.close() not explicitly available on the promise wrapper in all versions, 
    // but disconnecting the stream effectively ends the interaction flow for the user.
    // Ideally we would call session.close() if available in the returned object.
  };

  // Utility needed here as it's not exported from utils
  function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  useEffect(() => {
    return () => cleanup();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white p-8 relative overflow-hidden">
      {/* Background Pulse Animation */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isTalking ? 'opacity-30' : 'opacity-5'}`}>
         <div className="w-96 h-96 bg-emergency-red rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="z-10 flex flex-col items-center gap-8">
        <div className="flex items-center gap-3 mb-8">
          <Radio className={`w-8 h-8 ${isConnected ? 'text-green-500 animate-pulse' : 'text-gray-500'}`} />
          <h1 className="text-3xl font-bold tracking-wider">LIVE AGENT CHANNEL</h1>
        </div>

        {/* Status Indicator */}
        <div className="bg-gray-800 px-6 py-2 rounded-full border border-gray-700 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="uppercase font-mono text-sm tracking-widest">{status}</span>
        </div>

        {/* Main Button */}
        <button
          onClick={isConnected ? stopSession : startSession}
          className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all transform hover:scale-105 shadow-[0_0_50px_rgba(0,0,0,0.5)] ${
            isConnected 
              ? 'border-red-500 bg-red-900/20 hover:bg-red-900/40' 
              : 'border-green-500 bg-green-900/20 hover:bg-green-900/40'
          }`}
        >
          {isConnected ? (
            <MicOff className="w-20 h-20 text-red-500" />
          ) : (
            <Mic className="w-20 h-20 text-green-500" />
          )}
        </button>

        <p className="text-gray-400 max-w-md text-center">
          {isConnected 
            ? "Live channel open. Speak clearly to the agent." 
            : "Click microphone to establish secure line with Sentinel AI."}
        </p>
      </div>
    </div>
  );
};

export default LiveAgent;