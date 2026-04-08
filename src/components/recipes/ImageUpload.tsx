import { useCallback, useState } from 'react'
import { resizeImage } from '../../lib/image-resize'

interface ImageUploadProps {
  onImagesReady: (files: Blob[]) => void
  existingImages?: { id: string; url: string }[]
  onDeleteExisting?: (id: string) => void
}

export function ImageUpload({
  onImagesReady,
  existingImages = [],
  onDeleteExisting,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      setProcessing(true)
      const blobs: Blob[] = []
      const newPreviews: string[] = []

      for (const file of Array.from(fileList)) {
        if (!file.type.startsWith('image/')) continue

        const resized = await resizeImage(file)
        blobs.push(resized)
        newPreviews.push(URL.createObjectURL(resized))
      }

      setPreviews((prev) => [...prev, ...newPreviews])
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

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text">Photos</label>

      {/* Existing images */}
      {existingImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {existingImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.url}
                alt=""
                className="w-24 h-24 object-cover rounded-lg border border-border"
              />
              {onDeleteExisting && (
                <button
                  type="button"
                  onClick={() => onDeleteExisting(img.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent
                    text-white text-xs flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="w-24 h-24 object-cover rounded-lg border border-border opacity-80"
            />
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-xl p-8
          text-center cursor-pointer hover:border-accent hover:bg-accent-soft/30
          transition-colors"
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {processing ? (
          <p className="text-text-muted text-sm">Resizing images...</p>
        ) : (
          <p className="text-text-muted text-sm">
            Drop photos here or click to choose
          </p>
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
