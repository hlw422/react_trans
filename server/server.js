const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const os = require('os');

const app = express();
const PORT = 3001;

// 中间件配置
app.use(cors());
app.use(express.json());

// 文件上传目录
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// 确保上传目录存在
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer 配置 - 文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // 保留原始文件名，添加时间戳避免重名
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB 限制
  }
});

// 内存中存储共享文本
let sharedTexts = [];

// ============ API 路由 ============

/**
 * 获取本机局域网 IP 地址
 */
app.get('/api/network-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  let localIP = '127.0.0.1';

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 过滤 IPv4、非内部地址
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== '127.0.0.1') break;
  }

  res.json({
    ip: localIP,
    port: PORT,
    url: `http://${localIP}:${PORT}`
  });
});

/**
 * 文件上传 - 支持多文件
 */
app.post('/api/upload', upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: '请选择要上传的文件' });
  }

  const uploadedFiles = req.files.map(file => ({
    name: file.filename,
    originalName: file.originalname,
    size: file.size
  }));

  res.json({
    message: '文件上传成功',
    files: uploadedFiles
  });
});

/**
 * 获取文件列表
 */
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOADS_DIR).map(filename => {
      const filePath = path.join(UPLOADS_DIR, filename);
      const stats = fs.statSync(filePath);
      return {
        name: filename,
        originalName: filename.replace(/^\d+-/, ''), // 移除时间戳前缀
        size: stats.size,
        time: stats.mtime
      };
    });

    // 按修改时间倒序排列
    files.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json(files);
  } catch (error) {
    console.error('获取文件列表失败:', error);
    res.status(500).json({ error: '获取文件列表失败' });
  }
});

/**
 * 文件下载
 */
app.get('/api/download', (req, res) => {
  const filename = req.query.filename;
  if (!filename) {
    return res.status(400).json({ error: '请提供文件名' });
  }

  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }

  // 获取原始文件名（移除时间戳）
  const originalName = filename.replace(/^\d+-/, '');
  
  console.log(`下载文件: ${filename} -> ${originalName}`);
  
  // 设置正确的Content-Disposition头，处理中文文件名
  const encodedFileName = encodeURIComponent(originalName);
  res.setHeader('Content-Disposition', `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
  res.setHeader('Content-Type', 'application/octet-stream');
  
  // 使用更可靠的流式下载
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
});

/**
 * 删除文件
 */
app.delete('/api/files', (req, res) => {
  const filename = req.query.filename;
  if (!filename) {
    return res.status(400).json({ error: '请提供文件名' });
  }

  const filePath = path.join(UPLOADS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '文件不存在' });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ message: '文件删除成功' });
  } catch (error) {
    console.error('删除文件失败:', error);
    res.status(500).json({ error: '删除文件失败' });
  }
});

/**
 * 获取共享文本列表
 */
app.get('/api/texts', (req, res) => {
  res.json(sharedTexts);
});

/**
 * 添加共享文本
 */
app.post('/api/texts', (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: '请输入要共享的文本' });
  }

  const newText = {
    id: Date.now().toString(),
    text: text.trim(),
    time: new Date().toISOString()
  };

  sharedTexts.unshift(newText); // 添加到开头

  // 限制最多保留 50 条记录
  if (sharedTexts.length > 50) {
    sharedTexts = sharedTexts.slice(0, 50);
  }

  res.json({
    message: '文本添加成功',
    texts: sharedTexts
  });
});

/**
 * 清空文本记录
 */
app.delete('/api/texts', (req, res) => {
  sharedTexts = [];
  res.json({ message: '文本记录已清空' });
});

// 静态文件服务 - 生产环境
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
  // 完全禁用缓存
  app.use(express.static(clientBuildPath, {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  });
}

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  const interfaces = os.networkInterfaces();
  let localIP = '127.0.0.1';

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
    if (localIP !== '127.0.0.1') break;
  }

  console.log('\n' + '='.repeat(50));
  console.log('  局域网扫码文件互传工具 - 服务已启动');
  console.log('='.repeat(50));
  console.log(`\n  本地访问: http://localhost:${PORT}`);
  console.log(`  局域网访问: http://${localIP}:${PORT}`);
  console.log(`\n  手机扫码请访问上方局域网地址`);
  console.log('='.repeat(50) + '\n');
});