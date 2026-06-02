import { useMutation } from '@tanstack/react-query';
import { uploadService } from '../../api/upload.service';

export const useUploadVideo = () =>
  useMutation({
    mutationFn: (file: File) => uploadService.uploadVideo(file),
  });
