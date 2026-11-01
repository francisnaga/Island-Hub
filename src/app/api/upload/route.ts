import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
    const folder = String(formData.get('folder') || user.id).trim()

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }

    const adminDb = await createAdminClient()

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filePath = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await adminDb.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: file.type || 'image/webp',
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
