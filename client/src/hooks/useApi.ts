import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export interface NetworkInfo {
  ip: string;
  port: number;
  url: string;
}

export interface FileInfo {
  name: string;
  originalName: string;
  size: number;
  time: string;
}

export interface TextItem {
  id: string;
  text: string;
  time: string;
}

// 获取网络信息
export const getNetworkInfo = async (): Promise<NetworkInfo> => {
  const response = await api.get('/network-info');
  return response.data;
};

// 上传文件
export const uploadFiles = async (files: File[]): Promise<void> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 获取文件列表
export const getFiles = async (): Promise<FileInfo[]> => {
  const response = await api.get('/files');
  return response.data;
};

// 下载文件
export const downloadFile = (filename: string): void => {
  const link = document.createElement('a');
  link.href = `/api/download/${encodeURIComponent(filename)}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 删除文件
export const deleteFile = async (filename: string): Promise<void> => {
  await api.delete(`/files/${encodeURIComponent(filename)}`);
};

// 获取共享文本列表
export const getTexts = async (): Promise<TextItem[]> => {
  const response = await api.get('/texts');
  return response.data;
};

// 添加共享文本
export const addText = async (text: string): Promise<void> => {
  await api.post('/texts', { text });
};

// 清空文本记录
export const clearTexts = async (): Promise<void> => {
  await api.delete('/texts');
};