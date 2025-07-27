#!/bin/bash

# 停止Logseq命令执行服务器的脚本

# 查找服务进程
PID=$(ps -ef | grep "node.*dist/index.js" | grep -v grep | awk '{print $2}')

if [ -z "$PID" ]; then
  echo "未找到运行中的Logseq命令执行服务器进程"
  exit 0
fi

echo "找到Logseq命令执行服务器进程: $PID，正在停止..."

# 发送SIGTERM信号
kill -15 $PID

# 等待进程退出
for i in {1..10}; do
  if ! ps -p $PID > /dev/null; then
    echo "服务已成功停止"
    exit 0
  fi
  echo "等待服务停止... ($i/10)"
  sleep 1
done

# 如果进程仍在运行，强制终止
if ps -p $PID > /dev/null; then
  echo "服务未能在10秒内停止，强制终止"
  kill -9 $PID
  echo "服务已强制终止"
fi