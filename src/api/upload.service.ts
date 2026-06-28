import { http, unwrapResponse } from './http';
import type { ApiResponse, UploadImageResponse, UploadVideoResponse } from './types';

export const uploadService = {
  uploadVideo: async (file: File): Promise<ApiResponse<UploadVideoResponse>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.post<ApiResponse<UploadVideoResponse>>('/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return unwrapResponse(response);
  },

  uploadImage: async (file: File): Promise<ApiResponse<UploadImageResponse>> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await http.post<ApiResponse<UploadImageResponse>>('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return unwrapResponse(response);
  },
};
