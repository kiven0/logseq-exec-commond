#!/bin/bash

# 启动Logseq命令执行服务器的脚本

# 检查是否已经在运行
PID=$(ps -ef | grep "node.*dist/index.js" | grep -v grep | awk '{print $2}')

if [ ! -z "$PID" ]; then
  echo "Logseq命令执行服务器已经在运行中，进程ID: $PID"
  echo "如需重启，请先运行 ./stop.sh"
  exit 1
fi

# 确保目录存在
cd "$(dirname "$0")"

# 检查dist目录是否存在
if [ ! -d "./dist" ]; then
  echo "构建目录不存在，正在构建..."
  npm run build
  
  if [ $? -ne 0 ]; then
    echo "构建失败，请检查错误信息"
    exit 1
  fi
fi

# 启动服务
echo "正在启动Logseq命令执行服务器..."
node dist/index.js > ./logs/server.out.log 2> ./logs/server.err.log &

# 获取进程ID
PID=$!

# 检查服务是否成功启动
sleep 2
if ps -p $PID > /dev/null; then
  echo "Logseq命令执行服务器已成功启动，进程ID: $PID"
  echo "日志文件: ./logs/server.out.log 和 ./logs/server.err.log"
  
  # 显示Token
  if [ -f "./.token" ]; then
    echo "服务Token: $(cat ./.token)"
  fi
  
  exit 0
else
  echo "服务启动失败，请检查日志文件"
  exit 1
fi