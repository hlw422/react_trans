# 局域网扫码文件互传工具

一款基于纯网页的双向文件传输工具，实现电脑与手机在同一局域网环境下通过扫码快速互传文件和文本内容。

## ✨ 功能特点

- 📱 **扫码连接**：手机扫码一键连接电脑，无需手动输入IP
- 🔄 **双向传输**：支持电脑 ↔ 手机双向文件互传
- 📝 **文本共享**：支持电脑/手机双向文本互传，实时同步
- 🔒 **隐私安全**：全程本地局域网传输，数据不上云
- 🚀 **零配置**：无需安装APP，手机浏览器直接使用
- 🎨 **现代UI**：基于 shadcn/ui 设计，极简美观

## 📦 技术栈

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **后端**：Node.js + Express + Multer
- **通信**：axios + qrcode.react

## 🚀 快速开始

### 前置要求

- Node.js 16+ 
- npm 或 yarn

### 一键启动（推荐）

#### Windows

```bash
# 双击运行 start.bat 文件
# 或在命令行执行
start.bat
```

#### macOS/Linux

```bash
# 添加执行权限
chmod +x start.sh

# 运行启动脚本
./start.sh
```

### 手动启动

#### 1. 安装后端依赖

```bash
cd server
npm install
```

#### 2. 安装前端依赖

```bash
cd client
npm install
```

#### 3. 启动后端服务

```bash
cd server
node server.js
```

后端服务将在 http://localhost:3001 启动

#### 4. 启动前端服务（新终端）

```bash
cd client
npm run dev
```

前端服务将在 http://localhost:5173 启动

## 📖 使用教程

### 1. 电脑端操作

1. 运行启动脚本或手动启动服务
2. 打开浏览器访问 http://localhost:5173
3. 页面将显示二维码和局域网地址

### 2. 手机端操作

1. 确保手机和电脑连接同一WiFi网络
2. 使用手机浏览器扫描页面上的二维码
3. 自动跳转到文件传输页面

### 3. 文件传输

- **上传文件**：
  - 拖拽文件到上传区域
  - 点击"选择文件"按钮
  - 支持多文件同时上传

- **下载文件**：
  - 在文件列表中点击下载按钮
  - 文件将自动下载到设备

- **删除文件**：
  - 鼠标悬停在文件上
  - 点击删除按钮

### 4. 文本共享

- **添加文本**：
  - 在文本框输入内容
  - 点击"共享文本"按钮

- **复制文本**：
  - 鼠标悬停在文本记录上
  - 点击复制按钮

- **清空记录**：
  - 点击"清空"按钮

## 🔧 常见问题

### Q: 手机无法访问？

**A:** 请检查：
1. 手机和电脑是否连接同一WiFi
2. 防火墙是否阻止了3001端口
3. 尝试手动输入页面显示的局域网地址

### Q: 文件上传失败？

**A:** 请检查：
1. 文件大小是否超过100MB限制
2. 网络连接是否稳定
3. 服务器是否有写入权限

### Q: 如何修改端口？

**A:** 编辑 `server/server.js` 文件，修改 `PORT` 变量：

```javascript
const PORT = 3001; // 修改为其他端口
```

同时需要修改 `client/vite.config.ts` 中的代理配置：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:新端口',
    changeOrigin: true,
  },
},
```

### Q: 如何部署到生产环境？

**A:** 执行以下步骤：

```bash
# 1. 构建前端
cd client
npm run build

# 2. 启动生产环境
cd ../server
NODE_ENV=production node server.js
```

生产环境下，前端静态文件将由 Express 托管。

## 📁 项目结构

```
react_trans/
├── client/                         # React 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── QRCodeSection.tsx       # 二维码扫码连接模块
│   │   │   ├── TextShareSection.tsx    # 文本共享模块
│   │   │   ├── FileUploadSection.tsx   # 文件上传模块
│   │   │   ├── FileListSection.tsx     # 文件列表模块
│   │   │   └── ui/                     # shadcn/ui 组件
│   │   ├── hooks/
│   │   │   └── useApi.ts              # API 请求 Hook
│   │   ├── lib/
│   │   │   └── utils.ts               # 工具函数
│   │   ├── App.tsx                    # 主应用组件
│   │   ├── main.tsx                   # 入口文件
│   │   └── index.css                  # 全局样式
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                         # Node.js 后端
│   ├── server.js                     # Express 主服务
│   ├── package.json
│   └── uploads/                      # 文件存储目录
├── start.bat                         # Windows 启动脚本
├── start.sh                          # macOS/Linux 启动脚本
└── README.md                         # 本文档
```

## 🔌 API 接口

| 方法 | 端点 | 功能 |
|------|------|------|
| GET | /api/network-info | 获取局域网IP信息 |
| POST | /api/upload | 上传文件（支持多文件） |
| GET | /api/files | 获取文件列表 |
| GET | /api/download/:filename | 下载文件 |
| DELETE | /api/files/:filename | 删除文件 |
| GET | /api/texts | 获取共享文本列表 |
| POST | /api/texts | 添加共享文本 |
| DELETE | /api/texts | 清空文本记录 |

## 🎨 UI 设计

完全遵循 shadcn/ui 设计体系：
- 极简高级、轻量化、磨砂质感
- 卡片模块化布局
- 响应式设计，适配电脑和手机
- 低饱和度科技蓝主色调

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请提交 Issue。