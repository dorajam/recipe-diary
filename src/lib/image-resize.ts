const MAX_LONG_EDGE = 1200
const JPEG_QUALITY = 0.8

/**
 * Resize an image file so the long edge is at most `maxLongEdge` pixels.
 * Returns a JPEG Blob at the specified quality.
 */
export function resizeImage(
  file: File,
  maxLongEdge = MAX_LONG_EDGE,
  quality = JPEG_QUALITY,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)

      let { width, height } = img
      const longEdge = Math.max(width, height)

      if (longEdge > maxLongEdge) {
        const scale = maxLongEdge / longEdge
        width = Math.round(width * scale)
        height = Math.round(height * scale)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob returned null'))
        },
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
