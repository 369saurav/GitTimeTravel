import { useState } from "react"
import { useGithub } from "./hooks/use-github"
import { ThemeToggle } from "./components/theme-toggle"

const Home = () => {
  const [url, setUrl] = useState("")
  const {
    branches,
    files,
    loading,
    error,
    fetchBranches,
    fetchFiles,
    selectedBranch,
    selectedFile,
    setSelectedFile,
  } = useGithub()

  const handleFetchBranches = () => {
    fetchBranches(url)
  }

  const handleBranchSelect = (branch: string) => {
    fetchFiles(branch)
  }

  return (
    <div className="w-full flex flex-col">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[600px] mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl">🎬</span>
              <h1 className="text-3xl font-bold">GitTimeTravel</h1>
            </div>
          </div>

          {/* Form content */}
          <div className="bg-card p-6 rounded-lg border shadow-sm space-y-6">
            {/* GitHub URL Input */}
            <div className="flex gap-4">
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                type="text"
                placeholder="Enter GitHub repo URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 whitespace-nowrap"
                onClick={handleFetchBranches}
                disabled={loading || !url}
              >
                {loading ? "Loading..." : "Fetch Branches"}
              </button>
            </div>

            {/* Branches Dropdown */}
            {branches.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Select Branch</h2>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedBranch}
                  onChange={(e) => handleBranchSelect(e.target.value)}
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.name} value={branch.name}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Files List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Select File</h2>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                >
                  <option value="">Select a file</option>
                  {files.map((file) => (
                    <option key={file.path} value={file.path}>
                      {file.path}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Time Travel Button */}
            {selectedFile && (
              <div className="flex justify-center pt-2">
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  onClick={() => console.log("Time travel!")}
                >
                  Time Travel
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-destructive text-sm text-center">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
