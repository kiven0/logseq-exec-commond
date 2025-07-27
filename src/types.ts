/**
 * 用户自定义变量类型定义
 */
export interface UserDefinedVariable {
  /**
   * 变量键名
   */
  key: string;
  
  /**
   * 变量值
   */
  value: string;
  
  /**
   * 变量描述
   */
  description?: string;
}

/**
 * 插件设置类型定义
 */
export interface PluginSettings {
  /**
   * 命令模板，可以包含占位符
   * 例如: code ${_graph_path}
   */
  commandTemplate: string;
  /**
   * 图标名称，显示在笔记中的图标
   * 使用 Tabler Icons 的图标名称
   * 例如: command, code, terminal
   */
  iconName: string;
  
  /**
   * 服务器URL，命令执行服务器的地址
   * 例如: http://localhost:3666/api/exec-cmd
   */
  serverUrl: string;
  
  /**
   * 服务器Token，用于API认证
   * 例如: logseq-exec-token
   */
  serverToken: string;
  
  /**
   * 用户自定义变量列表
   */
  userVariables: UserDefinedVariable[];
}

/**
 * 命令块参数类型定义
 */
export interface CommandBlockParams {
  /**
   * 要执行的命令
   */
  command: string;
  
  /**
   * 显示的文本
   */
  displayText?: string;
  
  /**
   * 自定义参数，用于替换命令中的占位符
   */
  customParams?: Record<string, string>;
}

/**
 * 命令执行结果类型定义
 */
export interface CommandResult {
  /**
   * 命令是否执行成功
   */
  success: boolean;
  
  /**
   * 命令执行的输出内容
   */
  output: string;
}