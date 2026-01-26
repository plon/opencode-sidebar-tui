import * as vscode from "vscode";
import { TerminalManager } from "../terminals/TerminalManager";

export class OpenCodeTuiProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "opencodeTui";
  private _view?: vscode.WebviewView;
  private terminalId = "opencode-main";
  private isStarted = false;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly terminalManager: TerminalManager,
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void | Thenable<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      this.handleMessage(message);
    });

    const config = vscode.workspace.getConfiguration("opencodeTui");
    if (config.get<boolean>("autoStartOnOpen", true)) {
      // Only start if sidebar is currently visible
      if (webviewView.visible) {
        this.startOpenCode();
      } else {
        // Wait until sidebar becomes visible
        const visibilityListener = webviewView.onDidChangeVisibility(() => {
          if (webviewView.visible && !this.isStarted) {
            this.startOpenCode();
            visibilityListener.dispose(); // Only trigger once
          }
        });

        // Clean up listener when view is disposed
        webviewView.onDidDispose(() => visibilityListener.dispose());
      }
    }
  }

  public focus(): void {
    if (this._view && this._view.webview) {
      this._view.webview.postMessage({ type: "focusTerminal" });
    }
  }

  startOpenCode(): void {
    if (this.isStarted) {
      return;
    }

    const config = vscode.workspace.getConfiguration("opencodeTui");
    const command = config.get<string>("command", "opencode -c");

    this.terminalManager.createTerminal(this.terminalId, command);

    this.terminalManager.onData((event) => {
      if (event.id === this.terminalId) {
        this._view?.webview.postMessage({
          type: "terminalOutput",
          data: event.data,
        });
      }
    });

    this.terminalManager.onExit((id) => {
      if (id === this.terminalId) {
        this.isStarted = false;
        this._view?.webview.postMessage({
          type: "terminalExited",
        });
      }
    });

    this.isStarted = true;
  }

  restartOpenCode(): void {
    if (this.isStarted) {
      this.terminalManager.killTerminal(this.terminalId);
      this.isStarted = false;
    }
    setTimeout(() => this.startOpenCode(), 100);
  }

  private handleMessage(message: any): void {
    switch (message.type) {
      case "terminalInput":
        this.terminalManager.writeToTerminal(this.terminalId, message.data);
        break;
      case "terminalResize":
        this.terminalManager.resizeTerminal(
          this.terminalId,
          message.cols,
          message.rows,
        );
        break;
      case "ready":
        if (!this.isStarted) {
          this.startOpenCode();
        }
        break;
      case "filesDropped":
        this.handleFilesDropped(message.files, message.shiftKey);
        break;
      case "openUrl":
        vscode.env.openExternal(vscode.Uri.parse(message.url));
        break;
      case "openFile":
        this.handleOpenFile(message.path, message.line, message.column);
        break;
    }
  }

  private async handleOpenFile(
    path: string,
    line?: number,
    column?: number,
  ): Promise<void> {
    try {
      let uri: vscode.Uri;
      if (vscode.Uri.parse(path).scheme === "file") {
        uri = vscode.Uri.file(path);
      } else if (path.startsWith("/")) {
        uri = vscode.Uri.file(path);
      } else {
        // Relative path
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
          uri = vscode.Uri.joinPath(workspaceFolders[0].uri, path);
        } else {
          uri = vscode.Uri.file(path);
        }
      }

      const selection = line
        ? new vscode.Range(
            Math.max(0, line - 1),
            Math.max(0, (column || 1) - 1),
            Math.max(0, line - 1),
            Math.max(0, (column || 1) - 1),
          )
        : undefined;

      await vscode.window.showTextDocument(uri, {
        selection,
        preview: true,
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open file: ${path}`);
    }
  }

  private handleFilesDropped(files: string[], shiftKey: boolean): void {
    console.log(
      "[PROVIDER] handleFilesDropped - files:",
      files,
      "shiftKey:",
      shiftKey,
    );
    if (shiftKey) {
      const fileRefs = files
        .map((file) => `@${vscode.workspace.asRelativePath(file)}`)
        .join(" ");
      console.log("[PROVIDER] Writing with @:", fileRefs);
      this.terminalManager.writeToTerminal(this.terminalId, fileRefs + " ");
    } else {
      const filePaths = files
        .map((file) => vscode.workspace.asRelativePath(file))
        .join(" ");
      console.log("[PROVIDER] Writing without @:", filePaths);
      this.terminalManager.writeToTerminal(this.terminalId, filePaths + " ");
    }
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "dist", "webview.js"),
    );

    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OpenCode TUI</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      height: 100%;
      overflow: hidden;
      background-color: #1e1e1e;
    }
    #terminal-container {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="terminal-container"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private getNonce(): string {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  dispose(): void {
    if (this.isStarted) {
      this.terminalManager.killTerminal(this.terminalId);
    }
  }
}
