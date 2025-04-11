import React, { useState, useEffect, useRef } from "react";

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
  monacoTheme?: "vs-dark" | "vs-light";
  className?: string;
}

const TypingCodeEditor: React.FC<TypingCodeEditorProps> = ({
  commitData = [],
  codeChunks = [],
  typingSpeed = 20,
  initialDelay = 500,
  monacoTheme = "vs-dark",
  className = "",
}) => {
  // Using refs to track state without causing re-renders
  const processedRef = useRef<boolean>(false);
  const dataIdRef = useRef<string>("");
  const codeLineRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // State variables
  const [displayedCode, setDisplayedCode] = useState<string[]>([]);
  const [displayedTypes, setDisplayedTypes] = useState<("add" | "remove" | "context")[]>([]);
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
  const [commentCardPosition, setCommentCardPosition] = useState(0);

  // Generate a unique ID for the current data to detect changes
  const currentDataId = JSON.stringify(commitData) + JSON.stringify(codeChunks);

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
    setDisplayedCode([]);
    setDisplayedTypes([]);
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
            code: "// No code changes in this commit",
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
      // For removed lines, start with the full code and backspace one character at a time
      if (currentChunkProgress === 0) {
        const newDisplayedCode = [...displayedCode];
        newDisplayedCode[currentChunkIndex] = currentChunk.code;
        setDisplayedCode(newDisplayedCode);
        
        const newDisplayedTypes = [...displayedTypes];
        newDisplayedTypes[currentChunkIndex] = "remove";
        setDisplayedTypes(newDisplayedTypes);
        
        timer = setTimeout(() => {
          setCurrentChunkProgress(1);
        }, typingInterval);
      } else if (currentChunkProgress <= currentChunk.code.length) {
        timer = setTimeout(() => {
          const newDisplayedCode = [...displayedCode];
          newDisplayedCode[currentChunkIndex] = currentChunk.code.substring(0, currentChunk.code.length - currentChunkProgress);
          setDisplayedCode(newDisplayedCode);
          setCurrentChunkProgress(prev => prev + 1);
        }, typingInterval);
      } else {
        // Move to the next chunk
        timer = setTimeout(() => {
          setCurrentChunkIndex(prev => prev + 1);
          setCurrentChunkProgress(0);
          setDisplayedCode(prev => [...prev, ""]);
          setDisplayedTypes(prev => [...prev, "add"]);
        }, 500); // Pause between chunks
      }
    } else {
      // For added or context lines, type one character at a time
      if (currentChunkProgress < currentChunk.code.length) {
        // Still typing the current chunk
        timer = setTimeout(() => {
          setCurrentChunkProgress(prev => prev + 1);
          
          const newDisplayedCode = [...displayedCode];
          newDisplayedCode[currentChunkIndex] = currentChunk.code.substring(0, currentChunkProgress + 1);
          setDisplayedCode(newDisplayedCode);
          
          if (currentChunkProgress === 0) {
            const newDisplayedTypes = [...displayedTypes];
            newDisplayedTypes[currentChunkIndex] = currentChunk.type;
            setDisplayedTypes(newDisplayedTypes);
          }
        }, typingInterval);
      } else {
        // Move to the next chunk
        timer = setTimeout(() => {
          setCurrentChunkIndex(prev => prev + 1);
          setCurrentChunkProgress(0);
          setDisplayedCode(prev => [...prev, ""]);
          setDisplayedTypes(prev => [...prev, "add"]);
        }, 500); // Pause between chunks
      }
    }
    
    return () => clearTimeout(timer);
  }, [isTyping, currentChunkIndex, currentChunkProgress, processedCodeChunks, displayedCode, displayedTypes, typingSpeed]);

  // Update comment card position based on current line
  useEffect(() => {
    if (currentChunkIndex < codeLineRefs.current.length && codeLineRefs.current[currentChunkIndex]) {
      const lineElement = codeLineRefs.current[currentChunkIndex];
      if (lineElement) {
        const rect = lineElement.getBoundingClientRect();
        const editorContainer = lineElement.closest('.code-editor-container');
        if (editorContainer) {
          const containerRect = editorContainer.getBoundingClientRect();
          setCommentCardPosition(rect.top - containerRect.top);
        }
      }
    }
  }, [currentChunkIndex, displayedCode]);
  
  // Update references array when displayed code changes
  useEffect(() => {
    codeLineRefs.current = codeLineRefs.current.slice(0, displayedCode.length);
    while (codeLineRefs.current.length < displayedCode.length) {
      codeLineRefs.current.push(null);
    }
  }, [displayedCode.length]);

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Generate syntax highlighting classes (simplified version)
  const syntaxHighlight = (code: string): React.ReactNode => {
    // Simple regex for keywords, strings, and comments
    const highlighted = code
      .replace(
        /(const|let|var|function|return|if|else|for|while|import|export|from|class|interface|type|extends|implements)/g,
        '<span class="text-purple-400">$1</span>'
      )
      .replace(
        /(".*?"|'.*?'|`.*?`)/g,
        '<span class="text-green-400">$1</span>'
      )
      .replace(
        /(\/\/.*)/g,
        '<span class="text-gray-400">$1</span>'
      );
      
    return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
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
        <div className={`p-4 ${monacoTheme === 'vs-dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
          <div className="text-center p-4">No code changes to display</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Code Editor */}
      <div 
        className={`rounded-md overflow-hidden flex-grow ${className}`}
        style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
      >
        <div className={`p-4 code-editor-container ${monacoTheme === 'vs-dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
          {/* Monaco-like editor header */}
          <div className="flex items-center justify-between mb-2 border-b border-gray-700 pb-2">
            <div className="text-sm font-medium">Generated Code</div>
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>
          
          {/* Code area */}
          <div className="relative">
            {displayedCode.length === 0 && isTyping ? (
              <div className="p-4 text-center text-gray-400">
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <p className="mt-2">Preparing code...</p>
              </div>
            ) : (
              <pre className="text-sm p-2 overflow-x-auto">
                {displayedCode.map((chunk, index) => (
                  <div 
                    key={index} 
                    className="flex mb-2"
                    ref={el => codeLineRefs.current[index] = el}
                  >
                    <span className="inline-block w-8 text-gray-500 select-none text-right mr-4">
                      {index + 1}
                    </span>
                    <div className={`flex-1 ${displayedTypes[index] === "remove" ? "bg-red-900/30 line-through" : displayedTypes[index] === "add" ? "bg-green-900/20" : ""}`}>
                      {syntaxHighlight(chunk)}
                    </div>
                    {index === currentChunkIndex && isTyping && (
                      <span className="animate-pulse">|</span>
                    )}
                  </div>
                ))}
              </pre>
            )}
          </div>
        </div>
      </div>
      
      {/* Comment Card - Fixed position on the right side */}
      {isTyping && activeCommit && (
        <div className="w-80 md:w-96 flex-shrink-0">
          <div 
            className={`p-4 rounded-md shadow-md ${monacoTheme === 'vs-dark' ? 'bg-gray-800' : 'bg-white'}`}
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
                  <div className="bg-gray-700/30 rounded p-2 text-sm text-gray-300">
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