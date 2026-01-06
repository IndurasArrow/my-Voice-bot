"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  Volume2,
  Wifi,
  WifiOff,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionState,
  useVoiceAssistant,
  useLocalParticipant,
  BarVisualizer,
} from "@livekit/components-react";
import { ConnectionState, RoomEvent } from "livekit-client";

/**
 * TYPES AND INTERFACES
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger" | "icon" | "ghost";
  children?: React.ReactNode;
}

interface Message {
  role: "user" | "bot" | "system";
  text: string;
  timestamp: Date;
}

// Configuration
// In a production app, this should be in an environment variable: NEXT_PUBLIC_LIVEKIT_URL
const LIVEKIT_URL = "wss://superai-ivr-34isl21s.livekit.cloud";

// --- Components ---

const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}: ButtonProps) => {
  const baseStyle =
    "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 shadow-lg backdrop-blur-sm";

  const variants = {
    primary:
      "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:scale-105 active:scale-95",
    danger:
      "bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-500/30 hover:shadow-red-500/20",
    icon: "p-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full",
    ghost:
      "bg-transparent hover:bg-white/5 text-white/60 hover:text-white border border-transparent",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Inner Component (Connected State) ---

function VoiceAssistantContent({
  onDisconnect,
}: {
  onDisconnect: () => void;
}) {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { localParticipant } = useLocalParticipant();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Map LiveKit Agent state to UI state
  // state can be: "listening" | "thinking" | "speaking" | "idle"
  // We map "thinking" to "processing" to match original UI
  const botState = state === "thinking" ? "processing" : state;

  // Sync transcriptions to messages
  useEffect(() => {
    if (agentTranscriptions && agentTranscriptions.length > 0) {
      const latest = agentTranscriptions[agentTranscriptions.length - 1];
      // This is a simplified way to handle transcripts. 
      // In a real app, you might want to deduplicate or handle partial segments.
      // For now, we'll just append completed segments or update the last one.
      
      // NOTE: This basic implementation might need refinement based on exact Agent behavior
    }
  }, [agentTranscriptions]);

  // Handle messages for the history view (Mocking for now as useVoiceAssistant 
  // transcriptions handling can be complex depending on how the agent sends them)
  const addMessage = (role: "user" | "bot" | "system", text: string) => {
    setMessages((prev) => [...prev, { role, text, timestamp: new Date() }]);
  };

  // Auto-scroll chat
  useEffect(() => {
    if (showHistory) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showHistory]);

  const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;

  // Toggle Microphone
  const toggleMute = useCallback(() => {
    if (localParticipant) {
      const isMuted = localParticipant.isMicrophoneEnabled;
      localParticipant.setMicrophoneEnabled(!isMuted);
    }
  }, [localParticipant]);
  
  const isMicEnabled = localParticipant?.isMicrophoneEnabled;

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg relative">
       {/* Status Indicator Text */}
       <div className="mb-12 h-8 flex items-center justify-center">
            <span className="text-white/60 text-sm font-medium tracking-widest uppercase animate-fade-in">
              {botState === "idle" && "Listening for wake word..."}
              {botState === "listening" && "Listening..."}
              {botState === "processing" && "Processing..."}
              {botState === "speaking" && "Speaking..."}
            </span>
          </div>

      {/* The Orb */}
      <div className="relative group">
        {/* Outer Glow Rings - driven by visualizer would be cool, but simplistic for now */}
         <div
              className={`absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 blur-2xl transition-all duration-100 opacity-40 
              ${botState === 'speaking' ? 'animate-pulse' : ''}`}
            />

        {/* Core Orb */}
        <div
          className={`
                relative w-48 h-48 rounded-full 
                bg-gradient-to-b from-slate-800 to-slate-900 
                border border-white/10 shadow-2xl 
                flex items-center justify-center 
                transition-all duration-500
                ${
                  botState === "listening"
                    ? "border-purple-500/50 shadow-purple-500/20"
                    : ""
                }
                ${
                  botState === "speaking"
                    ? "border-blue-500/50 shadow-blue-500/20"
                    : ""
                }
              `}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            {/* Visualizer when speaking */}
            {state === "speaking" && audioTrack && (
                <div className="absolute inset-0 flex items-center justify-center opacity-50">
                    <BarVisualizer state={state} barCount={5} trackRef={audioTrack} className="h-20 w-32" /> 
                </div>
            )}
            
            <div
              className={`absolute inset-0 opacity-30 transition-opacity duration-500 ${
                botState === "idle" ? "opacity-10" : "opacity-40"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow blur-xl opacity-80" />
            </div>

            <div className="z-10 text-white/80 transition-all duration-300 transform">
              {botState === "processing" ? (
                <Loader2 size={48} className="animate-spin text-white/50" />
              ) : botState === "speaking" ? (
                <Volume2 size={48} className="animate-pulse text-blue-300" />
              ) : (
                <Mic
                  size={48}
                  className={`${
                    botState === "listening"
                      ? "text-purple-300 scale-110"
                      : "text-white/50"
                  }`}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-16 flex items-center gap-6 justify-center">
        <Button variant="ghost" onClick={onDisconnect}>
          <X size={20} />
        </Button>

        <Button
          variant={isMicEnabled ? "primary" : "danger"}
          onClick={toggleMute}
          className="min-w-[140px] justify-center"
        >
          {isMicEnabled ? (
             <>
             <Mic size={18} />
             Live
           </>
          ) : (
             <>
             <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
             Muted
           </>
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={() => setShowHistory(true)}
          className={showHistory ? "bg-white/10" : ""}
        >
          <FileText size={20} />
        </Button>
      </div>
      
      {/* Messages Modal */}
       {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-lg font-medium text-white">
                Conversation History
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                 <div className="text-center text-white/20 py-10">
                 History not fully implemented with Agent API yet.
               </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                   <div className="bg-slate-800 p-2 rounded text-sm text-white">{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Application ---

export default function VoiceBotApp() {
  const [token, setToken] = useState<string>("");
  const [shouldConnect, setShouldConnect] = useState(false);

  const handleConnect = async () => {
    try {
      setBotState("processing");
      
      // 1. Fetch the token from your route.ts
      const response = await fetch("/api/token");
      const data = await response.json();

      // 2. CRITICAL FIX: Extract the string from the object
      const token = data.accessToken; 

      if (!token) {
        throw new Error("No access token found in response");
      }

  const handleDisconnect = () => {
    setShouldConnect(false);
    setToken("");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-white font-sans selection:bg-purple-500/30">
       {/* Background Animation (kept from original) */}
       <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-[-10%] right-[-20%] w-[70vw] h-[70vw] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] bg-teal-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Header */}
        <header className="absolute top-6 left-0 right-0 px-8 flex justify-between items-center">
          <div className="flex items-center gap-2 opacity-80">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-blue-400"></div>
            <span className="text-sm font-semibold tracking-wider uppercase">
              Aura Voice
            </span>
          </div>
           <div className="flex gap-4">
             {/* Connection Status Mocked for now at top level, handled by Room inside */}
             <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${shouldConnect ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
               {shouldConnect ? <Wifi size={14} /> : <WifiOff size={14} />}
               {shouldConnect ? "LiveKit Connected" : "Offline"}
             </div>
           </div>
        </header>

        {!shouldConnect || !token ? (
           <div className="flex flex-col items-center gap-6">
             <div className="w-32 h-32 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center shadow-2xl">
                <Mic size={40} className="text-white/20" />
             </div>
             <Button onClick={handleConnect}>Connect to Agent</Button>
           </div>
        ) : (
          <LiveKitRoom
            serverUrl={LIVEKIT_URL}
            token={token}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={handleDisconnect}
            className="flex flex-col items-center justify-center w-full"
          >
            <VoiceAssistantContent onDisconnect={handleDisconnect} />
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}
      </main>

      {/* Styles (kept from original) */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
