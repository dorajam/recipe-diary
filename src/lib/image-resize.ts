const MAX_LONG_EDGE = 1200
const JPEG_QUALITY = 0.8

const HEIC_TYPES = ['image/heic', 'image/heif']

function isHeic(file: File): boolean {
  if (HEIC_TYPES.includes(file.type)) return true
  return /\.heic$/i.test(file.name)
}

/**
 * Resize an image file so the long edge is at most `maxLongEdge` pixels.
 * Returns a JPEG Blob at the specified quality.
 * Converts HEIC/HEIF to JPEG first if needed.
 */
export async function resizeImage(
  file: File,
  maxLongEdge = MAX_LONG_EDGE,
  quality = JPEG_QUALITY,
): Promise<Blob> {
  let source: Blob = file

  if (isHeic(file)) {
    const { default: heic2any } = await import('heic2any')
    source = await heic2any({ blob: file, toType: 'image/jpeg', quality }) as Blob
  }

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
    img.src = URL.createObjectURL(source)
  })
}
