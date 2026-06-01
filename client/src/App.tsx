import { useState } from 'react';
import { QRCodeSection } from './components/QRCodeSection';
import { TextShareSection } from './components/TextShareSection';
import { FileUploadSection } from './components/FileUploadSection';
import { FileListSection } from './components/FileListSection';
import { Toaster } from './components/ui/toaster';
import { Badge } from './components/ui/badge';
import { Wifi, Shield, Zap } from 'lucide-react';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 头部标题 */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            局域网文件互传
          </h1>
          <p className="text-muted-foreground mb-4">
            扫码连接，轻松实现手机电脑双向文件传输
          </p>
          <div className="flex justify-center gap-2 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              局域网传输
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              数据不上云
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              零配置使用
            </Badge>
          </div>
        </header>

        {/* 主要内容区域 */}
        <div className="space-y-6">
          {/* 扫码连接模块 */}
          <QRCodeSection />

          {/* 文本共享模块 */}
          <TextShareSection />

          {/* 文件上传模块 */}
          <FileUploadSection onUploadSuccess={handleUploadSuccess} />

          {/* 文件列表模块 */}
          <div key={refreshKey}>
            <FileListSection />
          </div>
        </div>

        {/* 底部信息 */}
        <footer className="text-center mt-12 pb-8 text-sm text-muted-foreground">
          <p>全程本地局域网传输，保护您的隐私安全</p>
          <p className="mt-1">适用于 Chrome、Edge、Safari、手机自带浏览器</p>
        </footer>
      </div>

      <Toaster />
    </div>
  );
}

export default App;