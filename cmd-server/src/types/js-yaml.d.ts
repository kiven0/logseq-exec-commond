/**
 * js-yaml模块的类型声明文件
 */
declare module 'js-yaml' {
  /**
   * 将YAML字符串解析为JavaScript对象
   */
  export function load(input: string, options?: any): any;

  /**
   * 将JavaScript对象转换为YAML字符串
   */
  export function dump(obj: any, options?: any): string;

  /**
   * 将多个YAML文档解析为JavaScript对象数组
   */
  export function loadAll(input: string, iterator?: (doc: any) => void, options?: any): any[];

  /**
   * 将多个JavaScript对象转换为YAML字符串
   */
  export function dumpAll(docs: any[], options?: any): string;

  /**
   * 安全地将YAML字符串解析为JavaScript对象
   */
  export function safeLoad(input: string, options?: any): any;

  /**
   * 安全地将JavaScript对象转换为YAML字符串
   */
  export function safeDump(obj: any, options?: any): string;

  /**
   * 安全地将多个YAML文档解析为JavaScript对象数组
   */
  export function safeLoadAll(input: string, iterator?: (doc: any) => void, options?: any): any[];

  /**
   * 安全地将多个JavaScript对象转换为YAML字符串
   */
  export function safeDumpAll(docs: any[], options?: any): string;
}