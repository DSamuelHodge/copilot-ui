import React, { useState, useRef, useEffect } from 'react';
import * as Icons from './Icons';
import { ArtifactData } from '../types';

interface ArtifactViewProps {
  data: ArtifactData;
}

interface CodeVersion {
  id: string;
  timestamp: number;
  content: string;
  label?: string;
}

const ArtifactView: React.FC<ArtifactViewProps> = ({ data }) => {
  // Initial Code Snippet
  const INITIAL_CODE = `import React from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';

export default function AstraMindLanding() {
  return (
    <div className="bg-white min-h-screen font-sans text-slate-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <span className="font-bold text-xl tracking-tight">AstraMind</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-indigo-600">Features</a>
          <a href="#" className="hover:text-indigo-600">Pricing</a>
          <a href="#" className="hover:text-indigo-600">Solutions</a>
          <a href="#" className="hover:text-indigo-600">Contact</a>
        </div>

        <button className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
          Get Started <ArrowUp className="rotate-90 w-3.5 h-3.5" />
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center pt-20 pb-12 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-8 border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5" /> 
          AI automation for product teams
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight max-w-4xl leading-[1.1]">
          Custom AI workflows <br/> 
          built for <span className="text-indigo-600">ambitious teams</span>
        </h1>

        <p className="text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed">
          Automate your product development lifecycle with intelligent agents 
          that understand your codebase and business logic.
        </p>

        <div className="flex items-center gap-4">
          <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold text-base hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
            Start Building Free
          </button>
          <button className="bg-white text-slate-700 border border-gray-200 px-8 py-3.5 rounded-full font-semibold text-base hover:bg-gray-50 transition-colors">
            Book a Demo
          </button>
        </div>
      </main>
    </div>
  );
}`;

  const [code, setCode] = useState(INITIAL_CODE);
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Full Screen & Layout State
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [height, setHeight] = useState(500);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Version History State
  const [versions, setVersions] = useState<CodeVersion[]>([
    { id: 'initial', timestamp: Date.now(), content: INITIAL_CODE, label: 'Initial Generation' }
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  // Resize Handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newHeight = Math.max(300, Math.min(800, height + e.movementY));
        setHeight(newHeight);
      }
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, height]);

  // Click outside listener for history dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async () => {
    if (isCopied) return;
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const handleSaveTemplate = () => {
    if (isSaving) return;
    setIsSaving(true);
    
    // Add to version history
    const newVersion: CodeVersion = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      content: code,
      label: `Version ${versions.length + 1}`
    };
    setVersions([newVersion, ...versions]);

    setTimeout(() => setIsSaving(false), 800);
  };

  const handleRevert = (version: CodeVersion) => {
    setCode(version.content);
    setShowHistory(false);
  };

  const handleExportPng = () => {
    if (isExporting) return;
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleRun = () => {
    if (isRunning) return;
    setIsRunning(true);
    // Simulate compilation/execution
    setTimeout(() => {
        setIsRunning(false);
        setViewMode('preview');
    }, 1000);
  };

  const toggleFullScreen = () => {
    if (isCollapsed) setIsCollapsed(false);
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
        setViewMode('code');
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (isFullScreen && !isCollapsed) {
        setIsFullScreen(false);
    }
  };

  // Syntax Highlighter (Simple regex-based for display)
  const highlightLine = (line: string) => {
     let encoded = line
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;");

     const commentIdx = encoded.indexOf('//');
     let commentHtml = '';
     if (commentIdx !== -1) {
         commentHtml = `<span class="text-zinc-500 italic">${encoded.substring(commentIdx)}</span>`;
         encoded = encoded.substring(0, commentIdx);
     }
     if (encoded.trim().startsWith('{/*')) {
        return `<span class="text-zinc-500 italic">${encoded}</span>`;
     }
     encoded = encoded.replace(/(['"])(.*?)\1/g, '<span class="text-emerald-400">$1$2$1</span>');
     const keywords = /\b(import|from|export|default|function|return|const|let|var|if|else|switch|case|break|interface|type)\b/g;
     encoded = encoded.replace(keywords, '<span class="text-purple-400">$1</span>');
     encoded = encoded.replace(/\b([A-Z][a-zA-Z0-9]+)\b/g, '<span class="text-yellow-200">$1</span>');
     encoded = encoded.replace(/&lt;(\/?)(\w+)/g, '&lt;$1<span class="text-blue-400">$2</span>');
     encoded = encoded.replace(/\b([a-zA-Z-]+)=/g, '<span class="text-sky-300">$1</span>=');
     encoded = encoded.replace(/([{}])/g, '<span class="text-yellow-500">$1</span>');

     return encoded + commentHtml;
  };

  // Calculate container classes based on full screen mode
  const containerClasses = isFullScreen 
    ? "fixed inset-0 z-50 bg-[#09090b] flex flex-col transition-all duration-300"
    : "w-full max-w-4xl mx-auto rounded-xl border border-border bg-black/40 overflow-hidden shadow-2xl mb-4 ring-1 ring-white/5 flex flex-col transition-all duration-75 relative";

  const contentHeightStyle = isFullScreen ? { height: '100%' } : { height: `${height}px` };

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Artifact Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-surface/80 backdrop-blur-sm select-none">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 group">
            {/* Fake Traffic Lights - Now Interactive */}
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50 group-hover:bg-red-500 transition-colors cursor-pointer" title="Close"></div>
            <div 
                className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50 group-hover:bg-yellow-500 transition-colors cursor-pointer" 
                onClick={toggleCollapse}
                title={isCollapsed ? "Expand" : "Collapse"}
            ></div>
            <div 
                className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50 group-hover:bg-green-500 transition-colors cursor-pointer" 
                onClick={toggleFullScreen}
                title="Toggle Full Screen"
            ></div>
          </div>
          <span className="text-xs text-zinc-400 font-medium font-mono">landing-page.tsx</span>
          
          {/* Version History Dropdown */}
          <div className="relative ml-2" ref={historyRef}>
            <button 
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-medium transition-colors ${showHistory ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}`}
            >
                <Icons.History size={12} />
                <span>v{versions.length}</span>
            </button>
            
            {showHistory && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#121214] border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Version History</span>
                        <span className="text-[10px] text-zinc-600">{versions.length} versions</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {versions.map((v, i) => (
                            <button 
                                key={v.id}
                                onClick={() => handleRevert(v)}
                                className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-white/5 text-left group transition-colors border-b border-white/5 last:border-0"
                            >
                                <div className={`mt-0.5 p-1 rounded-full ${i === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {i === 0 ? <Icons.Check size={10} /> : <Icons.RotateCcw size={10} />}
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-zinc-300 group-hover:text-white transition-colors">{v.label}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Icons.Clock size={10} className="text-zinc-600" />
                                        <span className="text-[10px] text-zinc-500">{new Date(v.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
            {/* Actions */}
            {!isCollapsed && (
                <>
                    <button 
                      onClick={handleSaveTemplate}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          isSaving ? 'text-blue-400 bg-blue-400/10' : 'text-secondary hover:bg-white/5'
                      }`}
                      title="Save Version"
                    >
                      {isSaving ? <Icons.Check size={14} /> : <Icons.Save size={14} />}
                      <span className="hidden sm:inline">{isSaving ? 'Saved' : 'Save'}</span>
                    </button>

                    <button 
                      onClick={handleExportPng}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          isExporting ? 'text-indigo-400 bg-indigo-400/10' : 'text-secondary hover:bg-white/5'
                      }`}
                      title="Export as PNG"
                    >
                      {isExporting ? <Icons.Sparkles size={14} className="animate-spin" /> : <Icons.Download size={14} />}
                      <span className="hidden sm:inline">Export</span>
                    </button>

                    <div className="w-px h-4 bg-border mx-1"></div>

                    <button 
                      onClick={handleCopy}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          isCopied ? 'text-green-400 bg-green-400/10' : 'text-secondary hover:bg-white/5'
                      }`}
                      title="Copy Code"
                    >
                      {isCopied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
                      <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button 
                      onClick={handleRun}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                          isRunning ? 'text-blue-400 bg-blue-400/10' : 'text-secondary hover:bg-white/5'
                      }`}
                      title="Run Code"
                    >
                      {isRunning ? <Icons.Sparkles size={14} className="animate-spin" /> : <Icons.Play size={14} />}
                      <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
                    </button>
                    
                    <div className="w-px h-4 bg-border mx-1"></div>
                    
                    <div className="flex bg-surface rounded-md border border-border p-0.5">
                        <button 
                          onClick={() => setViewMode('preview')}
                          className={`px-3 py-1 text-xs font-medium rounded-sm transition-all flex items-center gap-1.5 ${viewMode === 'preview' ? 'bg-zinc-700 text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
                        >
                          <Icons.Eye size={12} />
                          Preview
                        </button>
                        <button 
                          onClick={() => setViewMode('code')}
                          className={`px-3 py-1 text-xs font-medium rounded-sm transition-all flex items-center gap-1.5 ${viewMode === 'code' ? 'bg-zinc-700 text-white shadow-sm' : 'text-secondary hover:text-primary'}`}
                        >
                          <Icons.Code size={12} />
                          Code
                        </button>
                    </div>

                    <div className="w-px h-4 bg-border mx-1"></div>
                </>
            )}

            <button 
                onClick={toggleFullScreen}
                className={`p-1.5 rounded-md text-secondary hover:text-primary hover:bg-white/5 transition-colors ${isFullScreen ? 'bg-white/10 text-white' : ''}`}
                title={isFullScreen ? "Minimize" : "Maximize Editor"}
            >
                {isFullScreen ? <Icons.Minimize2 size={14} /> : <Icons.Maximize2 size={14} />}
            </button>

            <button 
                onClick={toggleCollapse}
                className="p-1.5 rounded-md text-secondary hover:text-primary hover:bg-white/5 transition-colors"
                title={isCollapsed ? "Expand" : "Collapse"}
            >
                {isCollapsed ? <Icons.ChevronDown size={14} /> : <Icons.ChevronUp size={14} />}
            </button>
        </div>
      </div>

      {/* Artifact Content */}
      {!isCollapsed && (
        <div style={contentHeightStyle} className="w-full bg-white overflow-hidden relative group transition-all duration-300">
          {viewMode === 'preview' ? (
            <div className="w-full h-full bg-white text-black overflow-y-auto scrollbar-hide">
              {/* Mock AstraMind Page - Static Preview */}
              <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">A</div>
                      <span className="font-bold text-xl tracking-tight text-slate-900">AstraMind</span>
                  </div>
                  <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                      <a href="#" className="hover:text-indigo-600">Features</a>
                      <a href="#" className="hover:text-indigo-600">Pricing</a>
                      <a href="#" className="hover:text-indigo-600">Solutions</a>
                      <a href="#" className="hover:text-indigo-600">Contact</a>
                  </div>
                  <button className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2">
                      Get Started <Icons.ArrowUp className="rotate-90" size={14} />
                  </button>
              </nav>
              
              <main className="flex flex-col items-center justify-center pt-20 pb-12 px-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold mb-8 border border-indigo-100">
                      <Icons.Sparkles size={14} /> AI automation for product teams
                  </div>
                  <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight max-w-4xl leading-[1.1]">
                      Custom AI workflows <br/> built for <span className="text-indigo-600">ambitious teams</span>
                  </h1>
                  <p className="text-lg text-slate-500 max-w-2xl mb-10 leading-relaxed">
                      Automate your product development lifecycle with intelligent agents that understand your codebase and business logic.
                  </p>
                  <div className="flex items-center gap-4">
                      <button className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold text-base hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
                          Start Building Free
                      </button>
                      <button className="bg-white text-slate-700 border border-gray-200 px-8 py-3.5 rounded-full font-semibold text-base hover:bg-gray-50 transition-colors">
                          Book a Demo
                      </button>
                  </div>
              </main>
            </div>
          ) : (
            <div className="w-full h-full bg-[#0d1117] flex flex-col">
              {/* Edit Mode Warning/Info */}
              {isFullScreen && (
                  <div className="bg-blue-500/10 text-blue-400 text-xs px-4 py-2 border-b border-blue-500/20 flex items-center gap-2">
                      <Icons.PenTool size={12} />
                      <span>Editing Mode Active. Changes are saved to local version history.</span>
                  </div>
              )}

              <div className="relative flex-1 overflow-auto">
                  {/* 
                      If Full Screen, we show an actual textarea for editing.
                      If Small view, we show the pretty highlighted code for readability.
                  */}
                  {isFullScreen ? (
                      <textarea
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          className="w-full h-full bg-[#0d1117] text-zinc-300 font-mono text-[13px] leading-6 p-4 resize-none outline-none focus:ring-0 border-none"
                          spellCheck={false}
                      />
                  ) : (
                      <div className="min-w-full inline-block font-mono text-[13px] leading-6 py-4 text-left">
                          {code.split('\n').map((line, i) => (
                              <div key={i} className="flex hover:bg-white/5 group/line px-4">
                                  <div className="w-8 text-right pr-4 select-none text-zinc-600 text-[11px] opacity-50 group-hover/line:opacity-100 group-hover/line:text-zinc-400 font-mono">
                                      {i + 1}
                                  </div>
                                  <div className="flex-1 pl-0 text-zinc-300 whitespace-pre break-all" dangerouslySetInnerHTML={{ __html: highlightLine(line) || ' ' }} />
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Resize Handle (Only visible when NOT full screen and NOT collapsed) */}
      {!isFullScreen && !isCollapsed && (
        <div 
            className="w-full h-2 bg-surface hover:bg-zinc-700 cursor-ns-resize flex items-center justify-center transition-colors border-t border-border"
            onMouseDown={handleMouseDown}
        >
            <div className="w-12 h-1 rounded-full bg-zinc-600/50"></div>
        </div>
      )}
    </div>
  );
};

export default ArtifactView;