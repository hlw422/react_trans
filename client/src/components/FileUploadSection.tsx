import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileUp, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadFiles } from '@/hooks/useApi';
import { toast } from '@/components/ui/use-toast';

interface FileUploadSectionProps {
  onUploadSuccess: () => void;
}

export function FileUploadSection({ onUploadSuccess }: FileUploadSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleUpload(files);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await handleUpload(files);
    }
    // 清空 input 以允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(files.map((f) => f.name));

    try {
      await uploadFiles(files);
      toast({
        title: '上传成功',
        description: `已成功上传 ${files.length} 个文件`,
      });
      onUploadSuccess();
    } catch (error) {
      console.error('上传失败:', error);
      toast({
        title: '上传失败',
        description: '请检查网络连接后重试',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress([]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <FileUp className="h-5 w-5 text-primary" />
            文件上传
          </CardTitle>
          <Badge variant="secondary">
            支持任意格式
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <div>
                <p className="font-medium text-primary">正在上传...</p>
                <div className="mt-2 space-y-1">
                  {uploadProgress.map((filename, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      {filename}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {isDragging ? '释放鼠标上传文件' : '拖拽文件到此处上传'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  或点击选择文件
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <Badge variant="outline">图片</Badge>
                <Badge variant="outline">文档</Badge>
                <Badge variant="outline">视频</Badge>
                <Badge variant="outline">压缩包</Badge>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            选择文件
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}