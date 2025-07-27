/**
 * 服务器配置文件
 * 从config-loader加载配置
 */
import { config, token } from './config-loader';

// 服务器配置
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : config.server.port;
export const API_PREFIX = config.server.prefix;

// CORS配置
export const ENABLE_CORS = process.env.ENABLE_CORS === 'true';
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

// 日志配置
export const LOG_LEVEL = process.env.LOG_LEVEL || config.logging.level;
export const LOG_FILE_PATH = process.env.LOG_FILE_PATH || config.logging.file;
export const LOG_TO_CONSOLE = process.env.LOG_TO_CONSOLE !== 'false' ? true : config.logging.console;
export const ENABLE_COMMAND_LOGGING = process.env.DISABLE_COMMAND_LOGGING !== 'true' ? true : config.logging.command_logging;

// 命令执行配置
export const COMMAND_TIMEOUT = process.env.COMMAND_TIMEOUT
  ? parseInt(process.env.COMMAND_TIMEOUT, 10)
  : config.command.timeout;
export const MAX_OUTPUT_SIZE = process.env.MAX_OUTPUT_SIZE
  ? parseInt(process.env.MAX_OUTPUT_SIZE, 10)
  : config.command.max_output_size;

// 安全配置
export const ENABLE_WHITELIST = process.env.ENABLE_WHITELIST !== 'false' ? true : config.security.enable_whitelist;
export const COMMAND_WHITELIST = process.env.COMMAND_WHITELIST
  ? process.env.COMMAND_WHITELIST.split(',')
  : config.security.whitelist;

// Token认证
export const ENABLE_TOKEN = process.env.ENABLE_TOKEN !== 'false' ? true : config.security.enable_token;
export const TOKEN = token;

// 兼容旧版API密钥认证（已弃用，使用TOKEN代替）
export const ENABLE_API_KEY = process.env.ENABLE_API_KEY === 'true';
export const API_KEY = process.env.API_KEY || '';

// 配置对象，用于导出所有配置
export default {
  PORT,
  API_PREFIX,
  ENABLE_CORS,
  ALLOWED_ORIGINS,
  LOG_LEVEL,
  COMMAND_TIMEOUT,
  MAX_OUTPUT_SIZE,
  ENABLE_WHITELIST,
  COMMAND_WHITELIST,
  ENABLE_COMMAND_LOGGING,
  LOG_FILE_PATH,
  LOG_TO_CONSOLE,
  ENABLE_TOKEN,
  TOKEN,
  ENABLE_API_KEY,
  API_KEY,
};