import re
import requests

def fetch_commit_history_with_diffs(file_url: str, token: str = None):
    """
    Fetch commit history along with diff patches for a specific file from GitHub,
    given its URL (which includes repo, branch, and file path).

    Args:
        file_url (str): GitHub file URL, e.g.
            "https://github.com/coauth/enteract-ai/blob/Mil-Phase-1/admin-ui/src/main.tsx"
        token (str, optional): Personal access token for GitHub API, if needed.

    Returns:
        List[dict]: A list of dictionaries each containing commit metadata and diff patch.
                    Example structure:
                    {
                        "commit_hash": "...",
                        "author": "...",
                        "date": "...",
                        "message": "...",
                        "patch": "..."  # Diff changes for that file (if available)
                    }
    """
    # 1. Parse the URL to extract owner, repo, branch, file_path
    # The URL format: https://github.com/<owner>/<repo>/blob/<branch>/<file_path>
    pattern = r"https://github\.com/([^/]+)/([^/]+)/blob/([^/]+)/(.+)"
    match = re.match(pattern, file_url)
    if not match:
        raise ValueError("URL does not match the expected GitHub file URL pattern.")
    
    owner, repo, branch, file_path = match.groups()

    # 2. Define the API endpoint to fetch commits for the file
    commits_api_url = f"https://api.github.com/repos/{owner}/{repo}/commits"
    params = {
        "sha": branch,
        "path": file_path
    }
    headers = {"Accept": "application/vnd.github.v3+json"}
    if token:
        headers["Authorization"] = f"token {token}"

    response = requests.get(commits_api_url, params=params, headers=headers)
    response.raise_for_status()
    commits = response.json()

    detailed_history = []

    # 3. For each commit, fetch detailed commit information (which includes the diff patch)
    for commit_summary in commits:
        sha = commit_summary.get("sha")
        commit_api_url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
        commit_resp = requests.get(commit_api_url, headers=headers)
        commit_resp.raise_for_status()
        commit_data = commit_resp.json()

        # Find the file we care about in the commit's "files" list.
        file_diff = None
        for file in commit_data.get("files", []):
            if file.get("filename") == file_path:
                # The "patch" field contains the diff (if available)
                file_diff = file.get("patch")
                break

        history_entry = {
            "commit_hash": sha,
            "author": commit_data.get("commit", {}).get("author", {}).get("name", "Unknown"),
            "date": commit_data.get("commit", {}).get("author", {}).get("date"),
            "message": commit_data.get("commit", {}).get("message", "").strip(),
            "patch": file_diff  # This is a diff patch (or None if not present)
        }
        detailed_history.append(history_entry)

    return detailed_history


# # Example usage:
# if __name__ == "__main__":
#     file_url = "https://github.com/coauth/enteract-ai/blob/Mil-Phase-1/admin-ui/src/main.tsx"
#     # If you have a token (optional for public repos but required for higher rate limits):
#     # token = "your_github_personal_access_token"
#     token = None
#     try:
#         history_with_diffs = fetch_commit_history_with_diffs(file_url, token)
#         for entry in history_with_diffs:
#             print(f"Commit: {entry['commit_hash']}")
#             print(f"Author: {entry['author']}")
#             print(f"Date: {entry['date']}")
#             print(f"Message: {entry['message']}")
#             print("Diff Patch:")
#             print(entry['patch'] if entry['patch'] else "No diff available")
#             print("-" * 60)
#     except Exception as e:
#         print(f"Error fetching commit history: {e}")
