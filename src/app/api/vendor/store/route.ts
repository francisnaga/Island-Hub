import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail, CampusArea } from '@/lib/types'
import { normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { NMU_DEFAULT_COORDS } from '@/lib/marketplace-data'

function slugifyShopName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const suffix = Math.random().toString(36).substring(2, 6)
  return `${base || 'shop'}-${suffix}`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 })
    }

    const body = await request.json()
    const shopName = String(body.shop_name || '').trim()
    const rawPhone = String(body.whatsapp_number || '').trim()
    const campus: CampusArea =
      body.campus === 'Kurutie' || body.campus === 'Both' ? body.campus : 'Okerenkoko'
    const trimmedLocation = String(body.location_label || '').trim()

    if (shopName.length < 2) {
      return NextResponse.json(
        { error: 'Please enter a shop or seller name (at least 2 characters).' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizeWhatsAppNumber(rawPhone)
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Please enter a valid 11-digit Nigerian WhatsApp number.' },
        { status: 400 }
      )
    }

    const adminDb = await createAdminClient()

    const googleName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      shopName ||
      user.email?.split('@')[0] ||
      'Jetty Seller'
    const googleAvatar =
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null

    // 1. Ensure profile exists and is set to vendor/admin mode
    await adminDb.from('profiles').upsert(
      {
        id: user.id,
        full_name: googleName,
        email: user.email,
        avatar_url: googleAvatar,
        role: isAdminEmail(user.email) ? 'admin' : 'vendor',
        active_mode: 'vendor',
      },
      { onConflict: 'id' }
    )

    // 2. Check if vendor already exists for this user
    const { data: existingVendor } = await adminDb
      .from('vendors')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    const pickupDefault =
      campus === 'Both'
        ? 'Okerenkoko & Kurutie pickup'
        : `${campus} campus pickup`

    if (existingVendor) {
      const { data: updated, error: updateErr } = await adminDb
        .from('vendors')
        .update({
          shop_name: shopName,
          whatsapp_number: normalizedPhone,
          campus,
          location_label: trimmedLocation || '',
          location_visibility: trimmedLocation ? 'approximate' : 'hidden',
          pickup_options: trimmedLocation || pickupDefault,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingVendor.id)
        .select('*')
        .single()

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 400 })
      }
      return NextResponse.json({ vendor: updated })
    }

    const { data: created, error: insertErr } = await adminDb
      .from('vendors')
      .insert({
        user_id: user.id,
        shop_name: shopName,
        slug: slugifyShopName(shopName),
        description: `Student seller at ${campus === 'Both' ? 'Okerenkoko & Kurutie' : campus}.`,
        logo_url: googleAvatar,
        whatsapp_number: normalizedPhone,
        categories_offered: [],
        pickup_options: trimmedLocation || pickupDefault,
        delivery_available: true,
        delivery_coverage: campus === 'Both' ? 'Okerenkoko & Kurutie' : campus,
        campus,
        seller_type: 'student',
        is_student: true,
        location_type: 'pickup_point',
        location_visibility: trimmedLocation ? 'approximate' : 'hidden',
        location_label: trimmedLocation || '',
        latitude: NMU_DEFAULT_COORDS.latitude,
        longitude: NMU_DEFAULT_COORDS.longitude,
        location_confirmed_at: new Date().toISOString(),
        verification_status: 'pending',
        is_demo: false,
      })
      .select('*')
      .single()

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 })
    }

    return NextResponse.json({ vendor: created })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Could not save store.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 })
    }

    const body = await request.json()
    const vendorId = String(body.vendor_id || '').trim()
    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendor ID.' }, { status: 400 })
    }

    const adminDb = await createAdminClient()
    const { data: existingVendor } = await adminDb
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .maybeSingle()

    if (!existingVendor) {
      return NextResponse.json({ error: 'Store not found.' }, { status: 404 })
    }

    if (existingVendor.user_id !== user.id && !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof body.shop_name === 'string') {
      const name = body.shop_name.trim()
      if (name.length < 2) {
        return NextResponse.json(
          { error: 'Please enter a valid shop name.' },
          { status: 400 }
        )
      }
      updates.shop_name = name
    }

    if (typeof body.whatsapp_number === 'string') {
      const clean = normalizeWhatsAppNumber(body.whatsapp_number)
      if (!clean) {
        return NextResponse.json(
          { error: 'Please enter a valid WhatsApp number.' },
          { status: 400 }
        )
      }
      updates.whatsapp_number = clean
    }

    if (typeof body.campus === 'string') {
      updates.campus =
        body.campus === 'Kurutie' || body.campus === 'Both'
          ? body.campus
          : 'Okerenkoko'
      updates.delivery_coverage =
        updates.campus === 'Both' ? 'Okerenkoko & Kurutie' : updates.campus
    }

    if (typeof body.location_label === 'string') {
      const loc = body.location_label.trim()
      updates.location_label = loc
      updates.location_visibility = loc ? 'approximate' : 'hidden'
      updates.pickup_options =
        loc ||
        `${existingVendor.campus === 'Both' ? 'Okerenkoko & Kurutie' : existingVendor.campus || 'Okerenkoko'} pickup`
    }

    if (typeof body.description === 'string') {
      updates.description = body.description.trim()
    }

    if (typeof body.logo_url === 'string') {
      updates.logo_url = body.logo_url
    }

    const { data: updated, error } = await adminDb
      .from('vendors')
      .update(updates)
      .eq('id', vendorId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ vendor: updated })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Could not update store.' },
      { status: 500 }
    )
  }
}
