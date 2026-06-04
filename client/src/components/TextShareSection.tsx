import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Copy, Trash2, Send } from 'lucide-react';
import { getTexts, addText, clearTexts, TextItem } from '@/hooks/useApi';
import { toast } from '@/components/ui/use-toast';

export function TextShareSection() {
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTexts = async () => {
    try {
      const data = await getTexts();
      setTexts(data);
    } catch (error) {
      console.error('获取文本列表失败:', error);
    }
  };

  useEffect(() => {
    fetchTexts();
    const interval = setInterval(fetchTexts, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    try {
      await addText(inputText);
      setInputText('');
      await fetchTexts();
      toast({
        title: '文本已共享',
        description: '文本已成功共享到所有设备',
      });
    } catch (error) {
      console.error('添加文本失败:', error);
      toast({
        title: '共享失败',
        description: '请检查网络连接后重试',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      // 优先使用 Clipboard API（需要 HTTPS 或 localhost）
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // 降级方案：使用临时 textarea + execCommand（兼容手机端 HTTP 访问）
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!success) throw new Error('execCommand copy failed');
      }
      toast({
        title: '已复制',
        description: '文本已复制到剪贴板',
      });
    } catch (error) {
      console.error('复制失败:', error);
      toast({
        title: '复制失败',
        description: '请手动选择文本复制',
        variant: 'destructive',
      });
    }
  };

  const handleClear = async () => {
    try {
      await clearTexts();
      await fetchTexts();
      toast({
        title: '已清空',
        description: '所有文本记录已清空',
      });
    } catch (error) {
      console.error('清空文本失败:', error);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            文本共享
          </CardTitle>
          <Badge variant="secondary">
            {texts.length} 条记录
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="输入要共享的文本、链接、代码等内容..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[100px] resize-none"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!inputText.trim() || isLoading}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? '提交中...' : '共享文本'}
            </Button>
            {texts.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                清空
              </Button>
            )}
          </div>
        </div>

        {texts.length > 0 && (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {texts.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-muted rounded-lg border group"
              >
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm whitespace-pre-wrap break-words flex-1">
                    {item.text}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(item.text)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatTime(item.time)}
                </p>
              </div>
            ))}
          </div>
        )}

        {texts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">暂无共享文本</p>
            <p className="text-xs">在上方输入框添加内容</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}