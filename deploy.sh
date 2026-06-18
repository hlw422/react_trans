#!/bin/bash

echo ""
echo "================================================"
echo "  局域网扫码文件互传工具 - Docker 一键部署"
echo "================================================"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: 未安装 Docker"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "错误: 未安装 Docker Compose"
    echo "请先安装 Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "[1/3] 停止旧容器..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null

echo ""
echo "[2/3] 构建并启动服务..."
docker compose up -d --build 2>/dev/null || docker-compose up -d --build

echo ""
echo "[3/3] 等待服务启动..."
sleep 5

# 检查容器状态
if docker ps | grep -q "lan-file-transfer"; then
    # 获取本机局域网 IP
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
    
    echo ""
    echo "================================================"
    echo "  部署完成！"
    echo "================================================"
    echo ""
    echo "  本地访问: http://localhost:3009"
    echo "  局域网访问: http://${LOCAL_IP}:3009"
    echo ""
    echo "  手机扫描页面二维码即可连接"
    echo "================================================"
    echo ""
    echo "常用命令:"
    echo "  查看日志: docker logs -f lan-file-transfer"
    echo "  停止服务: docker compose down"
    echo "  重启服务: docker compose restart"
    echo ""
else
    echo ""
    echo "错误: 容器启动失败"
    echo "请查看日志: docker logs lan-file-transfer"
    exit 1
fi
