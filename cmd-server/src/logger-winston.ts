/**
 * 日志记录模块 - 使用Winston
 */
import winston from 'winston';
import path from 'path';
import fs from 'fs';
import { LOG_LEVEL, LOG_FILE_PATH, LOG_TO_CONSOLE, ENABLE_COMMAND_LOGGING } from './config';

// 确保日志目录存在
const ensureLogDirectory = () => {
  if (!LOG_FILE_PATH) return; // 如果日志文件路径未定义，则跳过
  const logDir = path.dirname(LOG_FILE_PATH);
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
};

// 创建日志目录
ensureLogDirectory();

// 日志级别映射
const logLevelMap: { [key: string]: string } = {
  'error': 'error',
  'warn': 'warn',
  'info': 'info',
  'debug': 'debug'
};

// 获取日志级别
const getLogLevel = (level: string | undefined): string => {
  if (!level) {
    return 'info'; // 默认为INFO级别
  }
  
  const normalizedLevel = level.toLowerCase();
  return logLevelMap[normalizedLevel] || 'info';
};

// 创建Winston日志记录器
const winstonLogger = winston.createLogger({
  level: getLogLevel(LOG_LEVEL),
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    // 默认添加一个控制台传输器，确保至少有一个传输器
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        })
      )
    })
  ]
});

// 如果日志文件路径已定义，添加文件传输
if (LOG_FILE_PATH) {
  winstonLogger.add(new winston.transports.File({ filename: LOG_FILE_PATH }));
}

// 导出日志函数
export const logger = {
  error: (message: string, meta?: any) => {
    if (meta) {
      winstonLogger.error(`${message} - ${JSON.stringify(meta)}`);
    } else {
      winstonLogger.error(message);
    }
  },
  warn: (message: string, meta?: any) => {
    if (meta) {
      winstonLogger.warn(`${message} - ${JSON.stringify(meta)}`);
    } else {
      winstonLogger.warn(message);
    }
  },
  info: (message: string, meta?: any) => {
    if (meta) {
      winstonLogger.info(`${message} - ${JSON.stringify(meta)}`);
    } else {
      winstonLogger.info(message);
    }
  },
  debug: (message: string, meta?: any) => {
    if (meta) {
      winstonLogger.debug(`${message} - ${JSON.stringify(meta)}`);
    } else {
      winstonLogger.debug(message);
    }
  }
};

// 命令日志记录
export const logCommand = (command: string, output: string, error?: string) => {
  if (!ENABLE_COMMAND_LOGGING) {
    return;
  }

  const logEntry = {
    command,
    output: output.substring(0, 1000), // 限制输出大小
    error: error ? error.substring(0, 1000) : undefined,
  };

  logger.info(`Command executed: ${command}`, logEntry);
};

export default logger;