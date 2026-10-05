'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  History,
  X,
  Send,
  ChevronDown,
  Globe,
  Lock,
  Wrench,
  Bot,
  AtSign,
  Slash,
  Code,
} from 'lucide-react';
import type { ChatMessage, ApiClientRequest } from '@/types/api-client';

export interface ApiClientAIPanelProps {
  isOpen: boolean;
  activeRequest?: ApiClientRequest;
  onClose: () => void;
  onApplyAiPayload?: (body: string, method?: string, url?: string) => void;
}

const INITIAL_AI_MESSAGE: ChatMessage = {
  id: '1',
  sender: 'ai',
  text: 'The assistant is not connected to an AI service yet, so it cannot answer. Messages you send stay in this panel only.',
  timestamp: Date.now(),
};

export const ApiClientAIPanel: React.FC<ApiClientAIPanelProps> = ({
  isOpen,
  onClose,
  onApplyAiPayload,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_AI_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [modelMode] = useState('Auto');

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    // No AI service is wired in: say so at once, rather than "think" and
    // return canned answers dressed as generated ones.
    setMessages((prev) => [
      ...prev,
      userMsg,
      {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Not connected: no AI service is configured for this assistant, so there is no answer to show.',
        timestamp: Date.now(),
      },
    ]);
    setInputText('');
  };

  const handleQuickApply = (msgText: string) => {
    if (!onApplyAiPayload) return;
    if (msgText.includes('{')) {
      const jsonMatch = msgText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        onApplyAiPayload(jsonMatch[0]);
      }
    }
  };

  return (
    <aside className="w-80 bg-white border-l border-border flex flex-col shrink-0 text-xs text-foreground h-full overflow-hidden select-none">
      {/* Top AI Panel Header */}
      <div className="p-3 border-b border-border flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-beak/10 border border-beak/30 flex items-center justify-center text-primary">
            <Sparkles className="h-3 w-3" />
          </div>
          <span className="font-bold text-xs text-foreground">XG AI Assistant</span>
        </div>

        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            onClick={() => setMessages([])}
            className="p-1 hover:bg-muted hover:text-foreground rounded transition cursor-pointer"
            title="Start New Chat"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 hover:bg-muted hover:text-foreground rounded transition cursor-pointer" title="Chat History">
            <History className="h-3.5 w-3.5" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-muted hover:text-foreground rounded transition cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 text-xs ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex gap-2 items-start max-w-full">
              {msg.sender === 'ai' && (
                <div className="w-5 h-5 rounded bg-beak/10 text-primary flex items-center justify-center shrink-0 mt-0.5 border border-beak/30">
                  <Bot className="h-3 w-3" />
                </div>
              )}
              <div
                className={`p-2.5 rounded-lg leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground shadow-2xs'
                    : 'bg-white text-foreground border border-border shadow-2xs'
                }`}
              >
                {msg.text}
              </div>
            </div>

            {msg.sender === 'ai' && msg.text.includes('{') && onApplyAiPayload && (
              <button
                onClick={() => handleQuickApply(msg.text)}
                className="ml-7 px-2 py-0.5 bg-beak/10 hover:bg-beak/20 text-primary border border-beak/30 rounded text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Code className="h-3 w-3" /> Apply Payload to Workbench
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="p-3 border-t border-border bg-white space-y-2">
        <div className="relative bg-white border border-border rounded-lg p-2 focus-within:border-ring transition shadow-2xs">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe what you need. Press @ for context, / for Skills."
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground resize-none outline-none"
          />

          <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
              <button className="flex items-center gap-1 px-2 py-0.5 bg-muted hover:bg-muted/80 rounded text-foreground font-medium transition cursor-pointer border border-border">
                <span>{modelMode}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <span className="flex items-center gap-0.5 hover:text-foreground cursor-pointer">
                <AtSign className="h-3 w-3" /> context
              </span>
              <span className="flex items-center gap-0.5 hover:text-foreground cursor-pointer">
                <Slash className="h-3 w-3" /> skills
              </span>
            </div>

            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="p-1.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-bold rounded transition shadow cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border bg-slate-50 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 hover:text-foreground transition cursor-pointer">
            <Globe className="h-3 w-3" />
            <span>Globals</span>
          </button>
          <button className="flex items-center gap-1 hover:text-foreground transition cursor-pointer">
            <Lock className="h-3 w-3" />
            <span>Vault</span>
          </button>
          <button className="flex items-center gap-1 hover:text-foreground transition cursor-pointer">
            <Wrench className="h-3 w-3" />
            <span>Tools</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
