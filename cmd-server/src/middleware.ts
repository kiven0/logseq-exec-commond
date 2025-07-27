/**
 * 中间件模块
 */
import { Request, Response, NextFunction } from 'express';
import { ENABLE_API_KEY, API_KEY, ENABLE_CORS, ALLOWED_ORIGINS, ENABLE_TOKEN, TOKEN } from './config';
import { logger } from './logger-winston';

// 响应格式化函数
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

const formatResponse = <T>(code: number, message: string, data: T | null = null): ApiResponse<T> => {
  return { code, message, data };
};

/**
 * 请求日志中间件
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;

  // 记录请求开始
  logger.info(`${method} ${url} - 开始处理请求 [${ip}]`);

  // 响应完成时记录
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    if (statusCode >= 400) {
      logger.warn(`${method} ${url} - ${statusCode} - ${duration}ms [${ip}]`);
    } else {
      logger.info(`${method} ${url} - ${statusCode} - ${duration}ms [${ip}]`);
    }
  });

  next();
};

/**
 * API密钥认证中间件（已弃用，使用tokenAuth代替）
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
  // 如果未启用API密钥认证，直接通过
  if (!ENABLE_API_KEY) {
    return next();
  }

  // 从请求头中获取API密钥
  const apiKey = req.headers['x-api-key'] as string;

  // 验证API密钥
  if (!apiKey || apiKey !== API_KEY) {
    logger.warn(`API密钥认证失败: ${req.ip}`);
    return res.status(401).json(formatResponse(401, '未授权：无效的API密钥'));
  }

  next();
};

/**
 * Token认证中间件
 */
export const tokenAuth = (req: Request, res: Response, next: NextFunction) => {
  // 如果未启用Token认证，直接通过
  if (!ENABLE_TOKEN) {
    return next();
  }

  // 从请求头中获取Token
  const token = req.headers['x-token'] as string;

  // 验证Token
  if (!token || token !== TOKEN) {
    logger.warn(`Token认证失败: ${req.ip}`);
    return res.status(401).json(formatResponse(401, '未授权：无效的Token'));
  }

  next();
};

/**
 * CORS中间件
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 如果未启用CORS，直接通过
  if (!ENABLE_CORS) {
    return next();
  }

  const origin = req.headers.origin;

  // 检查请求来源是否在允许列表中
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // 如果来源不在允许列表中，使用第一个允许的来源
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
  }

  // 设置其他CORS头
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};

/**
 * 错误处理中间件
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`服务器错误: ${err.message}`, { stack: err.stack });

  res.status(500).json(formatResponse(500, process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message));
};

/**
 * 404处理中间件
 */
export const notFoundHandler = (req: Request, res: Response) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`);

  res.status(404).json(formatResponse(404, '未找到请求的资源'));
};

export default {
  requestLogger,
  apiKeyAuth,
  tokenAuth,
  corsMiddleware,
  errorHandler,
  notFoundHandler,
};