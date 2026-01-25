# OpenCode Sidebar TUI

Automatically render OpenCode TUI in VS Code sidebar with full terminal support.

## Features

- **Auto-launch OpenCode**: Opens OpenCode automatically when the sidebar is activated
- **Full TUI Support**: Complete terminal emulation with xterm.js and WebGL rendering
- **Single Command**: Simple, focused experience for OpenCode interactions
- **Configurable**: Customize command, font, and terminal settings

## Installation

### From Source

1. Clone the repository:

```bash
git clone https://github.com/ilseoblee/opencode-sidebar-tui.git
cd opencode-sidebar-tui
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run compile
```

4. Package the extension:

```bash
npx @vscode/vsce package
```

5. Install in VS Code:

- Open VS Code
- Go to Extensions (Cmd+Shift+X)
- Click "..." menu → "Install from VSIX"
- Select the generated `.vsix` file

## Usage

1. Click the OpenCode icon in the activity bar (sidebar)
2. OpenCode TUI automatically starts
3. Interact with OpenCode directly in the sidebar

## Commands

- **OpenCode TUI: Start OpenCode** - Manually start OpenCode
- **OpenCode TUI: Restart OpenCode** - Restart the OpenCode process
- **OpenCode TUI: Clear Terminal** - Clear the terminal display

## Configuration

Available settings in VS Code settings (Cmd+,):

```json
{
  "opencodeTui.autoStart": true,
  "opencodeTui.command": "omo",
  "opencodeTui.fontSize": 14,
  "opencodeTui.fontFamily": "monospace",
  "opencodeTui.cursorBlink": true,
  "opencodeTui.cursorStyle": "block",
  "opencodeTui.scrollback": 10000
}
```

## Requirements

- VS Code 1.106.0 or higher
- Node.js 18.0.0 or higher
- OpenCode installed and accessible via `omo` or `opencode` command

## Development

### Build

```bash
npm run compile    # Development build
npm run watch      # Watch mode
npm run package    # Production build
```

### Project Structure

```
opencode-sidebar-tui/
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── core/
│   │   └── ExtensionLifecycle.ts # Lifecycle management
│   ├── providers/
│   │   └── OpenCodeTuiProvider.ts # WebView provider
│   ├── terminals/
│   │   └── TerminalManager.ts    # Terminal process manager
│   └── webview/
│       └── main.ts               # WebView entry (xterm.js)
├── package.json
├── tsconfig.json
└── webpack.config.js
```

## Implementation Details

Based on the excellent [vscode-sidebar-terminal](https://github.com/s-hiraoku/vscode-sidebar-terminal) extension, streamlined specifically for OpenCode TUI:

- **Terminal Backend**: node-pty for PTY support
- **Terminal Frontend**: xterm.js with WebGL rendering
- **Process Management**: Automatic OpenCode lifecycle
- **WebView Communication**: Bidirectional messaging for terminal I/O

## License

MIT

## Acknowledgments

- Based on [vscode-sidebar-terminal](https://github.com/s-hiraoku/vscode-sidebar-terminal) by s-hiraoku
- Uses [xterm.js](https://github.com/xtermjs/xterm.js) for terminal emulation
- Uses [node-pty](https://github.com/microsoft/node-pty) for PTY support
