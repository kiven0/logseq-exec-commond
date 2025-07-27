#!/bin/bash

# 脚本功能：检查指定路径是否存在，不存在则创建，然后用VS Code打开
# 用法：./codex.sh <文件夹路径>

# 检查是否提供了参数
if [ $# -eq 0 ]; then
    echo "错误：请提供一个文件夹路径作为参数"
    echo "用法：$0 <文件夹路径>"
    exit 1
fi

# 获取文件夹路径参数
FOLDER_PATH="$1"

# 检查路径是否存在
if [ ! -d "$FOLDER_PATH" ]; then
    echo "文件夹 '$FOLDER_PATH' 不存在，正在创建..."
    
    # 创建文件夹（包括所有必要的父目录）
    mkdir -p "$FOLDER_PATH"
    
    # 检查创建是否成功
    if [ $? -ne 0 ]; then
        echo "错误：无法创建文件夹 '$FOLDER_PATH'"
        exit 1
    fi
    
    echo "文件夹创建成功！"
else
    echo "文件夹 '$FOLDER_PATH' 已存在"
fi

# 使用VS Code打开文件夹
echo "正在使用VS Code打开文件夹 '$FOLDER_PATH'..."
code "$FOLDER_PATH"

# 检查VS Code命令是否成功执行
if [ $? -ne 0 ]; then
    echo "错误：无法使用VS Code打开文件夹，请确保VS Code已安装且'code'命令可用"
    exit 1
fi

echo "操作完成！"
exit 0