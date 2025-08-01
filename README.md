# Logseq 命令执行插件

这是一个 Logseq 插件，允许你在笔记中嵌入可执行的命令按钮，点击后可以执行预定义的系统命令。
因为 Logseq 对命令行的限制，这里的解决方案是通过一个独立的Node.js进程来执行命令，Logseq 需要执行的命令通过http 请求方式给到Node服务，Node服务执行命令并返回结果。

![demo](./demo.gif)

## 安装方法

### 1. 安装插件

```bash
# 克隆仓库
git clone https://github.com/kiven0/logseq-exec-commond.git

# 进入目录
cd logseq-exec-commond

# 安装依赖并构建插件 并启动服务
./install.sh
```

### 2. 在 Logseq 中加载插件

1. 打开 Logseq
2. 点击右上角三个点 -> 设置 -> 开发者模式（打开）
3. 点击右上角三个点 -> 插件 -> 加载未打包的插件
4. 选择插件目录

### 3. 启动命令执行服务器(可选)

```bash
# 进入服务器目录
cd cmd-server

# 启动服务器
./start.sh

# 停止服务器
./stop.sh
```

## 使用方法

### 基本用法

1. 在编辑模式下，输入斜线命令 `/ExecCommand`
2. 插件会在光标位置插入一个命令按钮
3. 点击按钮执行预定义的命令

### 使用变量

插件支持以下变量格式：

1. **推荐格式**：使用方括号 `[变量名]`

#### 系统变量

- `[_root_path]` - Logseq 图谱根目录路径
- `[_date]` - 当前日期（YYYYMMDD格式）

#### 用户自定义变量

在插件设置中定义的变量，可以使用 `[变量名]` 格式引用。您可以自由定义变量名，如：`project_name`、`github_token`、`repo_url` 等，然后在命令中引用它们。

例如，如果您在设置中定义了一个名为 `project_name` 的变量，值为 `my-awesome-project`，那么您可以在命令中使用 `[project_name]` 来引用它。

#### 示例

```
{{renderer :exec-command, code [_root_path]/projects, Open}}
```

### 自定义命令

你可以在插件设置中自定义命令模板和添加自定义变量。

## 配置选项

在 Logseq 插件设置中，你可以配置以下选项：

- **命令模板**：默认执行的命令
- **服务器URL**：命令执行服务器的地址
- **服务器Token**：用于API认证的令牌
- **用户自定义变量**：添加自己的变量，可在命令中使用
  - 变量名可以自由定义（如：`project_name`、`github_token`、`repo_url` 等）
  - 在命令中使用 `[变量名]` 格式引用这些变量

## 命令执行服务器

为了安全地执行系统命令，插件使用独立的命令执行服务器。服务器提供以下功能：

- 命令白名单过滤
- Token 认证

### 服务器管理

```bash
# 启动服务器
cd cmd-server
./start.sh

# 停止服务器
./stop.sh
```

## 安全注意事项

- 命令执行服务器应该只在本地运行
- 建议配置命令白名单，限制可执行的命令
- 不要在公共网络上暴露命令执行服务器
- 定期更新服务器 Token

## 许可证

MIT