import { UserDefinedVariable } from '../types';
import { getBuiltinVariableValue } from './propertiesutils';

/**
 * 字符串模板处理工具
 */
/**
 * 简单的字符串模板替换函数
 * @param template 模板字符串
 * @param data 数据对象
 * @param options 选项
 * @returns 替换后的字符串
 */
const stringPlaceholder = (template: string, data: Record<string, any>, options = { before: '{{', after: '}}' }): string => {
  const { before, after } = options;
  const pattern = new RegExp(`${before}([^${after.charAt(0)}]+)${after}`, 'g');
  
  return template.replace(pattern, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
};

/**
 * 替换字符串中的占位符
 * @param template 包含占位符的字符串模板
 * @param userVariables 用户定义的变量
 * @returns 替换后的字符串
 */
export async function replacePlaceholders(
  template: string,
  userVariables: UserDefinedVariable[] = []
): Promise<string> {
  try {
    // 创建变量映射对象
    const variableMap: Record<string, string> = {};
    
    // 添加用户自定义变量
    userVariables.forEach(v => {
      variableMap[v.key] = v.value;
    });
    
    // 提取并处理所有内置变量（以_开头的变量）
    const builtinVarMatches = template.match(/\$\{(_[^}]+)\}/g) || [];
    for (const match of builtinVarMatches) {
      const varName = match.substring(2, match.length - 1);
      try {
        variableMap[varName] = await getBuiltinVariableValue(varName);
      } catch (error) {
        console.error(`获取内置变量 ${varName} 失败:`, error);
      }
    }
    
    // 将${var}转换为{{var}}以便使用stringPlaceholder处理
    const processedTemplate = template.replace(/\$\{([^}]+)\}/g, '{{$1}}');
    
    // 执行替换并返回结果
    return stringPlaceholder(processedTemplate, variableMap, {
      before: '{{',
      after: '}}'
    });
  } catch (error) {
    console.error('替换占位符时出错:', error);
    return template; // 出错时返回原始模板
  }
}