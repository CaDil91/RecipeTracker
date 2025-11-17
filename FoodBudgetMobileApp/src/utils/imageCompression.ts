import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

/**
 * Maximum dimensions for compressed images * larger than this will be resized while maintaining the aspect ratio
 */
const MAX_DIMENSION = 1920;

/**
 * JPEG compression quality (0.0-1.0)
 * 0.8 provides a good balance between quality and file size
 */
const COMPRESSION_QUALITY = 0.8;

/**
 * Metadata about an image from expo-image-picker
 */
export interface ImageMetadata {
  width: number;
  height: number;
  fileSize?: number; // Optional: original file size for fallback
}

/**
 * Result from image compression
 */
export interface CompressedImageResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number; // File size in bytes
}

/**
 * Compresses an image by resizing if needed and applying JPEG quality compression
 *
 * Business Rules:
 * - Max dimensions: 1920x1920 pixels
 * - JPEG format with 0.8 quality
 * - Maintains aspect ratio when resizing
 * - Resizes by constraining the larger dimension
 * - Returns file size (using FileSystem.getInfoAsync with fallback)
 *
 * @param uri - Local file URI of the image to compress
 * @param metadata - Original image dimensions (and optional original file size)
 * @returns Compressed image with new URI, dimensions, and file size
 * @throws Error if image manipulation fails
 */
export async function compressImage(
  uri: string,
  metadata: ImageMetadata
): Promise<CompressedImageResult> {
  const context = ImageManipulator.manipulate(uri);

  // Determine if resize is needed
  const needsResize = metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION;

  if (needsResize) {
    // Choose which dimension to constrain based on aspect ratio
    // This maintains aspect ratio automatically
    if (metadata.width >= metadata.height) {
      // Landscape or square: constrain width
      context.resize({ width: MAX_DIMENSION });
    } else {
      // Portrait: constrain height
      context.resize({ height: MAX_DIMENSION });
    }
  }

  // Render all transformations
  const image = await context.renderAsync();

  // Save with JPEG quality compression
  const result = await image.saveAsync({
    compress: COMPRESSION_QUALITY,
    format: SaveFormat.JPEG,
  });

  // Get file size using FileSystem.getInfoAsync
  // Note: Known issues on iOS/Android - may report incorrect size after manipulation
  // Fallback to original size estimate if getInfoAsync fails or returns 0
  let fileSize: number;

  try {
    const fileInfo = await FileSystem.getInfoAsync(result.uri);
    fileSize = fileInfo.exists && fileInfo.size > 0
      ? fileInfo.size
      : metadata.fileSize || 0;
  } catch (error) {
    // Fallback to the original file size if available
    fileSize = metadata.fileSize || 0;
  }

  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    fileSize,
  };
}