/**
 * 命令白名单模块
 */
import { ENABLE_WHITELIST, COMMAND_WHITELIST } from './config';
import { logger } from './logger-winston';

/**
 * 检查命令是否在白名单中
 * @param command 要检查的命令
 * @returns 是否在白名单中
 */
const isInWhitelist = (command: string): boolean => {
  // 如果白名单为空或未启用，返回false
  if (!ENABLE_WHITELIST || COMMAND_WHITELIST.length === 0) {
    return false;
  }
  
  // 将命令转换为小写并去除前后空格
  const normalizedCommand = command.toLowerCase().trim();
  
  // 检查命令是否以白名单中的命令开头
  return COMMAND_WHITELIST.some(whitelistedCmd => {
    const pattern = new RegExp(`^${whitelistedCmd}(\\s|$|;|\\||>|<|&)`);
    return pattern.test(normalizedCommand);
  });
};

/**
 * 检查命令是否危险
 * @param command 要检查的命令
 * @returns 是否危险
 */
export const isCommandDangerous = (command: string): boolean => {
  // 如果命令为空，视为安全
  if (!command || command.trim() === '') {
    return false;
  }
  
  // 如果启用了白名单且命令在白名单中，视为安全
  if (ENABLE_WHITELIST && isInWhitelist(command)) {
    logger.debug(`命令在白名单中，允许执行: ${command}`);
    return false;
  }
  
  // 如果命令不在白名单中，视为危险
  logger.warn(`命令不在白名单中，拒绝执行: ${command}`);
  return true;
};

export default {
  isCommandDangerous,
};