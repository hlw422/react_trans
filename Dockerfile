# 多阶段构建
# 阶段1：构建前端
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# 复制前端依赖文件
COPY client/package.json client/package-lock.json ./

# 安装前端依赖
RUN npm ci

# 复制前端源码
COPY client/ ./

# 构建前端
RUN npm run build

# 阶段2：运行后端服务
FROM node:18-alpine

WORKDIR /app

# 复制后端依赖文件
COPY server/package.json server/package-lock.json* ./

# 安装后端依赖（生产环境）
RUN npm ci --only=production

# 复制后端源码
COPY server/ ./

# 复制前端构建产物
COPY --from=frontend-builder /app/client/dist ./public

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3009

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3009

# 启动服务
CMD ["node", "server.js"]
