import { useEffect, useState } from "react";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import TypingCodeEditor from "./typing-code-editor";
import useTimeTravel from "./hooks/use-github";
import LottieLoadingScreen from "./lottie-loading";

interface HomeProps {
  prefilledUrl?: string;
}

const Home = ({ prefilledUrl }: HomeProps) => {
  const [githubUrl, setGithubUrl] = useState(prefilledUrl || "");
  const [accessToken, setAccessToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [typingSpeed, setTypingSpeed] = useState<
    "zen" | "flow" | "blitz" | "quantum"
  >("flow");
  
  // Update githubUrl when prefilledUrl changes
  useEffect(() => {
    if (prefilledUrl) {
      setGithubUrl(prefilledUrl);
    }
  }, [prefilledUrl]);
  
  // Get data and functions from the custom hook
  const { 
    data: commitData, 
    iserror: hookError, 
    isloading: loading, 
    fetchCommitHistory 
  } = useTimeTravel();

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

  const handleTimeTravelClick = async () => {
    try {
      setError(null);
      await fetchCommitHistory(githubUrl, accessToken);
      // We'll set showCodeEditor to true when the data loads completely
      // This way the clock animation shows while loading
    } catch (err: any) {
      setError(err.message);
    }
  };

  const   toggleTheme = () => {
    setTheme(theme === "light" ? "vs-dark" : "light");
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme === "light" ? "dark" : "light");
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add("dark");
  }, []);

  // Update error state based on hook
  useEffect(() => {
    if (hookError) {
      setError(hookError.message);
    }
  }, [hookError]);

  // Show code editor when data is loaded
  useEffect(() => {
    if (commitData && commitData.length > 0 && !showCodeEditor && !loading) {
      setShowCodeEditor(true);
    }
  }, [commitData, loading]);

  // Go back to home
  const handleBackClick = () => {
    setShowCodeEditor(false);
    setGithubUrl("");
    setError(null);
  };

  // Determine file language from GitHub URL
  const getFileLanguage = () => {
    if (!githubUrl) return "javascript";
    
    try {
      const { path } = parseGithubUrl(githubUrl);
      const extension = path.split('.').pop()?.toLowerCase();
      
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
      
      return extension && languageMap[extension] ? languageMap[extension] : "plaintext";
    } catch (error) {
      return "plaintext";
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      {/* Clock Loading Animation */}
      <LottieLoadingScreen isLoading={loading} />
      
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
                  placeholder="https://github.com/369saurav/PlayGM/blob/master/core/usecase/playgm_usecase.py"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Format: https://github.com/owner/repo/blob/branch/path/to/file
                </p>
              </div>

              {/* GitHub Access Token Input */}
              <div className="space-y-2">
                <label htmlFor="accessToken" className="text-sm font-medium">
                  GitHub Access Token
                </label>
                <input
                  id="accessToken"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Need a token with 'repo' scope to access the file history
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
                  {typingSpeed === "zen" &&
                    "Slow, meditative pace for deep understanding (10 chars/sec)"}
                  {typingSpeed === "flow" &&
                    "Balanced pace, like watching someone code naturally (20 chars/sec)"}
                  {typingSpeed === "blitz" &&
                    "Fast-paced typing for quick insights (40 chars/sec)"}
                  {typingSpeed === "quantum" &&
                    "Blink and you'll miss it - superhuman typing (80 chars/sec)"}
                </p>
              </div>

              {/* Sound Toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sound Effects</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSound}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      soundEnabled
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 size={16} /> Enabled
                      </>
                    ) : (
                      <>
                        <VolumeX size={16} /> Disabled
                      </>
                    )}
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {soundEnabled
                      ? "Typing sounds enabled for a more immersive experience"
                      : "Typing sounds disabled"}
                  </span>
                </div>
              </div>

              {/* Time Travel Button */}
              <div className="flex justify-center pt-2">
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 py-2"
                  onClick={handleTimeTravelClick}
                  disabled={loading || !githubUrl.trim() || !accessToken.trim()}
                >
                  {loading ? "Loading..." : "Time Travel"}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-destructive text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-h-screen">
            <div className="max-w-6xl mx-auto">
              {/* Back button */}
              <div className="mb-4">
                <button
                  onClick={handleBackClick}
                  className="text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <span>←</span> Back to search
                </button>
              </div>

              {/* Error message */}
              {error && !loading && (
                <div className="text-destructive text-center py-8">
                  <p>Error: {error}</p>
                </div>
              )}

              {/* Code editor with actual commit data */}
              {!loading && !error && commitData && commitData.length > 0 && (
                <>
                  {/* Code editor title */}
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">
                      Time Traveling through {githubUrl ? parseGithubUrl(githubUrl).path : "code"}
                    </h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>Language: {getFileLanguage()}</span>
                      <span>•</span>
                      <span>Speed: {typingSpeed}</span>
                      <span>•</span>
                      <span>Commits: {commitData.length}</span>
                      <span>•</span>
                      <span>Sound: {soundEnabled ? "On" : "Off"}</span>
                    </p>
                  </div>

                  {/* Monaco Code editor */}
                  <div className="h-[calc(100vh-200px)]">
                    <TypingCodeEditor
                      commitData={commitData}
                      typingSpeed={
                        typingSpeed === "zen"
                          ? 10
                          : typingSpeed === "flow"
                          ? 20
                          : typingSpeed === "blitz"
                          ? 40
                          : 80 // quantum
                      }
                      theme={theme}
                      language={getFileLanguage()}
                      githubUrl={githubUrl}
                      className="shadow-lg rounded-lg"
                      soundEnabled={soundEnabled}
                    />
                  </div>
                </>
              )}

              {/* No data message */}
              {!loading && !error && (!commitData || commitData.length === 0) && (
                <div className="text-center py-8">
                  <p>No commit data available. Try a different file.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;