# app/service/github_file_history.py

import re
import requests
from typing import List, Dict, Any, Optional, Union


class GitHubFileService:
    """
    Service layer for interacting with GitHub API to fetch file history.
    """
    
    def __init__(self, token: Optional[str] = None):
        """
        Initialize the GitHub file service.
        
        Args:
            token (str, optional): GitHub API token for authentication
        """
        self.headers = {"Accept": "application/vnd.github.v3+json"}
        if token:
            self.headers["Authorization"] = f"token {token}"

    def parse_github_url(self, file_url: str) -> tuple:
        """
        Parse a GitHub file URL to extract owner, repo, branch, and file path.
        
        Args:
            file_url (str): GitHub file URL
            
        Returns:
            tuple: (owner, repo, branch, file_path)
            
        Raises:
            ValueError: If URL doesn't match expected pattern
        """
        pattern = r"https://github\.com/([^/]+)/([^/]+)/blob/([^/]+)/(.+)"
        match = re.match(pattern, file_url)
        if not match:
            raise ValueError("URL does not match the expected GitHub file URL pattern.")
        return match.groups()

    def fetch_commit_list(self, owner: str, repo: str, branch: str, file_path: str) -> List[Dict[str, Any]]:
        """
        Fetch list of commits for a specific file.
        
        Args:
            owner (str): Repository owner
            repo (str): Repository name
            branch (str): Branch name
            file_path (str): Path to file within the repository
            
        Returns:
            List[Dict[str, Any]]: List of commit summaries
        """
        commits_api_url = f"https://api.github.com/repos/{owner}/{repo}/commits"
        params = {
            "sha": branch,
            "path": file_path
        }
        
        response = requests.get(commits_api_url, params=params, headers=self.headers)
        response.raise_for_status()
        return response.json()

    def fetch_commit_detail(self, owner: str, repo: str, sha: str) -> Dict[str, Any]:
        """
        Fetch detailed information about a specific commit.
        
        Args:
            owner (str): Repository owner
            repo (str): Repository name
            sha (str): Commit SHA
            
        Returns:
            Dict[str, Any]: Detailed commit information
        """
        commit_api_url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
        commit_resp = requests.get(commit_api_url, headers=self.headers)
        commit_resp.raise_for_status()
        return commit_resp.json()

    def extract_file_diff(self, commit_data: Dict[str, Any], file_path: str) -> Optional[str]:
        """
        Extract the diff for a specific file from commit data.
        
        Args:
            commit_data (Dict[str, Any]): Detailed commit information
            file_path (str): Path to the file
            
        Returns:
            Optional[str]: Diff patch for the file, or None if not found
        """
        for file in commit_data.get("files", []):
            if file.get("filename") == file_path:
                return file.get("patch")
        return None

    def get_commit_history(self, file_url: str) -> List[Dict[str, Any]]:
        """
        Get commit history for a specific file.
        
        Args:
            file_url (str): GitHub file URL
            
        Returns:
            List[Dict[str, Any]]: List of commit details with patches
        """
        owner, repo, branch, file_path = self.parse_github_url(file_url)
        commits = self.fetch_commit_list(owner, repo, branch, file_path)
        
        detailed_history = []
        for commit_summary in commits:
            sha = commit_summary.get("sha")
            commit_data = self.fetch_commit_detail(owner, repo, sha)
            
            file_diff = self.extract_file_diff(commit_data, file_path)
            
            history_entry = {
                "author": commit_data.get("commit", {}).get("author", {}).get("name", "Unknown"),
                "date": commit_data.get("commit", {}).get("author", {}).get("date"),
                "message": commit_data.get("commit", {}).get("message", "").strip(),
                "patch": file_diff,
                "ai_comment": "DUMMY COMMENT",  # Placeholder for AI-generated comments
            }
            detailed_history.append(history_entry)
        
        # Reverse to get chronological order (oldest first)
        return list(reversed(detailed_history))


class DiffProcessor:
    """
    Process diff patches into structured format for frontend consumption.
    """
    
    @staticmethod
    def parse_diff_header(header: str) -> tuple:
        """
        Parse a diff header line (@@ -a,b +c,d @@) to extract line numbers.
        
        Args:
            header (str): Diff header line
            
        Returns:
            tuple: (old_start, new_start) line numbers
        """
        range_info = header.split('@@')[1].strip()
        old_range, new_range = range_info.split(' ')
        
        # Extract starting line numbers
        old_start = int(old_range.split(',')[0][1:]) if ',' in old_range else int(old_range[1:])
        new_start = int(new_range.split(',')[0][1:]) if ',' in new_range else int(new_range[1:])
        
        return old_start, new_start

    @classmethod
    def convert_patch_to_changes(cls, patch: Optional[str]) -> List[Dict[str, Union[str, int]]]:
        """
        Convert a unified diff patch to structured changes for frontend animation.
        
        Args:
            patch (str, optional): Unified diff patch string
            
        Returns:
            List[Dict[str, Union[str, int]]]: List of change objects
        """
        if not patch:
            return []
        
        changes = []
        current_line_old = 0
        current_line_new = 0
        
        lines = patch.split('\n')
        i = 0
        
        while i < len(lines):
            line = lines[i]
            
            # Skip empty lines
            if not line:
                i += 1
                continue
            
            # Parse the line ranges header
            if line.startswith('@@'):
                current_line_old, current_line_new = cls.parse_diff_header(line)
                i += 1
                continue
            
            # Process actual content lines
            if line.startswith('+'):
                # Added line
                changes.append({
                    "type": "add",
                    "line": current_line_new,
                    "content": line[1:]  # Remove the + prefix
                })
                current_line_new += 1
            elif line.startswith('-'):
                # Removed line
                changes.append({
                    "type": "remove",
                    "line": current_line_old,
                    "content": line[1:]  # Remove the - prefix
                })
                current_line_old += 1
            else:
                # Context line (unchanged)
                changes.append({
                    "type": "context",
                    "line": current_line_new,
                    "content": line
                })
                current_line_old += 1
                current_line_new += 1
            
            i += 1
        
        return changes


class GitHubFileHistoryAPI:
    """
    Main API class that combines service and processor layers.
    """
    
    def __init__(self, token: Optional[str] = None):
        """
        Initialize the GitHub file history API.
        
        Args:
            token (str, optional): GitHub API token for authentication
        """
        self.service = GitHubFileService(token)
        self.processor = DiffProcessor()
    
    def get_raw_history(self, file_url: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get raw commit history with original patches.
        
        Args:
            file_url (str): GitHub file URL
            
        Returns:
            Dict[str, List[Dict[str, Any]]]: Raw history data
        """
        history = self.service.get_commit_history(file_url)
        return {"data": history}
    
    def get_processed_history(self, file_url: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get processed commit history with structured changes.
        
        Args:
            file_url (str): GitHub file URL
            
        Returns:
            Dict[str, List[Dict[str, Any]]]: Processed history data
        """
        history = self.service.get_commit_history(file_url)
        
        # Process each commit to convert patch to structured changes
        for commit in history:
            patch = commit.pop("patch", None)
            commit["changes"] = self.processor.convert_patch_to_changes(patch)
        
        return {"data": history}