import { useCallback, useEffect, useMemo, useState } from 'react'
import { resizeImage } from '../../lib/image-resize'
import { Tomato } from '../illustrations/Produce'

interface ImageUploadProps {
  onImagesReady: (files: Blob[]) => void
  existingImages?: { id: string; url: string }[]
  onDeleteExisting?: (id: string) => void
  /** Extra images added elsewhere (e.g. a scraped or reel-cover photo). */
  extraImages?: Blob[]
  onRemoveExtra?: (index: number) => void
}

export function ImageUpload({
  onImagesReady,
  existingImages = [],
  onDeleteExisting,
  extraImages = [],
  onRemoveExtra,
}: ImageUploadProps) {
  const [processing, setProcessing] = useState(false)

  // Object URLs for the externally-added images, rebuilt when they change.
  const extraUrls = useMemo(
    () => extraImages.map((b) => URL.createObjectURL(b)),
    [extraImages],
  )
  useEffect(() => {
    return () => extraUrls.forEach((u) => URL.revokeObjectURL(u))
  }, [extraUrls])

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      setProcessing(true)
      const blobs: Blob[] = []

      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith('image/')) continue
        blobs.push(await resizeImage(file))
      }

      // Parent holds the images (as extraImages) and renders their previews,
      // so we don't keep a separate internal copy that would double up.
      onImagesReady(blobs)
      setProcessing(false)
    },
    [onImagesReady],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const hasAnyImages = existingImages.length > 0 || extraUrls.length > 0

  return (
    <div className="space-y-3">
      {hasAnyImages && (
        <div className="flex flex-wrap gap-2">
          {existingImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.url}
                alt=""
                className="w-20 h-20 object-cover border border-border"
                style={{ borderRadius: 2 }}
              />
              {onDeleteExisting && (
                <button
                  type="button"
                  onClick={() => onDeleteExisting(img.id)}
                  aria-label="Remove photo"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-oxblood
                    text-cream text-xs flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {extraUrls.map((src, i) => (
            <div key={`extra-${i}`} className="relative group">
              <img
                src={src}
                alt=""
                className="w-20 h-20 object-cover border border-border"
                style={{ borderRadius: 2 }}
              />
              {onRemoveExtra && (
                <button
                  type="button"
                  onClick={() => onRemoveExtra(i)}
                  aria-label="Remove photo"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-oxblood
                    text-cream text-xs flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => document.getElementById('file-input')?.click()}
        className={`flex flex-col items-center justify-center gap-2 cursor-pointer
          border-[2px] border-dashed border-border hover:border-tomato hover:bg-bg-warm/40
          transition-colors text-center
          ${hasAnyImages ? 'py-5 px-4' : 'py-10 px-6'}`}
        style={{ borderRadius: 2 }}
      >
        {!hasAnyImages && <Tomato size={48} />}
        {processing ? (
          <p className="font-mono text-sm text-text-muted m-0">resizing...</p>
        ) : (
          <>
            <p className="font-display italic text-sm text-text-muted m-0">
              {hasAnyImages ? 'add another photo' : 'drop a photo or click to choose'}
            </p>
            <p
              className="font-mono font-bold text-text-muted/70 m-0"
              style={{ fontSize: 9, letterSpacing: '0.22em' }}
            >
              JPG · PNG · HEIC
            </p>
          </>
        )}
        <input
          id="file-input"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
    </div>
  )
}
