"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Settings,
  Volume2,
  Wifi,
  WifiOff,
  X,
  Loader2,
  FileText,
} from "lucide-react";

/**
 * TYPES AND INTERFACES
 * These are required for the TypeScript build to pass.
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

// Configuration placeholder
const API_CONFIG = {
  WS_ENDPOINT: "wss://your-backend-api.vercel.app/voice-stream",
  HF_INFERENCE_URL: "https://api-inference.huggingface.co/models/",
};

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

// --- Main Application ---

export default function VoiceBotApp() {
  // States
  const [botState, setBotState] = useState<
    "idle" | "listening" | "processing" | "speaking"
  >("idle");
  const [isConnected, setIsConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Refs with types
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // const socketRef = useRef<WebSocket | null>(null); // Uncomment when using real WebSocket

  // --- Animation & Simulation Logic ---

  const handleConnect = () => {
    setBotState("processing");

    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      setBotState("idle");
      addMessage("system", "Connected to HF Inference Model.");
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setBotState("idle");
    setAudioLevel(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    addMessage("system", "Disconnected.");
  };

  const toggleRecording = () => {
    if (!isConnected) return;

    if (botState === "listening") {
      // STOP RECORDING
      setBotState("processing");
      if (intervalRef.current) clearInterval(intervalRef.current);
      setAudioLevel(0);

      // Mock processing delay then response
      setTimeout(() => {
        setBotState("speaking");
        const userText = "Hello, I'd like to know more about the service.";
        addMessage("user", userText);

        simulateVoiceActivity(); // Simulate bot talking

        setTimeout(() => {
          const botText =
            "I can certainly help with that. What specific features are you interested in?";
          addMessage("bot", botText);
          setBotState("idle");
          if (intervalRef.current) clearInterval(intervalRef.current);
          setAudioLevel(0);
        }, 3000);
      }, 1500);
    } else {
      // START RECORDING
      setBotState("listening");
      simulateVoiceActivity();
    }
  };

  const simulateVoiceActivity = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const newLevel = 0.3 + Math.random() * 0.7;
      setAudioLevel(newLevel);
    }, 100);
  };

  const addMessage = (role: "user" | "bot" | "system", text: string) => {
    setTranscript((prev) => [...prev, { role, text, timestamp: new Date() }]);
  };

  // Auto-scroll chat in modal
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (showHistory) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, showHistory]);

  const lastMessage =
    transcript.length > 0 ? transcript[transcript.length - 1] : null;

  // --- Render ---

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-white font-sans selection:bg-purple-500/30">
      {/* 1. Soothing Background Animation */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-[-10%] right-[-20%] w-[70vw] h-[70vw] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] bg-teal-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      {/* 2. Main Content Container */}
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
            <div
              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
                isConnected
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              {isConnected ? "Hugging Face Live" : "Offline"}
            </div>
          </div>
        </header>

        {/* Central Avatar / Orb */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg relative">
          {/* Status Indicator Text */}
          <div className="mb-12 h-8 flex items-center justify-center">
            <span className="text-white/60 text-sm font-medium tracking-widest uppercase animate-fade-in">
              {botState === "idle" &&
                isConnected &&
                "Listening for wake word..."}
              {botState === "idle" && !isConnected && "Disconnected"}
              {botState === "listening" && "Listening..."}
              {botState === "processing" && "Processing..."}
              {botState === "speaking" && "Speaking..."}
            </span>
          </div>

          {/* The Orb */}
          <div
            className="relative group cursor-pointer"
            onClick={toggleRecording}
          >
            {/* Outer Glow Rings */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 blur-2xl transition-all duration-100 opacity-40"
              style={{ transform: `scale(${1 + audioLevel * 0.5})` }}
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
                <div
                  className={`absolute inset-0 opacity-30 transition-opacity duration-500 ${
                    botState === "idle" ? "opacity-10" : "opacity-40"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow blur-xl opacity-80" />
                </div>

                <div className="z-10 text-white/80 transition-all duration-300 transform">
                  {!isConnected ? (
                    <WifiOff size={48} className="opacity-50" />
                  ) : botState === "processing" ? (
                    <Loader2 size={48} className="animate-spin text-white/50" />
                  ) : botState === "speaking" ? (
                    <Volume2
                      size={48}
                      className="animate-pulse text-blue-300"
                    />
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
            {!isConnected ? (
              <Button onClick={handleConnect}>Connect Model</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={handleDisconnect}>
                  <X size={20} />
                </Button>

                <Button
                  variant={botState === "listening" ? "danger" : "primary"}
                  onClick={toggleRecording}
                  className="min-w-[140px] justify-center"
                >
                  {botState === "listening" ? (
                    <>
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic size={18} />
                      Talk
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
              </>
            )}
          </div>

          {/* Live Caption */}
          {lastMessage && isConnected && !showHistory && (
            <div className="mt-8 max-w-md w-full text-center animate-fade-in px-4">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
                {lastMessage.role}
              </p>
              <p className="text-white/90 text-lg font-light leading-relaxed drop-shadow-md">
                "{lastMessage.text}"
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 3. Modal History */}
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
              {transcript.length === 0 && (
                <div className="text-center text-white/20 py-10">
                  No messages yet.
                </div>
              )}
              {transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`
                          max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm
                          ${
                            msg.role === "user"
                              ? "bg-purple-600 text-white rounded-tr-sm"
                              : msg.role === "bot"
                              ? "bg-slate-800 text-slate-200 rounded-tl-sm border border-white/5"
                              : "bg-transparent text-white/40 text-xs italic w-full text-center border-none shadow-none"
                          }
                       `}
                  >
                    {msg.text}
                  </div>
                  {msg.role !== "system" && (
                    <span className="text-[10px] text-white/30 mt-1 px-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
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
