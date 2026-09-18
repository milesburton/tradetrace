const logLevel = Deno.env.get("LOG_LEVEL") || "info";

type LogLevel = "debug" | "info" | "warn" | "error";

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel = levels[logLevel as LogLevel] ?? levels.info;

function format(level: LogLevel, message: string, data?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const msg = data ? `${message} ${JSON.stringify(data)}` : message;
  return `[${timestamp}] ${level.toUpperCase()}: ${msg}`;
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    if (currentLevel <= levels.debug) console.debug(format("debug", message, data));
  },
  info: (message: string, data?: Record<string, unknown>) => {
    if (currentLevel <= levels.info) console.log(format("info", message, data));
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    if (currentLevel <= levels.warn) console.warn(format("warn", message, data));
  },
  error: (message: string, data?: Record<string, unknown>) => {
    if (currentLevel <= levels.error) console.error(format("error", message, data));
  },
};
