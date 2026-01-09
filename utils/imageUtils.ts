import { ImageFormat } from '../types';

export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const convertImageFile = async (
  file: File,
  targetFormat: ImageFormat,
  quality: number = 1.0
): Promise<Blob> => {
  // Create an image bitmap from the file (more efficient than Image object)
  const bitmap = await createImageBitmap(file);
  
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Draw image to canvas
  // White background for formats that don't support transparency or handle it poorly
  if (
    targetFormat === ImageFormat.JPEG || 
    targetFormat === ImageFormat.BMP || 
    targetFormat === ImageFormat.GIF
  ) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  ctx.drawImage(bitmap, 0, 0);
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Conversion failed'));
      },
      targetFormat,
      quality
    );
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getExtensionFromMime = (mime: string): string => {
  switch (mime) {
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    case 'image/bmp': return 'bmp';
    case 'image/avif': return 'avif';
    case 'image/gif': return 'gif';
    default: return 'jpg';
  }
};