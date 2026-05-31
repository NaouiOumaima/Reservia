// lib/api/upload.ts

import { apiClient } from './config';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export const uploadApi = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  uploadMultipleImages: async (files: File[]): Promise<UploadResponse[]> => {
    const uploadPromises = files.map(file => uploadApi.uploadImage(file));
    return Promise.all(uploadPromises);
  },
};