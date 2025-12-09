import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import InputArea from './components/InputArea';
import ArtifactView from './components/ArtifactView';
import * as Icons from './components/Icons';
import { sendMessageToGemini } from './services/geminiService';
import { ChatState, GeminiModel, Message } from './types';

const INITIAL_ARTIFACT = {
  title: 'AstraMind Landing Page',
  type: 'preview' as const,
  content: 'Initial Mock'
};

function App() {
  const [state, setState] = useState<ChatState>({
    messages: [
      {
        id: '1',
        role: 'model',
        content: 'I\'ve created the initial landing page structure for AstraMind. You can see the hero section, navigation, and primary call-to-actions based on the "Modern SaaS" theme.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        modelName: GeminiModel.PRO,
        artifact: INITIAL_ARTIFACT
      }
    ],
    isLoading: false,
    selectedModel: GeminiModel.PRO
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages]);

  const handleSend = async (text: string) => {
    // Optimistic UI Update
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg],
      isLoading: true
    }));

    // Prepare history for API
    const history = state.messages.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    // Call API
    const responseText = await sendMessageToGemini(text, state.selectedModel, history);

    const modelMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: responseText,
      timestamp: new Date().toISOString(),
      modelName: state.selectedModel
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, modelMsg],
      isLoading: false
    }));
  };

  const handleModelChange = (model: GeminiModel) => {
    setState(prev => ({ ...prev, selectedModel: model }));
  };

  return (
    <div className="flex flex-col h-screen bg-background text-primary overflow-hidden font-sans selection:bg-zinc-700 selection:text-white">
      <Header />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto w-full">
            <div className="max-w-4xl mx-auto w-full px-4 pt-8 pb-32 space-y-8">
                
                {state.messages.map((msg, index) => (
                    <div key={msg.id} className={`flex flex-col gap-3 group ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        
                        {/* Artifact Display (Only for specific model messages or initial one) */}
                        {msg.artifact && (
                            <div className="w-full mb-2">
                                <ArtifactView data={msg.artifact} />
                            </div>
                        )}

                        {/* Message Bubble */}
                        {msg.role === 'model' ? (
                           <div className="w-full">
                               {/* Model text content */}
                               <div className="text-base text-zinc-300 leading-relaxed mb-3">
                                   {msg.content}
                               </div>
                               
                               {/* Suggestions / Follow ups (Static for UI Demo based on image) */}
                               {index === 0 && (
                                   <div className="space-y-3 mt-4">
                                       <p className="font-medium text-sm text-zinc-200">How would you like to change this page?</p>
                                       <ul className="space-y-2">
                                           <li className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors">
                                               <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
                                               "Change this page to features"
                                           </li>
                                           <li className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors">
                                               <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full"></div>
                                               "Adapt this page to a pricing page with pricing, comparison table, testimonials and FAQ"
                                           </li>
                                       </ul>
                                   </div>
                               )}

                               {/* Metadata Footer */}
                               <div className="flex items-center gap-3 mt-3 text-[11px] text-zinc-600 font-medium select-none">
                                    <div className="flex items-center gap-1.5">
                                        <Icons.Bot size={12} />
                                        <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div className="w-0.5 h-0.5 bg-zinc-700 rounded-full"></div>
                                    <span className="text-zinc-500 uppercase tracking-wider">{msg.modelName || state.selectedModel}</span>
                                    
                                    <div className="flex items-center gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="hover:text-zinc-300"><Icons.Copy size={12} /></button>
                                        <button className="hover:text-red-400"><Icons.Trash2 size={12} /></button>
                                    </div>
                               </div>
                           </div>
                        ) : (
                           /* User Message */
                           <div className="bg-zinc-800/50 px-4 py-2.5 rounded-2xl rounded-tr-sm text-base text-zinc-200 max-w-[80%]">
                               {msg.content}
                           </div>
                        )}
                    </div>
                ))}

                {state.isLoading && (
                    <div className="flex items-center gap-2 text-zinc-500 text-sm animate-pulse">
                        <Icons.Sparkles size={14} className="animate-spin" />
                        Thinking...
                    </div>
                )}
            </div>
        </div>

        {/* Floating Input Area (Positioned absolute bottom) */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent pt-10 z-20">
            <InputArea 
                onSend={handleSend} 
                isLoading={state.isLoading}
                selectedModel={state.selectedModel}
                onModelChange={handleModelChange}
            />
        </div>
      </main>
    </div>
  );
}

export default App;