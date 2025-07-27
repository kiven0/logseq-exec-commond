/**
 * 配置加载模块
 * 从app.yaml文件加载配置
 */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { generateToken } from './utils';

// 配置文件路径
const CONFIG_FILE_PATH = path.resolve(process.cwd(), 'app.yaml');

// 默认配置
const DEFAULT_CONFIG = {
  server: {
    port: 3666,
    prefix: '/api/exec-cmd'
  },
  security: {
    enable_whitelist: true,
    whitelist: ['ls', 'echo', 'cat', 'pwd', 'date', 'whoami', 'ps', 'grep', 'find', 'mkdir', 'touch'],
    enable_token: true,
    token: ''
  },
  logging: {
    level: 'info',
    console: true,
    file: './logs/server.log',
    command_logging: true
  },
  command: {
    timeout: 30000,
    max_output_size: 1048576 // 1MB
  }
};

// 配置类型定义
export interface AppConfig {
  server: {
    port: number;
    prefix: string;
  };
  security: {
    enable_whitelist: boolean;
    whitelist: string[];
    enable_token: boolean;
    token: string;
  };
  logging: {
    level: string;
    console: boolean;
    file: string;
    command_logging: boolean;
  };
  command: {
    timeout: number;
    max_output_size: number;
  };
}

/**
 * 加载配置文件
 * @returns 配置对象
 */
export function loadConfig(): AppConfig {
  try {
    // 检查配置文件是否存在
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
      console.log(`配置文件不存在: ${CONFIG_FILE_PATH}，使用默认配置`);
      return DEFAULT_CONFIG;
    }

    // 读取配置文件
    const fileContent = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
    const config = yaml.load(fileContent) as AppConfig;

    // 合并默认配置和文件配置
    return {
      server: {
        ...DEFAULT_CONFIG.server,
        ...config.server
      },
      security: {
        ...DEFAULT_CONFIG.security,
        ...config.security
      },
      logging: {
        ...DEFAULT_CONFIG.logging,
        ...config.logging
      },
      command: {
        ...DEFAULT_CONFIG.command,
        ...config.command
      }
    };
  } catch (error: any) {
    console.error(`加载配置文件失败: ${error.message}`);
    return DEFAULT_CONFIG;
  }
}

/**
 * 获取Token
 * @param config 配置对象
 * @returns Token字符串
 */
export function getToken(config: AppConfig): string {
  // 如果未启用Token认证，返回空字符串
  if (!config.security.enable_token) {
    return '';
  }

  // 如果配置中已有token，直接使用
  if (config.security.token && config.security.token.trim() !== '') {
    return config.security.token;
  }

  // 生成新Token
  const token = generateToken();
  console.log(`已生成新Token: ${token}`);
  return token;
}

// 导出配置实例
export const config = loadConfig();
export const token = getToken(config);

export default {
  config,
  token,
  loadConfig,
  getToken
};