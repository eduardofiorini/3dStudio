import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { Terminal, Maximize2, X, Plus, FileCode } from 'lucide-react';
import { cn } from '../../utils/cn';
import * as THREE from 'three';
import { executeCode } from '../../utils/codeExecution';
import { CodeFile } from './types';
import { defaultScripts } from './defaultScripts';
import { FileTab } from './FileTab';
import { NewFileForm } from './NewFileForm';
import { Editor } from './Editor';

export function CodePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<CodeFile[]>([
    { id: '1', name: defaultScripts.main.name, content: defaultScripts.main.content },
    { id: '2', name: defaultScripts.demo.name, content: defaultScripts.demo.content }
  ]);
  const [activeFileId, setActiveFileId] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [size, setSize] = useState({ width: 450, height: 350 });
  const [isAddingFile, setIsAddingFile] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const startSizeRef = useRef({ width: 500, height: 350 });
  const [isRunning, setIsRunning] = useState(false);
  const objects = useEditorStore((state) => state.objects);
  const addObject = useEditorStore((state) => state.addObject);
  const selectedObject = useEditorStore((state) => state.selectedObject);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isResizingRef.current = true;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    startSizeRef.current = size;
    document.body.style.userSelect = 'none';
  }, [size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    
    const dx = e.clientX - startPosRef.current.x;
    const dy = startPosRef.current.y - e.clientY;
    
    setSize({
      width: Math.max(500, startSizeRef.current.width + dx),
      height: Math.max(350, startSizeRef.current.height + dy)
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isOpen, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animationFrameId]);

  const activeFile = files.find(f => f.id === activeFileId);

  const handleAddFile = (fileName: string) => {
    let finalName = fileName.trim();
    if (!finalName.endsWith('.js')) {
      finalName += '.js';
    }
    
    if (files.some(f => f.name.toLowerCase() === finalName.toLowerCase())) {
      const baseName = finalName.replace('.js', '');
      let counter = 1;
      while (files.some(f => f.name.toLowerCase() === `${baseName}${counter}.js`.toLowerCase())) {
        counter++;
      }
      finalName = `${baseName}${counter}.js`;
    }
    
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: finalName,
      content: ''
    };
    
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
    setIsAddingFile(false);
  };

  const handleDeleteFile = (id: string) => {
    if (files.length === 1) return;
    setFiles(files.filter(f => f.id !== id));
    if (activeFileId === id) {
      setActiveFileId(files[0].id);
    }
  };

  const updateFileContent = (content: string) => {
    setFiles(files.map(f => 
      f.id === activeFileId ? { ...f, content } : f
    ));
  };

  const handleRunCode = () => {
    if (!activeFile) return;
    setIsRunning(true);
    const success = executeCode(activeFile.content);
    if (!success) {
      setError('Failed to execute code');
    } else {
      setError(null);
    }
    setIsRunning(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gray-800/50 text-gray-300 px-3 py-2 rounded-md text-xs flex items-center gap-2 hover:bg-gray-700/50 transition-colors"
        title="Open Code Panel (Ctrl + `)"
      >
        <Terminal className="w-3.5 h-3.5" />
        <span>Code Editor</span>
      </button>
    );
  }

  return (
    <div 
      ref={resizeRef}
      className="absolute bottom-[4.5rem] left-3 bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-700/50 z-50"
      style={{ width: size.width }}
    >
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-700/50">
        <h3 className="text-sm font-medium text-gray-200">Code Panel</h3>
        <div className="flex items-center gap-1">
          <button
            className="p-1 hover:bg-gray-700/50 rounded text-gray-400 cursor-nw-resize"
            onMouseDown={handleMouseDown}
            title="Resize"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-gray-700/50 rounded text-gray-400"
            title="Minimize (Ctrl + `)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-1 px-1 py-1 border-b border-gray-700/50 overflow-x-auto">
        {files.map(file => (
          <FileTab
            key={file.id}
            file={file}
            isActive={activeFileId === file.id}
            onSelect={() => setActiveFileId(file.id)}
            onDelete={() => handleDeleteFile(file.id)}
          />
        ))}
        
        {isAddingFile ? (
          <NewFileForm
            onSubmit={handleAddFile}
            onCancel={() => setIsAddingFile(false)}
          />
        ) : (
          <button
            onClick={() => setIsAddingFile(true)}
            className="p-1 hover:bg-gray-700/50 rounded text-gray-500"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="p-2">
        <Editor
          content={activeFile?.content ?? ''}
          onChange={updateFileContent}
          height={size.height}
        />
        {error && (
          <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
            {error}
          </div>
        )}
      </div>
      
      <div className="p-2 border-t border-gray-700/50">
        <button
          onClick={handleRunCode}
          className={cn(
            "w-full py-1.5 rounded text-sm transition-colors relative",
            isRunning 
              ? "bg-green-500 text-white" 
              : "bg-blue-500 hover:bg-blue-600 text-white"
          )}
          disabled={isRunning}
        >
          {isRunning ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-pulse">Running...</span>
            </span>
          ) : (
            <span>Run {activeFile?.name}</span>
          )}
        </button>
      </div>
    </div>
  );
}