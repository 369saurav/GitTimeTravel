import { Routes, Route, useParams } from 'react-router-dom'
import Home from "./Home"

function GitHubFileViewer() {
  const params = useParams()
  
  // Extract GitHub file path from URL params
  const owner = params.owner
  const repo = params.repo
  const branch = params.branch || 'master'
  const filePath = params['*'] // Captures the rest of the path
  
  // Construct GitHub URL
  const githubUrl = `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`
  
  console.log('Auto-detected GitHub URL:', githubUrl)
  
  // Pass the pre-filled URL to Home component
  return <Home prefilledUrl={githubUrl} />
}

function App() {
  return (
    <div className="min-h-screen w-full bg-background antialiased">
      <Routes>
        {/* Home route */}
        <Route path="/" element={<Home />} />
        
        {/* GitHub mirror route - captures GitHub URL pattern */}
        <Route path="/:owner/:repo/blob/:branch/*" element={<GitHubFileViewer />} />
      </Routes>
    </div>
  )
}

export default App