/**
 * Simple logger utility for the application
 */

type LogLevel = "info" | "warn" | "error" | "debug";

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Can be controlled via environment variable in the future
const CURRENT_LOG_LEVEL =
  process.env.NODE_ENV === "production" ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL as LogLevel];
}

function formatMessage(
  level: LogLevel,
  message: string,
  ...args: any[]
): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  return `${prefix} ${message}`;
}

export const logger = {
  debug(message: string, ...args: any[]) {
    if (shouldLog("debug")) {
      console.debug(formatMessage("debug", message), ...args);
    }
  },

  info(message: string, ...args: any[]) {
    if (shouldLog("info")) {
      console.info(formatMessage("info", message), ...args);
    }
  },

  warn(message: string, ...args: any[]) {
    if (shouldLog("warn")) {
      console.warn(formatMessage("warn", message), ...args);
    }
  },

  error(message: string, ...args: any[]) {
    if (shouldLog("error")) {
      console.error(formatMessage("error", message), ...args);
    }
  },
};
