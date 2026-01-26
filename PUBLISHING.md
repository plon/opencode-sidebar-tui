# Publishing to VS Code Marketplace

This guide will help you publish the **OpenCode Sidebar TUI** extension to the VS Code Marketplace.

## Prerequisites Checklist

- ✅ Extension built and packaged
- ✅ Version: 0.1.0
- ✅ Publisher: ilseoblee
- ✅ Repository: https://github.com/ilseoblee/opencode-sidebar-tui
- ✅ License: MIT
- ✅ README: Comprehensive documentation

## Step-by-Step Publishing Process

### Step 1: Create Publisher Account

1. Go to https://marketplace.visualstudio.com/manage
2. Sign in with your **Microsoft account**
3. If you don't have a publisher named "ilseoblee":
   - Click **"Create publisher"**
   - Fill in:
     - **Publisher ID**: `ilseoblee` (must match package.json)
     - **Display Name**: Your display name
     - **Email**: Your email address

### Step 2: Get Personal Access Token (PAT)

1. Go to https://dev.azure.com
2. Sign in with the **same Microsoft account**
3. Click your **profile icon** (top right) → **Personal access tokens**
4. Click **"+ New Token"**
5. Configure the token:
   - **Name**: `VS Code Extensions Publishing`
   - **Organization**: **All accessible organizations**
   - **Expiration**: Custom (recommended: 1 year)
   - **Scopes**:
     - Click **"Show all scopes"**
     - Expand **"Marketplace"**
     - Check **"Manage"** ✓
6. Click **"Create"**
7. **⚠️ IMPORTANT**: Copy the token immediately (you won't see it again!)

### Step 3: Login with vsce

Open terminal in the project directory and run:

```bash
npx @vscode/vsce login ilseoblee
```

When prompted, paste your Personal Access Token.

### Step 4: Publish the Extension

#### Option A: Publish Current Version (0.1.0)

```bash
npx @vscode/vsce publish
```

#### Option B: Publish and Increment Version

```bash
# Patch version (0.1.0 -> 0.1.1)
npx @vscode/vsce publish patch

# Minor version (0.1.0 -> 0.2.0)
npx @vscode/vsce publish minor

# Major version (0.1.0 -> 1.0.0)
npx @vscode/vsce publish major
```

### Step 5: Verify Publication

1. Wait 5-10 minutes for marketplace indexing
2. Visit: https://marketplace.visualstudio.com/items?itemName=ilseoblee.opencode-sidebar-tui
3. Search in VS Code: "OpenCode Sidebar TUI"

## Publishing Status

**Current Status**: ❌ Not Published (awaiting PAT authentication)

**Error encountered**:

```
ERROR: The Personal Access Token verification has failed.
TF400813: The user is not authorized to access this resource.
```

**Resolution**: Follow Steps 1-4 above to authenticate and publish.

## Troubleshooting

### "Publisher not found"

- Ensure you created the publisher "ilseoblee" in Step 1
- Verify the publisher ID matches package.json exactly

### "Invalid PAT token"

- Generate a new token with "Marketplace: Manage" scope
- Ensure the token hasn't expired
- Make sure you're using the same Microsoft account

### "Version already exists"

- Use `--skip-duplicate` flag
- Or increment version: `vsce publish patch`

### "EACCES permission denied"

- Run with sudo: `sudo npx @vscode/vsce publish`
- Or fix npm permissions: https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally

## Future Updates

After initial publication, update the extension with:

```bash
# Update code, then:
npx @vscode/vsce publish patch  # For bug fixes
npx @vscode/vsce publish minor  # For new features
npx @vscode/vsce publish major  # For breaking changes
```

## Useful Commands

```bash
# Show what will be published
npx @vscode/vsce ls

# Package without publishing
npx @vscode/vsce package

# Show publisher info
npx @vscode/vsce show ilseoblee

# Unpublish (use carefully!)
npx @vscode/vsce unpublish ilseoblee.opencode-sidebar-tui
```

## Support

- Marketplace Publisher Portal: https://marketplace.visualstudio.com/manage
- VS Code Publishing Docs: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- Azure DevOps: https://dev.azure.com

---

**Ready to publish?** Follow Steps 1-4 above, then run `npx @vscode/vsce publish`
