/**
 * Logseq命令执行服务器
 * 提供安全的命令执行API，用于Logseq插件调用
 */
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import { json } from 'body-parser';
import { PORT, API_PREFIX, TOKEN, ENABLE_WHITELIST, COMMAND_WHITELIST } from './config';
import { executeCommand } from './utils';
import { logger } from './logger-winston';
import { isCommandDangerous } from './blacklist';
import { requestLogger, tokenAuth, corsMiddleware, errorHandler, notFoundHandler } from './middleware';

// 响应格式化函数
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
}

const formatResponse = <T>(code: number, message: string, data: T | null = null): ApiResponse<T> => {
  return { code, message, data };
};

// 创建Express应用
const app = express();

// 应用中间件
app.use(json());
app.use(corsMiddleware);
app.use(requestLogger);

// 创建HTTP服务器
const server = http.createServer(app);

// 创建API路由
const apiRouter = express.Router();

// 健康检查接口
apiRouter.post('/health', (req: Request, res: Response) => {
  logger.debug('健康检查请求');
  res.json(formatResponse(0, 'success', {
    status: 'ok',
    message: 'Logseq命令执行服务器运行正常',
    timestamp: new Date().toISOString(),
    token: TOKEN,
    whitelist: {
      enabled: ENABLE_WHITELIST,
      commands: COMMAND_WHITELIST
    }
  }));
});



// 命令执行接口
apiRouter.post('/execute', tokenAuth, async (req: Request, res: Response) => {
  const { command } = req.body;

  // 验证请求参数
  if (!command || typeof command !== 'string') {
    logger.warn('无效的命令请求');
    return res.status(400).json(formatResponse(400, '无效的请求：缺少命令或命令格式不正确'));
  }

  // 检查命令是否在白名单中
  if (isCommandDangerous(command)) {
    logger.warn(`拒绝执行危险命令: ${command}`);
    return res.status(403).json(formatResponse(403, '命令被拒绝：该命令不在允许的白名单中'));
  }

  try {
    logger.info(`执行命令: ${command}`);
    const { output, stderr } = await executeCommand(command);

    // 返回命令执行结果
    res.json(formatResponse(0, 'success', {
      output,
      stderr
    }));
  } catch (error: any) {
    logger.error(`命令执行失败: ${error.message}`);
    res.status(500).json(formatResponse(500, `命令执行失败: ${error.message}`));
  }
});

// 注册API路由
app.use(API_PREFIX, apiRouter);

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 启动服务器
server.listen(PORT, () => {
  logger.info(`服务器已启动: http://localhost:${PORT}`);
  logger.info('可用接口:');
  logger.info(`- 健康检查(含白名单): POST http://localhost:${PORT}${API_PREFIX}/health`);
  logger.info(`- 执行命令: POST http://localhost:${PORT}${API_PREFIX}/execute`);
  logger.info(`- 服务Token: ${TOKEN}`);
  logger.info(`- 白名单状态: ${ENABLE_WHITELIST ? '启用' : '禁用'}`);
});

// 处理进程信号
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在关闭服务器...');
  gracefulShutdown();
});

process.on('SIGINT', () => {
  logger.info('收到SIGINT信号，正在关闭服务器...');
  gracefulShutdown();
});

// 优雅关闭
function gracefulShutdown() {
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });

  // 如果10秒内无法关闭，强制退出
  setTimeout(() => {
    logger.warn('服务器无法在10秒内关闭，强制退出');
    process.exit(1);
  }, 10000);
}

export default app;