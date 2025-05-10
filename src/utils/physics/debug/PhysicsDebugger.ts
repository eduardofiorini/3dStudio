type LogLevel = 'info' | 'warn' | 'error';

interface PhysicsDebugInfo {
  objectId: string;
  type: string;
  message: string;
  data?: any;
}

export class PhysicsDebugger {
  private static enabled = true;
  private static history: PhysicsDebugInfo[] = [];

  static enable(): void {
    this.enabled = true;
  }

  static disable(): void {
    this.enabled = false;
  }

  static log(level: LogLevel, info: PhysicsDebugInfo): void {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      ...info
    };

    this.history.push(logEntry);

    switch (level) {
      case 'info':
        console.log(`[Physics] ${info.message}`, info.data);
        break;
      case 'warn':
        console.warn(`[Physics] ${info.message}`, info.data);
        break;
      case 'error':
        console.error(`[Physics] ${info.message}`, info.data);
        break;
    }
  }

  static getHistory(): PhysicsDebugInfo[] {
    return this.history;
  }

  static clearHistory(): void {
    this.history = [];
  }
}