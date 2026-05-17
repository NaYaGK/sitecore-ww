#!/usr/bin/env python3
"""
Claude AI Code Review for Azure DevOps Pull Requests
"""

import os
import sys
import json
import base64
import subprocess
from typing import Optional, List, Dict, Any
import requests
from anthropic import Anthropic

# Configuration from environment
ADO_ORG_URL = os.getenv('SYSTEM_COLLECTIONURI', '').rstrip('/')
ADO_PROJECT = os.getenv('SYSTEM_TEAMPROJECT')
REPO_ID = os.getenv('BUILD_REPOSITORY_ID')
PR_ID = os.getenv('SYSTEM_PULLREQUEST_PULLREQUESTID')
ADO_PAT = os.getenv('AZURE_DEVOPS_PAT')
ANTHROPIC_KEY = os.getenv('ANTHROPIC_API_KEY')
SOURCE_BRANCH = os.getenv('SYSTEM_PULLREQUEST_SOURCEBRANCH', 'HEAD')
TARGET_BRANCH = os.getenv('SYSTEM_PULLREQUEST_TARGETBRANCH', 'main')

# Anthropic client
client = Anthropic(api_key=ANTHROPIC_KEY)

def get_auth_header() -> Dict[str, str]:
    """Generate Azure DevOps API auth header."""
    encoded = base64.b64encode(f":{ADO_PAT}".encode()).decode()
    return {
        'Authorization': f'Basic {encoded}',
        'Content-Type': 'application/json'
    }

def get_pr_diff() -> str:
    """Get the diff of changes in the PR using git."""
    try:
        # Fetch all branches
        subprocess.run(['git', 'fetch', 'origin'], check=True, capture_output=True)
        
        # Get the target branch name (remove refs/heads/ prefix)
        target = TARGET_BRANCH.replace('refs/heads/', '')
        
        # Get diff between target and current HEAD
        result = subprocess.run(
            ['git', 'diff', f'origin/{target}...HEAD', '--unified=5'],
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error getting diff: {e.stderr}")
        return ""

def get_changed_files() -> List[str]:
    """Get list of changed files in the PR."""
    try:
        target = TARGET_BRANCH.replace('refs/heads/', '')
        result = subprocess.run(
            ['git', 'diff', '--name-only', f'origin/{target}...HEAD'],
            capture_output=True,
            text=True,
            check=True
        )
        return [f.strip() for f in result.stdout.split('\n') if f.strip()]
    except subprocess.CalledProcessError:
        return []

def post_pr_comment(content: str, file_path: Optional[str] = None, 
                    line_number: Optional[int] = None) -> bool:
    """Post a comment to the PR."""
    # Extract org name from URL
    org_name = ADO_ORG_URL.split('/')[-1]
    
    url = f"{ADO_ORG_URL}/{ADO_PROJECT}/_apis/git/repositories/{REPO_ID}/pullRequests/{PR_ID}/threads?api-version=7.1"
    
    thread_body: Dict[str, Any] = {
        "comments": [{
            "parentCommentId": 0,
            "content": content,
            "commentType": 1  # Text comment
        }],
        "status": 1  # Active
    }
    
    # Add file context if provided
    if file_path and line_number:
        thread_body["threadContext"] = {
            "filePath": f"/{file_path}",
            "rightFileStart": {"line": line_number, "offset": 1},
            "rightFileEnd": {"line": line_number, "offset": 1}
        }
    
    try:
        response = requests.post(url, headers=get_auth_header(), json=thread_body)
        response.raise_for_status()
        return True
    except requests.RequestException as e:
        print(f"Error posting comment: {e}")
        return False

def review_code_with_claude(diff: str, changed_files: List[str]) -> str:
    """Send code to Claude for review."""
    
    system_prompt = """You are an expert code reviewer specializing in enterprise software development.
    
Your task is to review code changes and identify:
1. **CRITICAL**: Security vulnerabilities, data leaks, authentication issues
2. **HIGH**: Logic errors, bugs that could cause failures, race conditions
3. **MEDIUM**: Performance issues, memory leaks, inefficient patterns
4. **LOW**: Code style issues, naming conventions, documentation gaps

For each issue, provide:
- Severity level in brackets: [CRITICAL], [HIGH], [MEDIUM], or [LOW]
- File path and approximate line number
- Clear description of the issue
- Specific recommendation to fix

If the code looks good, acknowledge the positive aspects.

Keep your response concise and actionable. Focus on the most important issues first."""

    user_prompt = f"""Please review the following code changes from a Pull Request.

**Changed Files:**
{chr(10).join(f'- {f}' for f in changed_files[:20])}

**Code Diff:**
```diff
{diff[:50000]}  # Truncate very large diffs
```
Provide your code review with specific, actionable feedback."""

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4096,
            messages=[
                {"role": "user", "content": user_prompt}
            ],
            system=system_prompt
        )
        return response.content[0].text
    except Exception as e:
        return f"Error during code review: {str(e)}"

def main():
    """Main execution flow."""
    print("=" * 60)
    print("Claude AI Code Review for Azure DevOps")
    print("=" * 60)

    # Validate environment
    if not all([ADO_ORG_URL, ADO_PROJECT, REPO_ID, PR_ID, ADO_PAT, ANTHROPIC_KEY]):
        print("ERROR: Missing required environment variables")
        print(f"  SYSTEM_COLLECTIONURI: {'✓' if ADO_ORG_URL else '✗'}")
        print(f"  SYSTEM_TEAMPROJECT: {'✓' if ADO_PROJECT else '✗'}")
        print(f"  BUILD_REPOSITORY_ID: {'✓' if REPO_ID else '✗'}")
        print(f"  SYSTEM_PULLREQUEST_PULLREQUESTID: {'✓' if PR_ID else '✗'}")
        print(f"  AZURE_DEVOPS_PAT or SYSTEM_ACCESSTOKEN: {'✓' if ADO_PAT else '✗'}")
        print(f"  ANTHROPIC_API_KEY: {'✓' if ANTHROPIC_KEY else '✗'}")
        sys.exit(1)

    print(f"\nReviewing PR #{PR_ID} in {ADO_PROJECT}")

    # Get changes
    print("\n📥 Fetching code changes...")
    diff = get_pr_diff()
    changed_files = get_changed_files()

    if not diff:
        print("No changes detected or unable to get diff")
        sys.exit(0)

    print(f"   Found {len(changed_files)} changed files")

    # Run review
    print("\n🤖 Running Claude code review...")
    review = review_code_with_claude(diff, changed_files)

    print("\n📝 Review Results:")
    print("-" * 40)
    print(review)
    print("-" * 40)

    # Post to PR
    print("\n📤 Posting review to PR...")
    comment_content = f"""## 🤖 Claude AI Code Review
{review}"""

    if post_pr_comment(comment_content):
        print("✅ Comment posted successfully")
    else:
        print("❌ Failed to post comment")

if __name__ == "__main__":
    main()