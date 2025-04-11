import React, { useState, useEffect } from "react";

// Define the interface for the code chunk with comment
interface CodeChunk {
  code: string;
  comment?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

// Props interface for the TypingCodeEditor component
interface TypingCodeEditorProps {
  codeChunks: CodeChunk[];
  typingSpeed?: number; // Characters per second
  initialDelay?: number; // Delay before starting typing in ms
  monacoTheme?: "vs-dark" | "vs-light";
  className?: string;
}

const TypingCodeEditor: React.FC<TypingCodeEditorProps> = ({
  codeChunks,
  typingSpeed = 20,
  initialDelay = 500,
  monacoTheme = "vs-dark",
  className = "",
}) => {
  const [displayedCode, setDisplayedCode] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [currentChunkProgress, setCurrentChunkProgress] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize typing animation
  useEffect(() => {
    if (!codeChunks.length) return;
    
    const startTyping = () => {
      setIsTyping(true);
    };

    // Start with initial delay
    const initialTimer = setTimeout(startTyping, initialDelay);
    
    return () => {
      clearTimeout(initialTimer);
    };
  }, [codeChunks, initialDelay]);

  // Handle the typing animation
  useEffect(() => {
    if (!isTyping || currentChunkIndex >= codeChunks.length) return;

    const currentChunk = codeChunks[currentChunkIndex];
    const typingInterval = 1000 / typingSpeed;
    
    if (currentChunkProgress < currentChunk.code.length) {
      // Still typing the current chunk
      const typingTimer = setTimeout(() => {
        setCurrentChunkProgress(prev => prev + 1);
        
        const newDisplayedCode = [...displayedCode];
        newDisplayedCode[currentChunkIndex] = currentChunk.code.substring(0, currentChunkProgress + 1);
        setDisplayedCode(newDisplayedCode);
      }, typingInterval);
      
      return () => clearTimeout(typingTimer);
    } else {
      // Move to the next chunk
      const nextChunkTimer = setTimeout(() => {
        setCurrentChunkIndex(prev => prev + 1);
        setCurrentChunkProgress(0);
        setDisplayedCode(prev => [...prev, ""]);
      }, 500); // Pause between chunks
      
      return () => clearTimeout(nextChunkTimer);
    }
  }, [isTyping, currentChunkIndex, currentChunkProgress, codeChunks, displayedCode, typingSpeed]);

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

  // Current user that is typing
  const currentUser = isTyping && currentChunkIndex < codeChunks.length ? 
    codeChunks[currentChunkIndex].user : null;
  
  // Current comment
  const currentComment = isTyping && currentChunkIndex < codeChunks.length ? 
    codeChunks[currentChunkIndex].comment : null;

  return (
    <div 
      className={`rounded-md overflow-hidden ${className}`}
      style={{ fontFamily: 'Consolas, "Courier New", monospace' }}
    >
      <div className={`p-4 ${monacoTheme === 'vs-dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
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
        <div className="flex">
          {/* Code editor */}
          <div className="flex-1">
            <pre className="text-sm p-2 overflow-x-auto relative">
              {displayedCode.map((chunk, index) => (
                <div key={index} className="flex mb-2">
                  <span className="inline-block w-8 text-gray-500 select-none text-right mr-4">
                    {index + 1}
                  </span>
                  {syntaxHighlight(chunk)}
                  {index === currentChunkIndex && isTyping && (
                    <span className="animate-pulse">|</span>
                  )}
                </div>
              ))}
            </pre>
          </div>
          
          {/* Current typing user and comment */}
          {isTyping && currentUser && (
            <div className="ml-4 flex-shrink-0 w-64 sticky top-0">
              <div className={`p-2 text-xs rounded-md shadow-md ${monacoTheme === 'vs-dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center text-xs font-semibold">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-700">
                        {currentUser.name ? getInitials(currentUser.name) : "U"}
                      </span>
                    )}
                  </div>
                  <div>
                    {currentUser.name && (
                      <div className="font-bold text-xs">{currentUser.name}</div>
                    )}
                    {currentComment && <p>{currentComment}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypingCodeEditor;