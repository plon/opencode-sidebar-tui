/**
 * Main entry point for the OpenCode Sidebar TUI VS Code extension.
 */

import * as vscode from "vscode";
import { ExtensionLifecycle } from "./core/ExtensionLifecycle";

const lifecycle = new ExtensionLifecycle();

export function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log("OpenCode Sidebar TUI extension activating...");
  return lifecycle.activate(context);
}

export async function deactivate(): Promise<void> {
  console.log("OpenCode Sidebar TUI extension deactivating...");
  await lifecycle.deactivate();
}
