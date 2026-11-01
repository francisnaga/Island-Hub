import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to upload photos.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const requestedFolder = String(formData.get('folder') || user.id).trim()

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }

    // 1. File size check (5MB ceiling)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Image file size exceeds the 5MB limit. Please choose a smaller photo.' },
        { status: 400 }
      )
    }

    // 2. MIME type validation (strict image allowlist, no SVG/HTML)
    const mimeType = (file.type || '').toLowerCase()
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: 'Invalid image format. Only JPEG, PNG, and WebP photos are permitted.' },
        { status: 400 }
      )
    }

    // 3. Extension validation
    const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : 'jpg'

    // 4. Safe folder sanitization (prevent path traversal)
    const sanitizedFolder = requestedFolder
      .replace(/\.\./g, '')
      .replace(/^\/+/, '')
      .replace(/[^a-zA-Z0-9_\/-]/g, '') || user.id

    const filePath = `${sanitizedFolder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}.${ext}`

    const adminDb = await createAdminClient()
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await adminDb.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: mimeType,
        cacheControl: '31536000, public, immutable',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 400 })
    }

    const {
      data: { publicUrl },
    } = adminDb.storage.from('product-images').getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Image upload failed.' },
      { status: 500 }
    )
  }
}
