import { useState } from 'react';
import axios from 'axios';

interface CommitData {
  author: string;
  date: string;
  message: string;
  patch: string;
  ai_comment: string;
}

interface GitHubInfo {
  owner: string;
  repo: string;
  branch: string;
  path: string;
}

interface UseTimeTravelReturn {
  data: CommitData[] | null;
  iserror: Error | null;
  isloading: boolean;
  fetchCommitHistory: (githubUrl: string, accessToken: string) => Promise<void>;
}

const useTimeTravel = (): UseTimeTravelReturn => {
  const [data, setData] = useState<CommitData[] | null>(null);
  const [iserror, setError] = useState<Error | null>(null);
  const [isloading, setLoading] = useState<boolean>(false);

  // Parse GitHub URL to extract owner, repo, branch, and path
  const parseGithubUrl = (url: string): GitHubInfo => {
    try {
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

  // Fetch commit history
  const fetchCommitHistory = async (githubUrl: string, accessToken: string): Promise<void> => {
    try {
      if (!githubUrl.trim()) {
        throw new Error("Please enter a GitHub URL");
      }

      if (!accessToken.trim()) {
        throw new Error("Please enter your GitHub access token");
      }

      // Validate URL format
      parseGithubUrl(githubUrl);
      
      setLoading(true);
      setError(null);

      // Send URL and token in headers to your API
      const response = await axios.get('/api/time-travel', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Github-Url': githubUrl
        }
      });
      
      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err: any) {
      console.error("API Error:", err);
      setError(err.response?.data?.message ? new Error(err.response.data.message) : err);
    } finally {
      setLoading(false);
    }
  };

  return { data, iserror, isloading, fetchCommitHistory };
};

export default useTimeTravel;