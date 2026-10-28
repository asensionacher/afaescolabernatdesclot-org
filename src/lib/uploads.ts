import { prisma } from '@/lib/db'

export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024 // 8 MB

export interface SavedUpload {
  id: string
  filename: string
}

export interface UploadError {
  error: string
}

/** Guarda un fichero subido en la base de datos. */
export async function saveUpload(file: File): Promise<SavedUpload | UploadError> {
  if (file.size > MAX_UPLOAD_SIZE) {
    return { error: 'FILE_TOO_BIG' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const upload = await prisma.upload.create({
    data: {
      filename: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      data: buffer,
    },
    select: { id: true, filename: true },
  })

  return upload
}
