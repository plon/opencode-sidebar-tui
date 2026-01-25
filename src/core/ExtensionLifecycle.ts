import * as vscode from "vscode";
import { OpenCodeTuiProvider } from "../providers/OpenCodeTuiProvider";
import { TerminalManager } from "../terminals/TerminalManager";

/**
 * Manages extension activation, service initialization, and cleanup.
 */
export class ExtensionLifecycle {
  private terminalManager: TerminalManager | undefined;
  private tuiProvider: OpenCodeTuiProvider | undefined;

  async activate(context: vscode.ExtensionContext): Promise<void> {
    console.log("Initializing OpenCode Sidebar TUI...");

    try {
      // Initialize terminal manager
      this.terminalManager = new TerminalManager();

      // Initialize TUI provider
      this.tuiProvider = new OpenCodeTuiProvider(context, this.terminalManager);

      // Register webview provider
      const provider = vscode.window.registerWebviewViewProvider(
        OpenCodeTuiProvider.viewType,
        this.tuiProvider,
        {
          webviewOptions: {
            retainContextWhenHidden: true,
          },
        },
      );
      context.subscriptions.push(provider);

      // Register commands
      this.registerCommands(context);

      console.log("OpenCode Sidebar TUI activated successfully");
    } catch (error) {
      console.error("Failed to activate OpenCode Sidebar TUI:", error);
      vscode.window.showErrorMessage(
        `Failed to activate OpenCode Sidebar TUI: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private registerCommands(context: vscode.ExtensionContext): void {
    // Start OpenCode command
    const startCommand = vscode.commands.registerCommand(
      "opencodeTui.start",
      () => {
        this.tuiProvider?.startOpenCode();
      },
    );

    // Restart OpenCode command
    const restartCommand = vscode.commands.registerCommand(
      "opencodeTui.restart",
      () => {
        this.tuiProvider?.restartOpenCode();
      },
    );

    // Clear terminal command
    const clearCommand = vscode.commands.registerCommand(
      "opencodeTui.clear",
      () => {
        this.tuiProvider?.clearTerminal();
      },
    );

    context.subscriptions.push(startCommand, restartCommand, clearCommand);
  }

  async deactivate(): Promise<void> {
    console.log("Deactivating OpenCode Sidebar TUI...");

    if (this.tuiProvider) {
      this.tuiProvider.dispose();
      this.tuiProvider = undefined;
    }

    if (this.terminalManager) {
      this.terminalManager.dispose();
      this.terminalManager = undefined;
    }

    console.log("OpenCode Sidebar TUI deactivated");
  }
}
