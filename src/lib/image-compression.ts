/**
 * Client-Side Image Compression for Fast Uploads & Low Bandwidth
 * Specially optimized for iPhone photos (HEIC/HEIF/high-resolution JPEG/PNG).
 * Resizes large 12MP-48MP photos to a crisp max dimension (default 1280px)
 * and compresses to ~120KB-250KB WebP/JPEG before uploading to Supabase Storage.
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  mimeType?: 'image/jpeg' | 'image/webp'
}

/**
 * Checks if a file is an image (including iOS camera HEIC/HEIF)
 */
export function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp') ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  )
}

/**
 * Optimized for store logos and user profile pictures.
 * Compresses to 320x320 WebP (~15KB–25KB) so avatars load instantaneously even on 2G/3G edge networks.
 */
export async function compressAvatarFile(
  file: File
): Promise<{ file: File; blob: Blob; dataUrl: string }> {
  return compressImageFile(file, {
    maxWidth: 320,
    maxHeight: 320,
    quality: 0.82,
    mimeType: 'image/webp',
  })
}

/**
 * Compresses an image File using the browser's HTMLCanvasElement.
 * Automatically handles image orientation and scales large camera captures.
 */
export async function compressImageFile(
  file: File,
  options: CompressionOptions = {}
): Promise<{ file: File; blob: Blob; dataUrl: string }> {
  const {
    maxWidth = 960,
    maxHeight = 960,
    quality = 0.76,
    mimeType = 'image/webp',
  } = options

  return new Promise((resolve, reject) => {
    // Attempt createImageBitmap first (hardware accelerated & auto-orients on modern Safari & Chrome)
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      window
        .createImageBitmap(file, { imageOrientation: 'from-image' })
        .then((bitmap) => {
          try {
            const { width, height } = calculateDimensions(
              bitmap.width,
              bitmap.height,
              maxWidth,
              maxHeight
            )

            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')
            if (!ctx) {
              bitmap.close()
              throw new Error('Canvas 2D context unavailable')
            }

            // High-quality image smoothing
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'
            ctx.drawImage(bitmap, 0, 0, width, height)
            bitmap.close()

            finalizeCanvas(canvas, file.name, mimeType, quality, resolve, reject)
          } catch (err) {
            // Fall back to Image/FileReader
            fallbackCompression(file, maxWidth, maxHeight, quality, mimeType, resolve, reject)
          }
        })
        .catch(() => {
          fallbackCompression(file, maxWidth, maxHeight, quality, mimeType, resolve, reject)
        })
      return
    }

    fallbackCompression(file, maxWidth, maxHeight, quality, mimeType, resolve, reject)
  })
}

function calculateDimensions(
  origWidth: number,
  origHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = origWidth
  let height = origHeight

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width)
    width = maxWidth
  }

  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height)
    height = maxHeight
  }

  return { width: Math.max(1, width), height: Math.max(1, height) }
}

function finalizeCanvas(
  canvas: HTMLCanvasElement,
  originalName: string,
  requestedMimeType: string,
  quality: number,
  resolve: (value: { file: File; blob: Blob; dataUrl: string }) => void,
  reject: (reason?: unknown) => void
) {
  // Check if requested MIME is supported by canvas (fall back to jpeg if webp unsupported)
  let mimeType = requestedMimeType
  try {
    const testUrl = canvas.toDataURL(requestedMimeType, 0.5)
    if (!testUrl.startsWith(`data:${requestedMimeType}`)) {
      mimeType = 'image/jpeg'
    }
  } catch {
    mimeType = 'image/jpeg'
  }

  const dataUrl = canvas.toDataURL(mimeType, quality)

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        return reject(new Error('Failed to create compressed image blob'))
      }

      const cleanBaseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
      const ext = mimeType === 'image/webp' ? 'webp' : 'jpg'
      const compressedFile = new File([blob], `${cleanBaseName}.${ext}`, {
        type: mimeType,
        lastModified: Date.now(),
      })

      resolve({
        file: compressedFile,
        blob,
        dataUrl,
      })
    },
    mimeType,
    quality
  )
}

function fallbackCompression(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number,
  mimeType: string,
  resolve: (value: { file: File; blob: Blob; dataUrl: string }) => void,
  reject: (reason?: unknown) => void
) {
  const reader = new FileReader()
  reader.onerror = () => reject(new Error('Could not read image file'))
  reader.onload = () => {
    const img = new Image()
    img.onerror = () => reject(new Error('Invalid image file'))
    img.onload = () => {
      const { width, height } = calculateDimensions(img.width, img.height, maxWidth, maxHeight)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context unavailable'))

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      finalizeCanvas(canvas, file.name, mimeType, quality, resolve, reject)
    }
    img.src = reader.result as string
  }
  reader.readAsDataURL(file)
}
