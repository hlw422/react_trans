import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, RefreshCw, FolderOpen } from 'lucide-react';
import { getFiles, downloadFile, deleteFile, FileInfo } from '@/hooks/useApi';
import { toast } from '@/components/ui/use-toast';

export function FileListSection() {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      const data = await getFiles();
      setFiles(data);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = (filename: string) => {
    downloadFile(filename);
    toast({
      title: '开始下载',
      description: '文件正在下载中...',
    });
  };

  const handleDelete = async (filename: string) => {
    setDeletingFile(filename);
    try {
      await deleteFile(filename);
      await fetchFiles();
      toast({
        title: '删除成功',
        description: '文件已成功删除',
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '请检查网络连接后重试',
        variant: 'destructive',
      });
    } finally {
      setDeletingFile(null);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchFiles();
    setIsLoading(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📽️',
      pptx: '📽️',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎬',
      avi: '🎬',
      mov: '🎬',
      zip: '📦',
      rar: '📦',
      '7z': '📦',
      mp3: '🎵',
      wav: '🎵',
    };
    return iconMap[ext || ''] || '📁';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            文件列表
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {files.length} 个文件
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {files.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {files.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-3 bg-muted rounded-lg border group"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <span className="text-xl">{getFileIcon(file.originalName)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.originalName}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatTime(file.time)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file.name)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.name)}
                    disabled={deletingFile === file.name}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium">暂无文件</p>
            <p className="text-sm">上传文件后将在此显示</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}