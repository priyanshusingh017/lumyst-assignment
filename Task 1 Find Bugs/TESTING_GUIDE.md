# Testing Guide for Lumyst VS Code Extension

## Installation Steps

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Lumyst"
4. Install the extension
5. Reload VS Code if necessary

## Getting Environment Information

### VS Code Version
- Help -> About (or Ctrl+Shift+P -> "About")

### Lumyst Extension Version
- Extensions view -> Click on Lumyst -> Check version number

### System Information
```powershell
# Run in PowerShell
systeminfo | findstr /B /C:"OS Name" /C:"OS Version"
node --version
npm --version
```

### Accessing Developer Tools
- Press: **Ctrl+Shift+P**
- Type: **Developer: Toggle Developer Tools**
- Check the **Console** tab for errors
- Check the **Network** tab for failed requests
- Check the **Application** tab for storage issues

## Areas to Test

### 1. Core Functionality
- [ ] Extension activation
- [ ] Graph generation
- [ ] Code navigation
- [ ] Search functionality
- [ ] Filtering options

### 2. Graph Visualization
- [ ] Node rendering
- [ ] Edge rendering
- [ ] Zoom and pan
- [ ] Node selection
- [ ] Layout algorithms
- [ ] Performance with large codebases

### 3. User Interactions
- [ ] Right-click menus
- [ ] Keyboard shortcuts
- [ ] Tooltips and hover effects
- [ ] Multi-selection
- [ ] Drag and drop

### 4. Edge Cases
- [ ] Empty projects
- [ ] Very large codebases (>20k LOC)
- [ ] Different file types
- [ ] Circular dependencies
- [ ] Missing files/broken imports
- [ ] Non-standard project structures

### 5. Performance
- [ ] Initial load time
- [ ] Graph rendering time
- [ ] Memory usage (check Task Manager)
- [ ] CPU usage during operations
- [ ] Responsiveness during heavy operations

### 6. Integration
- [ ] Multi-root workspaces
- [ ] Git integration
- [ ] Other extensions compatibility
- [ ] Different language support

### 7. Error Handling
- [ ] Invalid file paths
- [ ] Permission errors
- [ ] Network failures (if applicable)
- [ ] Malformed configuration

## What Counts as a Bug

- **Actual broken functionality** - Features that don't work as intended
- **Security vulnerabilities** - Exposed sensitive data, XSS, injection flaws
- **Performance bottlenecks** - Freezing, excessive memory/CPU usage, slow rendering

## What Doesn't Count as a Bug

- **Behaviors by design** - e.g., nodes hiding until right-clicked
- **Minor cosmetic/UI preferences** - Color choices, font sizes (unless they affect usability)
- **Feature requests** - Things that could be added but aren't bugs

## Testing Tips

1. **Test with different project types**:
   - JavaScript/TypeScript projects
   - Python projects
   - Large open-source repositories
   - Your own projects

2. **Test different scenarios**:
   - Fresh installation
   - After updates
   - With other extensions enabled/disabled
   - Different VS Code themes

3. **Monitor system resources**:
   - Open Task Manager (Ctrl+Shift+Esc)
   - Watch CPU and Memory usage

4. **Capture everything**:
   - Take screenshots
   - Record videos if needed
   - Copy full error messages
   - Save console logs

5. **Be systematic**:
   - Test one feature at a time
   - Document as you go
   - Try to reproduce bugs multiple times

## Logging Best Practices

When capturing logs from Developer Tools:

1. Clear the console before reproducing the bug
2. Reproduce the bug
3. Copy ALL relevant console output
4. Include:
   - Error messages
   - Warnings
   - Stack traces
   - Network requests (if relevant)
   - Timestamps

## Example Bug Report Structure

```
Title: Graph fails to render when project exceeds 10k nodes

Description:
When analyzing a large codebase (tested with React repository, ~15k files),
the graph visualization hangs and never completes rendering.

Classification: Performance bottleneck + Broken functionality

Steps to Reproduce:
1. Clone React repository (facebook/react)
2. Open in VS Code
3. Activate Lumyst extension
4. Attempt to generate graph
5. Wait 5+ minutes - graph never appears

Expected: Graph should render or show a "too large" warning
Actual: Extension hangs, no feedback, high CPU usage

Logs: [Console shows repeated "Maximum call stack exceeded" errors]
```

