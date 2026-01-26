export type WebviewMessage =
  | { type: "terminalInput"; data: string }
  | { type: "terminalResize"; cols: number; rows: number }
  | { type: "openFile"; path: string; line?: number; column?: number }
  | { type: "openUrl"; url: string }
  | { type: "ready" }
  | { type: "filesDropped"; files: string[]; shiftKey: boolean };

export type HostMessage =
  | { type: "terminalOutput"; data: string }
  | { type: "terminalExited" }
  | { type: "focusTerminal" };
