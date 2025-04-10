import { useState } from "react"

type Branch = {
  name: string
  commit: {
    sha: string
  }
}

type File = {
  path: string
  type: "file" | "dir"
}

// Mock API functions
const mockFetchBranches = async (repoUrl: string): Promise<Branch[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock data
  return [
    { name: "main", commit: { sha: "abc123" } },
    { name: "develop", commit: { sha: "def456" } },
    { name: "feature/new-ui", commit: { sha: "ghi789" } },
  ]
}

const mockFetchFiles = async (repoUrl: string, branch: string): Promise<File[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Mock data
  return [
    { path: "src/main.py", type: "file" },
    { path: "src/utils.py", type: "file" },
    { path: "tests", type: "dir" },
    { path: "README.md", type: "file" },
  ]
}

export const useGithub = () => {
  const [repoUrl, setRepoUrl] = useState("")
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [files, setFiles] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBranches = async (url: string) => {
    try {
      setLoading(true)
      setError(null)
      setRepoUrl(url)
      const data = await mockFetchBranches(url)
      setBranches(data)
    } catch (err) {
      setError("Failed to fetch branches")
    } finally {
      setLoading(false)
    }
  }

  const fetchFiles = async (branch: string) => {
    try {
      setLoading(true)
      setError(null)
      setSelectedBranch(branch)
      const data = await mockFetchFiles(repoUrl, branch)
      setFiles(data)
    } catch (err) {
      setError("Failed to fetch files")
    } finally {
      setLoading(false)
    }
  }

  return {
    repoUrl,
    branches,
    selectedBranch,
    files,
    selectedFile,
    loading,
    error,
    fetchBranches,
    fetchFiles,
    setSelectedFile,
  }
} 