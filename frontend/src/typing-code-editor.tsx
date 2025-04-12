import React, { useState, useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useMonaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";

// Interface for commit data from API
interface CommitData {
  author: string;
  date: string;
  message: string;
  patch: string;
  ai_comment: string;
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
}) => {
  // Using refs to track state without causing re-renders
  const processedRef = useRef<boolean>(false);
  const dataIdRef = useRef<string>("");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  
  // State variables
  const [currentText, setCurrentText] = useState<string>("");
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [currentChunkProgress, setCurrentChunkProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [processedCodeChunks, setProcessedCodeChunks] = useState<CodeChunk[]>([]);
  const [activeCommit, setActiveCommit] = useState<{
    author: string;
    date: string;
    message: string;
    comment: string;
    avatar?: string;
  } | null>(null);
  const [editorHeight, setEditorHeight] = useState("500px");
  const [detectedLanguage, setDetectedLanguage] = useState(language);
  
  // Monaco instance
  const monaco = useMonaco();

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

  // Function to parse patch data into individual code chunks with type
  const parsePatchToChunks = (patch: string, commit: CommitData): { line: string; type: "add" | "remove" | "context"; commit: CommitData }[] => {
    const chunks: { line: string; type: "add" | "remove" | "context"; commit: CommitData }[] = [];
    
    // If patch is undefined or null, return empty array
    if (!patch) {
      return chunks;
    }
    
    try {
      // Split the patch by lines
      const patchLines = patch.split('\n');
      
      patchLines.forEach((line) => {
        // Skip patch headers (lines starting with @@)
        if (line.startsWith('@@')) return;
        
        // Process added lines (starting with +)
        if (line.startsWith('+')) {
          // Skip the first + character
          const codeLine = line.substring(1);
          // Don't include the diff header line (+++), but include empty lines
          if (!line.startsWith('+++')) {
            chunks.push({ line: codeLine, type: "add", commit });
          }
        } 
        // Process removed lines (starting with -)
        else if (line.startsWith('-')) {
          // Skip the first - character
          const codeLine = line.substring(1);
          // Don't include the diff header line (---), but include empty lines
          if (!line.startsWith('---')) {
            chunks.push({ line: codeLine, type: "remove", commit });
          }
        }
        // Context lines (no prefix)
        else if (!line.startsWith('diff') && !line.startsWith('index') && !line.startsWith('---') && !line.startsWith('+++')) {
          chunks.push({ line, type: "context", commit });
        }
      });
      
      return chunks;
    } catch (error) {
      console.error("Error parsing patch:", error);
      return [];
    }
  };

  // Process commit data into code chunks format - only when data changes
  useEffect(() => {
    // Skip if data hasn't changed
    if (dataIdRef.current === currentDataId) {
      return;
    }
    
    // Update the ref to prevent reprocessing the same data
    dataIdRef.current = currentDataId;
    
    // Reset state for new data
    setCurrentText("");
    setCurrentChunkIndex(0);
    setCurrentChunkProgress(0);
    setIsTyping(false);
    setActiveCommit(null);
    processedRef.current = false;
    
    if (commitData && commitData.length > 0) {
      // Transform API data into code chunks
      const chunks: CodeChunk[] = [];
      
      commitData.forEach((commit) => {
        // Process patch data
        const patchChunks = parsePatchToChunks(commit.patch, commit);
        
        if (patchChunks.length === 0) {
          // Add at least one chunk for empty patches so we see something
          chunks.push({
            code: "# No code changes in this commit",
            type: "context",
            comment: commit.ai_comment !== "DUMMY COMMENT" ? commit.ai_comment : "",
            user: {
              name: commit.author,
              avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=" + commit.author.replace(/\s+/g, ''),
            },
            date: commit.date,
            commitMessage: commit.message
          });
        } else {
          patchChunks.forEach(chunk => {
            chunks.push({
              code: chunk.line,
              type: chunk.type,
              comment: chunk.commit.ai_comment !== "DUMMY COMMENT" ? chunk.commit.ai_comment : "",
              user: {
                name: chunk.commit.author,
                avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=" + chunk.commit.author.replace(/\s+/g, ''),
              },
              date: chunk.commit.date,
              commitMessage: chunk.commit.message
            });
          });
        }
      });
      
      setProcessedCodeChunks(chunks);
    } else if (codeChunks && codeChunks.length > 0) {
      // Use provided code chunks if no commit data
      setProcessedCodeChunks(codeChunks.map(chunk => ({
        ...chunk,
        type: chunk.type || "add" // Default to "add" for backward compatibility
      })));
    }
  }, [commitData, codeChunks, currentDataId]);

  // Initialize typing animation - only once per data set
  useEffect(() => {
    if (!processedCodeChunks.length || processedRef.current) return;
    
    // Mark as processed to prevent multiple initializations
    processedRef.current = true;
    
    const startTyping = () => {
      setIsTyping(true);
    };

    // Start with initial delay
    const initialTimer = setTimeout(startTyping, initialDelay);
    
    return () => {
      clearTimeout(initialTimer);
    };
  }, [processedCodeChunks, initialDelay]);

  // Handle the typing animation
  useEffect(() => {
    if (!isTyping || currentChunkIndex >= processedCodeChunks.length) return;

    const currentChunk = processedCodeChunks[currentChunkIndex];
    const typingInterval = 1000 / typingSpeed;
    
    // Update active commit info
    if (currentChunk.user && currentChunk.commitMessage) {
      setActiveCommit({
        author: currentChunk.user.name || "Unknown",
        date: currentChunk.date || new Date().toISOString(),
        message: currentChunk.commitMessage,
        comment: currentChunk.comment || "",
        avatar: currentChunk.user.avatar
      });
    }
    
    let timer: NodeJS.Timeout;
    
    if (currentChunk.type === "remove") {
      // For removed lines, visually we'll just add them with strikethrough styling
      // Monaco doesn't support good animations for removing text
      if (currentChunkProgress === 0) {
        setCurrentText(prev => {
          // We'll add this line with a special marker or decoration
          // For now, we just add the line normally but we could add Monaco decorations later
          return prev + (prev ? "\n" : "") + currentChunk.code;
        });
        
        // Apply decorations to show this as removed
        if (editorRef.current && monaco) {
          const lineNumber = currentText.split('\n').length;
          const model = editorRef.current.getModel();
          
          if (model) {
            // Here we could add decorations for strikethrough/red color
            // This would require a more advanced implementation
          }
        }
        
        // Move to next character immediately since we added the whole line
        setCurrentChunkProgress(currentChunk.code.length);
      } else {
        // Move to the next chunk after a pause
        timer = setTimeout(() => {
          setCurrentChunkIndex(prev => prev + 1);
          setCurrentChunkProgress(0);
        }, 500); // Pause between chunks
      }
    } else {
      // For added or context lines, type one character at a time
      if (currentChunkProgress < currentChunk.code.length) {
        // Still typing the current chunk
        timer = setTimeout(() => {
          setCurrentChunkProgress(prev => prev + 1);
          
          // Update the current text
          setCurrentText(prev => {
            // If this is the first character of a new line, add a newline first
            if (currentChunkProgress === 0 && prev.length > 0) {
              return prev + "\n" + currentChunk.code.substring(0, 1);
            }
            // Otherwise, add the next character
            else if (currentChunkProgress === 0) {
              return currentChunk.code.substring(0, 1);
            }
            // Already started this line, just add the next character
            else {
              const lines = prev.split('\n');
              lines[lines.length - 1] = currentChunk.code.substring(0, currentChunkProgress + 1);
              return lines.join('\n');
            }
          });
          
          // Scroll to the current position
          if (editorRef.current) {
            const lineCount = currentText.split('\n').length;
            editorRef.current.revealLineInCenter(lineCount);
          }
        }, typingInterval);
      } else {
        // Move to the next chunk
        timer = setTimeout(() => {
          setCurrentChunkIndex(prev => prev + 1);
          setCurrentChunkProgress(0);
        }, 500); // Pause between chunks
      }
    }
    
    return () => clearTimeout(timer);
  }, [isTyping, currentChunkIndex, currentChunkProgress, processedCodeChunks, currentText, typingSpeed, monaco]);

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

  if (processedCodeChunks.length === 0) {
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
      {/* Code Editor */}
      <div className={`rounded-md overflow-hidden flex-grow ${className}`}>
        <div className={`code-editor-container ${theme === 'vs-dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
          {/* Monaco Editor */}
          <Editor
            height={editorHeight}
            theme={theme}
            language={detectedLanguage}
            value={currentText}
            onMount={handleEditorDidMount}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on'
            }}
          />
          
          {/* Typing cursor overlay - this would require more advanced DOM manipulation */}
          {/* For now we'll rely on Monaco's cursor, but a custom cursor could be added */}
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingCodeEditor;