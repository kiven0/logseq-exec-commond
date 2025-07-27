import { CommandResult } from '../types';
import axios from 'axios';

/**
 * 命令执行服务接口
 */
export class CommandService {
  /**
   * 获取服务器URL
   * @returns 服务器URL
   */
  private static getServerUrl(): string {
    const settings = logseq.settings as any;
    return settings?.serverUrl || 'http://localhost:3666/api/exec-cmd';
  }
  
  /**
   * 获取服务器Token
   * @returns 服务器Token
   */
  private static getServerToken(): string {
    const settings = logseq.settings as any;
    return settings?.serverToken || 'logseq-exec-token';
  }
  
  /**
   * 创建HTTP客户端
   * @returns Axios实例
   */
  private static createHttpClient() {
    return axios.create({
      baseURL: this.getServerUrl(),
      headers: {
        'Content-Type': 'application/json',
        'X-Token': this.getServerToken()
      },
      timeout: 10000 // 10秒超时
    });
  }

  /**
   * 执行命令
   * @param command 要执行的命令
   * @returns 执行结果
   */
  static async executeCommand(command: string): Promise<CommandResult> {
    try {
      console.info('准备执行命令:', command);
      
      // 创建HTTP客户端
      const client = this.createHttpClient();
      
      // 发送请求
      const response = await client.post('/execute', { command });
      const responseData = response.data;
      
      // 处理成功响应
      if (responseData.code === 0 && responseData.data) {
        console.log('命令执行成功:', responseData.data.output);
        logseq.UI.showMsg('命令执行成功', 'success', { timeout: 3000 });
        
        return {
          success: true,
          output: responseData.data.output || '命令执行成功，但没有输出'
        };
      } 
      
      // 处理API错误
      console.error('命令执行失败:', responseData);
      logseq.UI.showMsg(`命令执行失败: ${responseData.message || '未知错误'}`, 'error', { timeout: 5000 });
      
      return {
        success: false,
        output: responseData.data?.error || responseData.message || '命令执行失败'
      };
    } catch (error) {
      // 处理网络或其他异常
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('命令执行异常:', error);
      logseq.UI.showMsg(`命令执行异常: ${errorMessage}`, 'error', { timeout: 5000 });
      
      return {
        success: false,
        output: `执行命令失败: ${errorMessage}`
      };
    }
  }
}

/**
 * 执行命令的便捷函数
 * @param command 要执行的命令
 * @returns 执行结果
 */
export async function executeCommand(command: string): Promise<CommandResult> {
  return CommandService.executeCommand(command);
}