import React, { useState, useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import Editor from "@monaco-editor/react";
import { Volume2, VolumeX } from "lucide-react";

// Interface for commit data from API
interface CommitChange {
  type: "add" | "remove" | "context";
  line: number;
  content: string;
}

interface CommitData {
  author: string;
  date: string;
  message: string;
  ai_comment: string;
  changes: CommitChange[];
}

// Define the interface for the code chunk with comment
interface CodeChunk {
  code: string;
  type: "add" | "remove" | "context"; // Track if line is being added or removed
  comment?: string;
  user?: {
    name: string;
    avatar?: string;
  };
  date?: string;
  commitMessage?: string;
  line?: number; // Line number in the file
}

// Props interface for the TypingCodeEditor component
interface TypingCodeEditorProps {
  commitData?: CommitData[]; // API data format
  codeChunks?: CodeChunk[]; // Original format (for backward compatibility)
  typingSpeed?: number; // Characters per second
  initialDelay?: number; // Delay before starting typing in ms
  language?: string; // Programming language for syntax highlighting
  theme?: "vs-dark" | "light";
  className?: string;
  githubUrl?: string; // GitHub URL to determine file extension
  soundEnabled?: boolean; // Whether sounds are initially enabled
}

const TypingCodeEditor: React.FC<TypingCodeEditorProps> = ({
  commitData = [],
  codeChunks = [],
  typingSpeed = 20,
  initialDelay = 500,
  language = "javascript",
  theme = "vs-dark",
  className = "",
  githubUrl = "",
  soundEnabled = true,
}) => {
  // Using refs to track state without causing re-renders
  const processedRef = useRef<boolean>(false);
  const dataIdRef = useRef<string>("");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  
  // Sound effect refs
  const typingSoundRef = useRef<HTMLAudioElement | null>(null);
  const deleteSoundRef = useRef<HTMLAudioElement | null>(null);
  const returnSoundRef = useRef<HTMLAudioElement | null>(null);
  
  // State variables
  const [fileLines, setFileLines] = useState<string[]>([]);
  const [currentCommitIndex, setCurrentCommitIndex] = useState(0);
  const [currentChangeIndex, setCurrentChangeIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [processedCommits, setProcessedCommits] = useState<{
    changes: CodeChunk[], 
    metadata: {
      author: string;
      date: string;
      message: string;
      comment: string;
      avatar?: string;
    }
  }[]>([]);
  const [activeCommit, setActiveCommit] = useState<{
    author: string;
    date: string;
    message: string;
    comment: string;
    avatar?: string;
  } | null>(null);
  const editorHeight = "500px";
  const [detectedLanguage, setDetectedLanguage] = useState(language);
  const [soundOn, setSoundOn] = useState(soundEnabled);
  const [volume, setVolume] = useState(0.3); // Default volume level
  

  // Initialize sound effects
  useEffect(() => {
    // Create audio elements
    typingSoundRef.current = new Audio("/sounds/keypress.mp3");
    deleteSoundRef.current = new Audio("/sounds/delete.mp3");
    returnSoundRef.current = new Audio("/sounds/return.mp3");
    
    // Set volumes
    if (typingSoundRef.current) typingSoundRef.current.volume = volume;
    if (deleteSoundRef.current) deleteSoundRef.current.volume = volume;
    if (returnSoundRef.current) returnSoundRef.current.volume = volume;
    
    return () => {
      // Clean up
      typingSoundRef.current = null;
      deleteSoundRef.current = null;
      returnSoundRef.current = null;
    };
  }, []);

  // Update volume when changed
  useEffect(() => {
    if (typingSoundRef.current) typingSoundRef.current.volume = volume;
    if (deleteSoundRef.current) deleteSoundRef.current.volume = volume;
    if (returnSoundRef.current) returnSoundRef.current.volume = volume;
  }, [volume]);

  // Play sound function
  const playSound = (type: 'type' | 'delete' | 'return') => {
    if (!soundOn) return;
    
    try {
      if (type === 'type' && typingSoundRef.current) {
        // Clone the audio element to allow rapid succession of sounds
        const sound = typingSoundRef.current.cloneNode(true) as HTMLAudioElement;
        sound.volume = volume;
        sound.play().catch(e => console.log("Error playing sound:", e));
      } else if (type === 'delete' && deleteSoundRef.current) {
        const sound = deleteSoundRef.current.cloneNode(true) as HTMLAudioElement;
        sound.volume = volume;
        sound.play().catch(e => console.log("Error playing sound:", e));
      } else if (type === 'return' && returnSoundRef.current) {
        returnSoundRef.current.play().catch(e => console.log("Error playing sound:", e));
      }
    } catch (error) {
      console.error("Failed to play sound effect:", error);
    }
  };

  // Detect language from GitHub URL or file extension
  useEffect(() => {
    if (githubUrl) {
      const extension = githubUrl.split('.').pop()?.toLowerCase();
      
      const languageMap: { [key: string]: string } = {
        'js': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'jsx': 'javascript',
        'py': 'python',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'cs': 'csharp',
        'go': 'go',
        'rb': 'ruby',
        'php': 'php',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown',
        'sql': 'sql',
        'sh': 'shell',
        'bash': 'shell',
        'yml': 'yaml',
        'yaml': 'yaml',
        'xml': 'xml',
        'dart': 'dart',
        'swift': 'swift',
        'kt': 'kotlin',
        'rs': 'rust'
      };
      
      if (extension && languageMap[extension]) {
        setDetectedLanguage(languageMap[extension]);
      }
    }
  }, [githubUrl]);

  // Generate a unique ID for the current data to detect changes
  const currentDataId = JSON.stringify(commitData) + JSON.stringify(codeChunks);

  // Handle editor mounting
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Set up any editor configurations here
    editor.updateOptions({
      readOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      fontSize: 14,
      fontFamily: 'Consolas, "Courier New", monospace',
    });
  };

  // Process commit data into organized changes - only when data changes
  useEffect(() => {
    // Skip if data hasn't changed
    if (dataIdRef.current === currentDataId) {
      return;
    }
    
    // Update the ref to prevent reprocessing the same data
    dataIdRef.current = currentDataId;
    
    // Reset state for new data
    setFileLines([]);
    setCurrentCommitIndex(0);
    setCurrentChangeIndex(0);
    setCurrentCharIndex(0);
    setIsTyping(false);
    setActiveCommit(null);
    processedRef.current = false;
    
    if (commitData && commitData.length > 0) {
      // Transform API data into processed commits
      const processedData = commitData.map(commit => {
        const commitChanges: CodeChunk[] = commit.changes?.map(change => ({
          code: change.content,
          type: change.type,
          line: change.line
        })) || [{
          code: "# No code changes in this commit",
          type: "context",
          line: 1
        }];
        
        return {
          changes: commitChanges,
          metadata: {
            author: commit.author,
            date: commit.date,
            message: commit.message,
            comment: commit.ai_comment !== "DUMMY COMMENT" ? commit.ai_comment : "",
            avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${commit.author.replace(/\s+/g, '')}`
          }
        };
      });
      
      setProcessedCommits(processedData);
    } else if (codeChunks && codeChunks.length > 0) {
      // Legacy support for code chunks format
      // Group code chunks into "commits" for compatibility
      const processedData = [{
        changes: codeChunks.map(chunk => ({
          ...chunk,
          type: chunk.type || "add" // Default to "add" for backward compatibility
        })),
        metadata: {
          author: codeChunks[0].user?.name || "Unknown",
          date: codeChunks[0].date || new Date().toISOString(),
          message: codeChunks[0].commitMessage || "Code changes",
          comment: codeChunks[0].comment || "",
          avatar: codeChunks[0].user?.avatar
        }
      }];
      
      setProcessedCommits(processedData);
    }
  }, [commitData, codeChunks, currentDataId]);

  // Initialize typing animation - only once per data set
  useEffect(() => {
    if (!processedCommits.length || processedRef.current) return;
    
    // Mark as processed to prevent multiple initializations
    processedRef.current = true;
    
    const startTyping = () => {
      setIsTyping(true);
      
      // Set the first commit's metadata as active
      if (processedCommits.length > 0) {
        setActiveCommit(processedCommits[0].metadata);
      }
    };

    // Start with initial delay
    const initialTimer = setTimeout(startTyping, initialDelay);
    
    return () => {
      clearTimeout(initialTimer);
    };
  }, [processedCommits, initialDelay]);

  // Apply a single character of the current change
  const applyNextCharacter = () => {
    if (currentCommitIndex >= processedCommits.length) return;
    
    const currentCommit = processedCommits[currentCommitIndex];
    const changes = currentCommit.changes;
    
    if (currentChangeIndex >= changes.length) {
      // Move to the next commit
      const nextCommitIndex = currentCommitIndex + 1;
      if (nextCommitIndex < processedCommits.length) {
        setCurrentCommitIndex(nextCommitIndex);
        setCurrentChangeIndex(0);
        setCurrentCharIndex(0);
        setActiveCommit(processedCommits[nextCommitIndex].metadata);
      }
      return;
    }
    
    const currentChange = changes[currentChangeIndex];
    
    if (currentChange.type === "add") {
      if (currentCharIndex === 0) {
        // First character of a new line being added
        const newLines = [...fileLines];
        const lineIndex = currentChange.line ? currentChange.line - 1 : newLines.length;
        
        // Insert an empty string at the line position
        newLines.splice(lineIndex, 0, "");
        setFileLines(newLines);
        
        // Play return sound for a new line
        playSound('return');
      }
      
      if (currentCharIndex < currentChange.code.length) {
        // Add the next character to the line
        setFileLines(prevLines => {
          const newLines = [...prevLines];
          const lineIndex = currentChange.line ? currentChange.line - 1 : 0;
          newLines[lineIndex] = currentChange.code.substring(0, currentCharIndex + 1);
          return newLines;
        });
        
        // Play typing sound
        playSound('type');
        
        setCurrentCharIndex(currentCharIndex + 1);
      } else {
        // Done with this change, move to the next one
        setCurrentChangeIndex(currentChangeIndex + 1);
        setCurrentCharIndex(0);
      }
    } else if (currentChange.type === "remove") {
      if (currentCharIndex === 0) {
        // Start removing characters from end to beginning
        setCurrentCharIndex(currentChange.code.length);
      } else if (currentCharIndex > 0) {
        // Remove one character at a time
        setFileLines(prevLines => {
          const newLines = [...prevLines];
          const lineIndex = currentChange.line ? currentChange.line - 1 : 0;
          
          if (lineIndex < newLines.length) {
            newLines[lineIndex] = currentChange.code.substring(0, currentCharIndex - 1);
            
            // If we've removed all characters, remove the line
            if (currentCharIndex === 1) {
              newLines.splice(lineIndex, 1);
            }
          }
          
          return newLines;
        });
        
        // Play delete sound
        playSound('delete');
        
        setCurrentCharIndex(currentCharIndex - 1);
      }
      
      // If we're done removing (reached the beginning)
      if (currentCharIndex === 1) {
        setCurrentChangeIndex(currentChangeIndex + 1);
        setCurrentCharIndex(0);
      }
    } else {
      // Context line (just keep it as is)
      if (currentCharIndex === 0) {
        setFileLines(prevLines => {
          const newLines = [...prevLines];
          const lineIndex = currentChange.line ? currentChange.line - 1 : newLines.length;
          
          // Add the context line if it doesn't already exist
          if (lineIndex >= newLines.length) {
            newLines.push(currentChange.code);
          } else {
            newLines[lineIndex] = currentChange.code;
          }
          
          return newLines;
        });
        
        // Move to the next change
        setCurrentChangeIndex(currentChangeIndex + 1);
      }
    }
    
    // Scroll to the current position
    if (editorRef.current) {
      const currentLine = currentChange.line || fileLines.length;
      editorRef.current.revealLineInCenter(currentLine);
    }
  };

  // Handle the typing animation
  useEffect(() => {
    if (!isTyping || currentCommitIndex >= processedCommits.length) return;
    
    const typingInterval = 1000 / typingSpeed;
    
    const timer = setTimeout(() => {
      applyNextCharacter();
    }, typingInterval);
    
    return () => clearTimeout(timer);
  }, [isTyping, currentCommitIndex, currentChangeIndex, currentCharIndex, processedCommits, fileLines, typingSpeed]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const toggleSound = () => {
    setSoundOn(!soundOn);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  if (processedCommits.length === 0) {
    return (
      <div className={`rounded-md overflow-hidden ${className}`}>
        <div className={`p-4 ${theme === 'vs-dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
          <div className="text-center p-4">No code changes to display</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Sound controls */}
      <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
        <button 
          onClick={toggleSound}
          className={`p-2 rounded-full ${theme === 'vs-dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'}`}
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
        
        {soundOn && (
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20"
          />
        )}
      </div>
      
      {/* Code Editor */}
      <div className={`rounded-md overflow-hidden flex-grow ${className}`}>
        <div className={`code-editor-container ${theme === 'vs-dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
          {/* Monaco Editor */}
          <Editor
            height={editorHeight}
            theme={theme}
            language={detectedLanguage}
            value={fileLines.join('\n')}
            onMount={handleEditorDidMount}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on'
            }}
          />
        </div>
      </div>
      
      {/* Comment Card - Fixed position on the right side */}
      {isTyping && activeCommit && (
        <div className="w-80 md:w-96 flex-shrink-0">
          <div 
            className={`p-4 rounded-md shadow-md ${theme === 'vs-dark' ? 'bg-gray-800' : 'bg-white'}`}
            style={{ 
              position: 'sticky',
              top: '20px',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center text-sm font-semibold">
                {activeCommit.avatar ? (
                  <img src={activeCommit.avatar} alt={activeCommit.author || "User"} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-700">
                    {getInitials(activeCommit.author)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold">{activeCommit.author}</div>
                  <div className="text-xs text-gray-400">{formatDate(activeCommit.date)}</div>
                </div>
                
                <div className="mb-3 font-semibold text-sm text-blue-400">
                  {activeCommit.message}
                </div>
                
                {activeCommit.comment && (
                  <div className={`${theme === 'vs-dark' ? 'bg-gray-700/30 text-gray-300' : 'bg-gray-100 text-gray-700'} rounded p-2 text-sm`}>
                    {activeCommit.comment}
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-400">
                  Commit {currentCommitIndex + 1} of {processedCommits.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Audio elements for sound effects (preload) */}
      <audio src="/sounds/keypress.mp3" preload="auto" style={{ display: 'none' }} />
      <audio src="/sounds/delete.mp3" preload="auto" style={{ display: 'none' }} />
      <audio src="/sounds/return.mp3" preload="auto" style={{ display: 'none' }} />
    </div>
  );
};

export default TypingCodeEditor;