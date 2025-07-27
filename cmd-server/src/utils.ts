/**
 * 工具函数模块
 */
import shell from 'shelljs';
import { COMMAND_TIMEOUT, MAX_OUTPUT_SIZE } from './config';
import { logger, logCommand } from './logger-winston';
import { isCommandDangerous } from './blacklist';

/**
 * 执行shell命令
 * @param command 要执行的命令
 * @returns 包含命令输出和错误信息的Promise
 */
export const executeCommand = (command: string): Promise<{ output: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    // 检查命令是否危险
    if (isCommandDangerous(command)) {
      const errorMessage = `命令被拒绝执行: ${command}`;
      logger.warn(errorMessage);
      logCommand(command, '', errorMessage);
      return reject(new Error(errorMessage));
    }

    logger.info(`执行命令: ${command}`);

    // 设置超时
    const timeoutId = setTimeout(() => {
      logger.warn(`命令执行超时: ${command}`);
      reject(new Error(`命令执行超时，已终止`));
    }, COMMAND_TIMEOUT);

    // 使用shelljs执行命令
    const result = shell.exec(command, { silent: true, async: false });
    
    // 清除超时
    clearTimeout(timeoutId);

    // 记录命令执行
    logCommand(command, result.stdout, result.stderr);

    if (result.code !== 0) {
      logger.error(`命令执行失败: ${command}`, { code: result.code });
      // 我们不拒绝Promise，而是返回错误信息和输出
      return resolve({ output: result.stdout, stderr: result.stderr });
    }

    logger.debug(`命令执行成功: ${command}`);
    resolve({ output: result.stdout, stderr: result.stderr });
  });
};

/**
 * 格式化日期时间
 * @returns 格式化的日期时间字符串
 */
export const formatDateTime = (): string => {
  const now = new Date();
  return now.toISOString();
};

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * 生成安全的Token
 * @returns Token字符串
 */
export const generateToken = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 15)
  );
};

/**
 * 安全地解析JSON
 * @param str 要解析的JSON字符串
 * @param defaultValue 解析失败时的默认值
 * @returns 解析后的对象或默认值
 */
export const safeJsonParse = <T>(str: string, defaultValue: T): T => {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    logger.error(`JSON解析失败: ${str.substring(0, 100)}...`);
    return defaultValue;
  }
};

/**
 * 截断字符串到指定长度
 * @param str 要截断的字符串
 * @param maxLength 最大长度
 * @returns 截断后的字符串
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + '...';
};

/**
 * 检查字符串是否为空或只包含空白字符
 * @param str 要检查的字符串
 * @returns 是否为空或只包含空白字符
 */
export const isEmptyString = (str: string | null | undefined): boolean => {
  return !str || str.trim() === '';
};

/**
 * 延迟函数
 * @param ms 延迟的毫秒数
 * @returns Promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default {
  executeCommand,
  formatDateTime,
  generateId,
  generateToken,
  safeJsonParse,
  truncateString,
  isEmptyString,
  delay,
};