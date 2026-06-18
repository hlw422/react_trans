#!/bin/bash

echo ""
echo "================================================"
echo "  局域网扫码文件互传工具 - 一键启动脚本"
echo "================================================"
echo ""

echo "[1/3] 正在安装后端依赖..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "后端依赖安装失败！"
    exit 1
fi
cd ..

echo ""
echo "[2/3] 正在安装前端依赖..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "前端依赖安装失败！"
    exit 1
fi
cd ..

echo ""
echo "[3/3] 正在启动服务..."
echo ""

# 启动后端服务（后台运行）
cd server
node server.js &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 2

# 启动前端开发服务器（后台运行）
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "================================================"
echo "  服务启动完成！"
echo "================================================"
echo ""
echo "  前端地址: http://localhost:5174"
echo "  后端地址: http://localhost:3001"
echo ""
echo "  手机请扫描页面上的二维码访问"
echo "  按 Ctrl+C 停止所有服务"
echo "================================================"

# 捕获退出信号，停止所有服务
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# 等待子进程
wait