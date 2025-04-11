import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import TypingCodeEditor from "./typing-code-editor";

// Mock data for code editor
const mockCodeChunks = [
  {
    code: "import { NextRequest } from 'next/server';",
    comment: "Importing NextRequest type",
    user: {
      name: "Next.js Contributor",
      avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=NextJS"
    }
  },
  {
    code: "import { NextResponse } from 'next/server';",
    comment: "Importing NextResponse for API responses",
    user: {
      name: "Vercel Team",
      avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Vercel"
    }
  },
  {
    code: "",
    user: {
      name: "System"
    }
  },
  {
    code: "export function middleware(request: NextRequest) {",
    comment: "Defining middleware function",
    user: {
      name: "Next.js Contributor",
      avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=NextJS"
    }
  },
  {
    code: "  const { pathname } = request.nextUrl;",
    comment: "Extracting pathname from request URL",
    user: {
      name: "Vercel Team",
      avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Vercel"
    }
  },
  {
    code: "",
    user: {
      name: "System"
    }
  },
  {
    code: "  // Check if the request is for the API",
    comment: "Adding a comment for clarity",
    user: {
      name: "Next.js Contributor",
      avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=NextJS"
    }
  },
  {
    code: "  if (pathname.startsWith('/api/')) {",
    comment: "Checking API route condition",
    user: {
      name: "Vercel Team",
      avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Vercel"
    }
  },
  {
    code: "    // API logic here",
    user: {
      name: "Next.js Contributor",
      avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=NextJS"
    }
  },
  {
    code: "    return NextResponse.next();",
    comment: "Allow the request to proceed",
    user: {
      name: "Vercel Team",
      avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=Vercel"
    }
  },
  {
    code: "  }",
    user: {
      name: "System"
    }
  },
  {
    code: "",
    user: {
      name: "System"
    }
  },
  {
    code: "  return NextResponse.next();",
    comment: "Default behavior - pass through",
    user: {
      name: "Next.js Contributor",
      avatar: "https://api.dicebear.com/6.x/avataaars/svg?seed=NextJS"
    }
  },
  {
    code: "}",
    user: {
      name: "System"
    }
  }
];

const Home = () => {
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [typingSpeed, setTypingSpeed] = useState<"zen" | "flow" | "blitz" | "quantum">("flow");

  // Extract relevant info from GitHub URL
  const parseGithubUrl = (url: string) => {
    try {
      // Example URL: https://github.com/vercel/next.js/blob/canary/packages/next/src/server/index.ts
      const regex = /github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)/;
      const match = url.match(regex);
      
      if (!match) {
        throw new Error("Invalid GitHub URL format");
      }
      
      const [, owner, repo, branch, path] = match;
      return { owner, repo, branch, path };
    } catch (err) {
      throw new Error("Please enter a valid GitHub file URL");
    }
  };

  const handleTimeTravelClick = () => {
    try {
      if (!githubUrl.trim()) {
        setError("Please enter a GitHub URL");
        return;
      }
      
      // Validate URL format
      parseGithubUrl(githubUrl);
      
      setLoading(true);
      setError(null);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setShowCodeEditor(true);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add("dark");
  }, []);

  // Go back to home
  const handleBackClick = () => {
    setShowCodeEditor(false);
    setGithubUrl("");
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-10">
      <button
  onClick={toggleTheme}
  className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
>
  <div className="relative h-5 w-5">
    <Sun className="absolute h-5 w-5 transition-all duration-300 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
    <Moon className="absolute h-5 w-5 transition-all duration-300 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
  </div>
  <span className="sr-only">Toggle theme</span>
</button>

      </div>

      {/* Main Content */}
      <div className="w-full h-screen flex items-center justify-center p-4">
        {!showCodeEditor ? (
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-4xl">🎬</span>
                <h1 className="text-3xl font-bold">GitTimeTravel</h1>
              </div>
              <p className="text-muted-foreground">
                Watch code being written, commit by commit.
              </p>
            </div>

            {/* Form content */}
            <div className="bg-card p-6 rounded-lg border shadow-sm space-y-6">
              {/* GitHub URL Input */}
              <div className="space-y-2">
                <label htmlFor="githubUrl" className="text-sm font-medium">
                  Enter GitHub file URL
                </label>
                <input
                  id="githubUrl"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  type="text"
                  placeholder="https://github.com/vercel/next.js/blob/..."
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Format: https://github.com/owner/repo/blob/branch/path/to/file
                </p>
              </div>

              {/* Typing Speed Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Typing Speed</label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    className={`px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      typingSpeed === "zen" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    onClick={() => setTypingSpeed("zen")}
                  >
                    Zen
                  </button>
                  <button
                    className={`px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      typingSpeed === "flow" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    onClick={() => setTypingSpeed("flow")}
                  >
                    Flow
                  </button>
                  <button
                    className={`px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      typingSpeed === "blitz" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    onClick={() => setTypingSpeed("blitz")}
                  >
                    Blitz
                  </button>
                  <button
                    className={`px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      typingSpeed === "quantum" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    onClick={() => setTypingSpeed("quantum")}
                  >
                    Quantum
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {typingSpeed === "zen" && "Slow, meditative pace for deep understanding (10 chars/sec)"}
                  {typingSpeed === "flow" && "Balanced pace, like watching someone code naturally (20 chars/sec)"}
                  {typingSpeed === "blitz" && "Fast-paced typing for quick insights (40 chars/sec)"}
                  {typingSpeed === "quantum" && "Blink and you'll miss it - superhuman typing (80 chars/sec)"}
                </p>
              </div>
              
              {/* Time Travel Button */}
              <div className="flex justify-center pt-2">
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
                  onClick={handleTimeTravelClick}
                  disabled={loading || !githubUrl.trim()}
                >
                  {loading ? "Loading..." : "Time Travel"}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-destructive text-sm text-center">{error}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="max-w-4xl mx-auto">
              {/* Back button */}
              <div className="mb-4">
                <button 
                  onClick={handleBackClick}
                  className="text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <span>←</span> Back to search
                </button>
              </div>
              
              {/* Code editor title */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Time Traveling through {parseGithubUrl(githubUrl).path}</h2>
                <p className="text-sm text-muted-foreground">
                  Watching how this file evolved over time
                </p>
              </div>
              
              {/* Code editor */}
              <TypingCodeEditor 
                codeChunks={mockCodeChunks} 
                typingSpeed={
                  typingSpeed === "zen" ? 10 : 
                  typingSpeed === "flow" ? 20 : 
                  typingSpeed === "blitz" ? 40 : 
                  80 // quantum
                } 
                monacoTheme={theme === "dark" ? "vs-dark" : "vs-light"}
                className="shadow-lg rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;