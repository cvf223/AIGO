# 🔐 GitHub Authentication Fix Guide

## Problem
GitHub no longer accepts passwords for Git operations. You need a Personal Access Token (PAT).

## Step 1: Create a Personal Access Token

1. Go to GitHub.com and log in
2. Click your profile picture → Settings
3. Scroll down to "Developer settings" (bottom of left sidebar)
4. Click "Personal access tokens" → "Tokens (classic)"
5. Click "Generate new token" → "Generate new token (classic)"
6. Give it a name like "AIGO Construction Syndicate"
7. Select scopes:
   - ✅ repo (all checkboxes under it)
   - ✅ workflow (if you want GitHub Actions)
8. Click "Generate token" at the bottom
9. **COPY THE TOKEN NOW!** (You won't see it again)

## Step 2: Add the correct remote

Choose ONE of these repository names and run the command:

### Option A: If your repo is named `AIGO_SYNDICAT`
```bash
git remote add origin https://github.com/cvf223/AIGO_SYNDICAT.git
```

### Option B: If your repo is named `aigo-construction-syndicate`
```bash
git remote add origin https://github.com/cvf223/aigo-construction-syndicate.git
```

## Step 3: Push with your token

```bash
git push -u origin main
```

When prompted:
- Username: `cvf223`
- Password: **PASTE YOUR PERSONAL ACCESS TOKEN** (not your GitHub password!)

## Alternative: Use token in URL (easier)

You can include the token directly in the URL:
```bash
git remote add origin https://YOUR_TOKEN@github.com/cvf223/REPO_NAME.git
```

Replace:
- `YOUR_TOKEN` with your personal access token
- `REPO_NAME` with either `AIGO_SYNDICAT` or `aigo-construction-syndicate`

## Step 4: Verify it worked

```bash
git remote -v
```

You should see your repository URL listed.

## 🚨 Important Security Note

- NEVER share your personal access token
- Store it securely (password manager recommended)
- You can revoke tokens anytime in GitHub settings

## Need to see your repositories?

Visit: https://github.com/cvf223?tab=repositories

This will show you the exact names of your repositories.
