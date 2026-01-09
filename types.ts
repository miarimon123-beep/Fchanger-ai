export enum ImageFormat {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  WEBP = 'image/webp',
  BMP = 'image/bmp',
  AVIF = 'image/avif',
  GIF = 'image/gif'
}

export interface ConversionOptions {
  format: ImageFormat;
  quality: number; // 0 to 1
}

export interface AIAnalysisResult {
  suggestedFilename: string;
  altText: string;
  description: string;
}