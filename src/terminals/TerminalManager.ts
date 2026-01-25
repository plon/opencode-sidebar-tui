import * as vscode from "vscode";
import * as pty from "node-pty";
import * as os from "os";

export interface Terminal {
  id: string;
  process: pty.IPty;
  onData: vscode.EventEmitter<{ id: string; data: string }>;
  onExit: vscode.EventEmitter<string>;
}

export class TerminalManager {
  private terminals: Map<string, Terminal> = new Map();
  private readonly _onData = new vscode.EventEmitter<{
    id: string;
    data: string;
  }>();
  private readonly _onExit = new vscode.EventEmitter<string>();

  readonly onData = this._onData.event;
  readonly onExit = this._onExit.event;

  createTerminal(id: string, command?: string): Terminal {
    if (this.terminals.has(id)) {
      this.killTerminal(id);
    }

    const shell = this.getDefaultShell();
    const args = command ? ["-c", command] : [];

    const ptyProcess = pty.spawn(shell, args, {
      name: "xterm-256color",
      cols: 80,
      rows: 24,
      cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || os.homedir(),
      env: { ...process.env, TERM: "xterm-256color" } as Record<string, string>,
    });

    const onDataEmitter = new vscode.EventEmitter<{
      id: string;
      data: string;
    }>();
    const onExitEmitter = new vscode.EventEmitter<string>();

    const terminal: Terminal = {
      id,
      process: ptyProcess,
      onData: onDataEmitter,
      onExit: onExitEmitter,
    };

    ptyProcess.onData((data) => {
      onDataEmitter.fire({ id, data });
      this._onData.fire({ id, data });
    });

    ptyProcess.onExit(() => {
      onExitEmitter.fire(id);
      this._onExit.fire(id);
      this.terminals.delete(id);
    });

    this.terminals.set(id, terminal);
    return terminal;
  }

  getTerminal(id: string): Terminal | undefined {
    return this.terminals.get(id);
  }

  writeToTerminal(id: string, data: string): void {
    const terminal = this.terminals.get(id);
    if (terminal) {
      terminal.process.write(data);
    }
  }

  resizeTerminal(id: string, cols: number, rows: number): void {
    const terminal = this.terminals.get(id);
    if (terminal) {
      terminal.process.resize(cols, rows);
    }
  }

  killTerminal(id: string): void {
    const terminal = this.terminals.get(id);
    if (terminal) {
      terminal.process.kill();
      terminal.onData.dispose();
      terminal.onExit.dispose();
      this.terminals.delete(id);
    }
  }

  dispose(): void {
    for (const [id] of this.terminals) {
      this.killTerminal(id);
    }
    this._onData.dispose();
    this._onExit.dispose();
  }

  private getDefaultShell(): string {
    const platform = os.platform();
    if (platform === "win32") {
      return process.env.COMSPEC || "cmd.exe";
    }
    return process.env.SHELL || "/bin/bash";
  }
}
