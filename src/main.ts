import '@logseq/libs';
import { executeCommand } from './utils/cmdutils';
import { replacePlaceholders } from './utils/strutils';
import { 
  generateSystemPropertySettings, 
  getSystemPropertiesDescriptionText,
  generateUserPropertySettings, 
  getUserVariables
} from './utils/propertiesutils';

// 提供模型，用于处理点击事件
logseq.provideModel({
  async executeCmd(e: any) {
    try {
      // 获取命令并替换占位符
      const command = e.dataset.command;
      if (!command) {
        logseq.UI.showMsg('命令为空', 'warning', { timeout: 2000 });
        return;
      }
      
      // 获取用户变量并替换占位符
      const userVariables = getUserVariables();
      const processedCommand = await replacePlaceholders(command, userVariables);
      
      // 执行命令
      await executeCommand(processedCommand);
    } catch (error) {
      console.error('命令执行错误:', error);
      logseq.UI.showMsg(`执行错误: ${error}`, 'error', { timeout: 5000 });
    }
  }
});


// 获取系统属性描述文本
const systemPropertiesInfo = getSystemPropertiesDescriptionText();

// 生成系统属性设置项
const systemPropertySettings = generateSystemPropertySettings(systemPropertiesInfo);

// 生成用户属性设置项
const userPropertySettings = generateUserPropertySettings();

// 合并所有设置项
const settingsSchema = [...userPropertySettings, ...systemPropertySettings];

/**
 * 注册斜线命令
 */
function registerSlashCommand() {
  try {
    logseq.Editor.registerSlashCommand('ExecCommand', async () => {
      const command = logseq.settings?.commandTemplate || 'echo "Hello from Logseq"';
      // 插入渲染器宏
      await logseq.Editor.insertAtEditingCursor(
        `{{renderer :exec-command, ${command}, Open}}`
      );
    });
    console.log('斜线命令/ExecCommand 注册成功');
  } catch (error) {
    console.error('注册斜线命令 /ExecCommand 失败:', error);
  }
}

/**
 * 注册宏渲染器
 * 简化版本：移除复杂逻辑，专注于基本功能
 */
function registerMacroRenderer() {  
  logseq.App.onMacroRendererSlotted(({ slot, payload }) => {
    const [type, command, displayText] = payload.arguments;
    if (type !== ':exec-command') return;
    const identity = slot.split('__')[1]?.trim()
    if (!identity) return
    const key = 'exec-command-start_' + identity
    
    // 检测是否为暗黑模式
    const isDarkMode = document.documentElement.classList.contains('dark');
    const btnStyle = isDarkMode 
      ? "display:inline-flex; align-items:center; padding:6px 12px; background:#2a2a35; border-radius:6px; border:1px solid rgba(255,255,255,0.05); color:#e8e8e8; font-size:14px; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.15); transition:all 0.2s ease; height:32px; max-width:300px;"
      : "display:inline-flex; align-items:center; padding:6px 12px; background:#f0f0f5; border-radius:6px; border:1px solid rgba(0,0,0,0.05); color:#333; font-size:14px; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.05); transition:all 0.2s ease; height:32px; max-width:300px;";
    
    // 提供UI
    return logseq.provideUI({
      key,
      slot,
      reset: true,
      template: `<button 
          style="${btnStyle}"
          class="exec-command-btn"
          data-command="${command}" 
          data-on-click="executeCmd"
          onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 3px 6px rgba(0,0,0,${isDarkMode ? '0.2' : '0.1'})'"
          onmouseout="this.style.transform=''; this.style.boxShadow=''"
          onmousedown="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 2px rgba(0,0,0,${isDarkMode ? '0.15' : '0.1'})'"
          onmouseup="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 3px 6px rgba(0,0,0,${isDarkMode ? '0.2' : '0.1'})'">
           <span style="margin-right:8px; font-size:16px; display:inline-block;">🚀</span>
           <span style="font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">${displayText || command}</span>
      </button>`,
    });
  });
}


// 注册命令块渲染器
function registerCommandBlockRenderer() {
  registerSlashCommand();
  registerMacroRenderer();
}

// 主函数 - 简化初始化过程
const main = async () => {
  try {
    console.info('插件初始化开始');
    logseq.useSettingsSchema(settingsSchema);
    
    // 延迟注册命令块渲染器，减少启动时的性能影响
    setTimeout(() => {
      try {
        registerCommandBlockRenderer();
        console.info('命令块渲染器注册成功');
      } catch (error) {
        console.error('注册命令块渲染器失败:', error);
      }
    }, 1000);
    
    console.info('插件初始化完成');
  } catch (error) {
    console.error('插件初始化失败:', error);
  }
};

// 启动插件
logseq.ready(main).catch(error => {
  console.error('插件启动失败:', error);
});