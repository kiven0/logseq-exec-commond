import { UserDefinedVariable } from '../types';
import { getSystemVariableValue } from './propertiesutils';

/**
 * 字符串模板处理工具
 * 支持多种格式的变量替换，包括 [变量名] 格式
 */

/**
 * 简单的字符串模板替换函数
 * 根据指定的前缀和后缀匹配变量并替换
 * 
 * @param template 模板字符串，如 "Hello [name], today is [date]"
 * @param data 数据对象，包含变量名和对应的值，如 { name: "World", date: "2023-01-01" }
 * @param options 选项，定义变量的前缀和后缀，默认为 { before: '{{', after: '}}' }
 * @returns 替换后的字符串，如 "Hello World, today is 2023-01-01"
 */
const stringPlaceholder = (template: string, data: Record<string, any>, options = { before: '{{', after: '}}' }): string => {
  const { before, after } = options;
  // 创建正则表达式匹配变量，如 {{变量名}} 或 [变量名]
  const pattern = new RegExp(`${before}([^${after.charAt(0)}]+)${after}`, 'g');
  
  // 替换所有匹配的变量
  return template.replace(pattern, (match, key) => {
    // 如果变量存在于数据对象中，则替换为对应的值，否则保留原样
    return data[key] !== undefined ? data[key] : match;
  });
};

/**
 * 替换字符串中的占位符
 * 支持多种格式的变量替换：
 * 1. [变量名] - 方括号格式（推荐）
 * 2. {变量名} - 花括号格式（兼容旧版本）
 * 
 * 变量类型：
 * 1. 系统变量：以下划线开头，如 [_root_path]、[_date]
 * 2. 用户变量：在插件设置中定义的自定义变量
 * 
 * @param template 包含占位符的字符串模板，如 "code [_root_path]/projects/[project_name]"
 * @param userVariables 用户定义的变量数组（兼容旧版本）
 * @returns 替换后的字符串，所有变量都被替换为实际值
 */
export async function replacePlaceholders(
  template: string,
  userVariables: UserDefinedVariable[] = []
): Promise<string> {
  try {
    // 创建变量映射对象，用于存储所有变量及其值
    const variableMap: Record<string, string> = {};
    
    // 添加用户自定义变量
    // 兼容旧版本的用户变量格式（通过参数传入）
    userVariables.forEach(v => {
      variableMap[v.key] = v.value;
    });
    
    // 处理系统变量
    
    // 1. 处理 [_变量名] 格式的系统变量（新格式）
    const squareBracketSystemVarMatches = template.match(/\[(_[^\]]+)\]/g) || [];
    for (const match of squareBracketSystemVarMatches) {
      const varName = match.substring(1, match.length - 1); // 去掉 [ 和 ]
      try {
        variableMap[varName] = await getSystemVariableValue(varName);
      } catch (error) {
        console.error(`获取系统变量 ${varName} 失败:`, error);
      }
    }
    
    // 处理模板转换
    let processedTemplate = template;
    
    // 1. 将 [var] 转换为 {{var}} 以便使用 stringPlaceholder 处理
    processedTemplate = processedTemplate.replace(/\[([^\]]+)\]/g, '{{$1}}');
    // 执行最终替换并返回结果
    return stringPlaceholder(processedTemplate, variableMap, {
      before: '{{',
      after: '}}'
    });
  } catch (error) {
    console.error('替换占位符时出错:', error);
    return template; // 出错时返回原始模板，确保不会因为替换失败而中断流程
  }
}

/**
 * 变量替换示例：
 * 
 * 1. 系统变量（以下划线开头）:
 *    - [_root_path] => 当前 Logseq 图谱的根目录路径
 *    - [_date] => 当前日期，格式为 YYYYMMDD
 * 
 * 2. 用户自定义变量（在设置中配置）:
 *    - [project_name] => 用户在设置中定义的 project_name 变量的值
 *    - [github_token] => 用户在设置中定义的 github_token 变量的值
 * 
 * 使用示例：
 *    "code [_root_path]/projects/[project_name]"
 *    => "code /Users/username/logseq/projects/my-project"
 */