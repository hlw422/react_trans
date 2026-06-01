import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, CheckCircle } from 'lucide-react';
import { getNetworkInfo, NetworkInfo } from '@/hooks/useApi';

export function QRCodeSection() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        const info = await getNetworkInfo();
        setNetworkInfo(info);
        setIsConnected(true);
      } catch (error) {
        console.error('获取网络信息失败:', error);
        setIsConnected(false);
      }
    };

    fetchNetworkInfo();
    const interval = setInterval(fetchNetworkInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Wifi className="h-5 w-5 text-primary" />
            扫码连接
          </CardTitle>
          <Badge variant={isConnected ? 'default' : 'secondary'} className="flex items-center gap-1">
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3" />
                已连接
              </>
            ) : (
              '连接中...'
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {networkInfo ? (
            <>
              <div className="p-4 bg-white rounded-xl shadow-sm border">
                <QRCodeSVG
                  value={networkInfo.url}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground">
                  使用手机浏览器扫描二维码
                </p>
                <p className="text-xs font-mono bg-muted px-3 py-1.5 rounded-md">
                  {networkInfo.url}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center space-y-2 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">正在获取网络信息...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}