/**
 * 属性配置管理工具
 * 合并了系统属性、用户属性和变量管理的功能
 */
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin';
import { UserDefinedVariable } from '../types';

/**
 * 内置变量类型定义
 */
export interface BuiltinVariable {
  /**
   * 变量名称
   */
  name: string;
  
  /**
   * 变量描述
   */
  description: string;
  
  /**
   * 获取变量值的函数
   */
  getValue: () => Promise<string> | string;
}

/**
 * 系统属性类型定义
 */
export interface SystemProperty {
  /**
   * 属性键名
   */
  key: string;
  
  /**
   * 属性值
   */
  value: string;
  
  /**
   * 属性描述
   */
  description?: string;
}

// 缓存图谱路径，避免频繁请求API
let cachedGraphPath: string | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 60000; // 缓存有效期1分钟

/**
 * 获取当前笔记仓库根目录
 * @returns 仓库根目录路径
 */
async function getBasePath(): Promise<string> {
  const now = Date.now();
  
  // 如果缓存有效，直接返回缓存的值
  if (cachedGraphPath !== null && now - lastCacheTime < CACHE_TTL) {
    return cachedGraphPath;
  }
  
  try {
    const graph = await logseq.App.getCurrentGraph();
    cachedGraphPath = graph?.path || '';
    lastCacheTime = now;
    return cachedGraphPath;
  } catch (error) {
    console.error('Failed to get current graph path:', error);
    return cachedGraphPath || '';
  }
}

/**
 * 获取当前日期，格式为 YYYYMMDD
 * @param format 日期格式
 * @returns 格式化的日期字符串
 */
function getFormattedDate(format: string = 'YYYYMMDD'): string {
  const today = new Date();
  let formattedDate = format;
  
  // 简单的日期格式替换
  formattedDate = formattedDate.replace('YYYY', today.getFullYear().toString());
  formattedDate = formattedDate.replace('MM', (today.getMonth() + 1).toString().padStart(2, '0'));
  formattedDate = formattedDate.replace('DD', today.getDate().toString().padStart(2, '0'));
  
  return formattedDate;
}

/**
 * 内置变量列表
 */
export const builtinVariables: BuiltinVariable[] = [
  {
    name: '_date',
    description: '当前日期，格式由设置中的 dateFormat 决定',
    getValue: () => {
      const settings = logseq.settings as any;
      return getFormattedDate(settings?.dateFormat);
    }
  },
  {
    name: '_graph_path',
    description: 'Logseq 图谱根目录路径',
    getValue: getBasePath
  }
];

/**
 * 获取所有内置变量的描述信息
 * @returns 变量描述信息数组
 */
export function getBuiltinVariablesDescription(): { name: string; description: string }[] {
  return builtinVariables.map(variable => ({
    name: variable.name,
    description: variable.description
  }));
}

/**
 * 获取内置变量的值
 * @param name 变量名称
 * @returns 变量值，如果变量不存在则返回空字符串
 */
export async function getBuiltinVariableValue(name: string): Promise<string> {
  const variable = builtinVariables.find(v => v.name === name);
  if (!variable) return '';
  
  try {
    return await variable.getValue();
  } catch (error) {
    console.error(`Failed to get value for variable ${name}:`, error);
    return '';
  }
}

/**
 * 获取系统属性描述信息
 * @returns 系统属性描述信息数组
 */
export function getSystemPropertiesDescription(): SystemProperty[] {
  return builtinVariables.map(variable => ({
    key: variable.name,
    value: '',  // 值会在运行时动态获取
    description: variable.description
  }));
}

/**
 * 获取系统属性描述文本
 * @returns 格式化的系统属性描述文本
 */
export function getSystemPropertiesDescriptionText(): string {
  return builtinVariables
    .map(v => `${v.name}: ${v.description}`)
    .join('\n');
}

/**
 * 生成系统属性设置项
 * @param builtinVariablesInfo 内置变量描述信息
 * @returns 系统属性设置项
 */
export function generateSystemPropertySettings(builtinVariablesInfo: string): any[] {
  return [
    {
      key: 'builtinVariables',
      type: 'heading',
      title: '内置变量',
      description: '以下是可用的内置变量，使用时需要加上 ${} 包裹\n\n' + builtinVariablesInfo,
      default: null,
    }
  ];
}

/**
 * 获取用户自定义变量
 * @returns 用户自定义变量数组
 */
export function getUserVariables(): UserDefinedVariable[] {
  const settings = logseq.settings as any;
  return settings?.userVariables || [];
}

/**
 * 生成用户属性设置项
 * @returns 用户属性设置项数组
 */
export function generateUserPropertySettings(): SettingSchemaDesc[] {
  return [
    {
      key: 'commandTemplate',
      type: 'string',
      default: 'code ${_graph_path}',
      title: '命令模板',
      description: '可以使用占位符，如 ${_graph_path}, ${_date}, 以及自定义变量 ${变量名}',
    },
    {
      key: 'serverUrl',
      type: 'string',
      default: 'http://localhost:3666/api/exec-cmd',
      title: '服务器URL',
      description: '命令执行服务器的URL地址',
    },
    {
      key: 'serverToken',
      type: 'string',
      default: 'logseq-exec-token',
      title: '服务器Token',
      description: '命令执行服务器的认证Token',
    },
    {
      key: 'userVariables',
      type: 'object',
      default: [],
      title: '用户自定义变量',
      description: '添加自定义变量，可在命令模板中使用 ${变量名} 引用。注意：变量名不能以下划线(_)开头。请在设置中添加变量，格式为：[{"key":"变量名","value":"变量值","description":"描述"}]',
    },
  ];
}