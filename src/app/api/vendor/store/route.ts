import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail, CampusArea } from '@/lib/types'
import { normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { sendAdminPush } from '@/lib/push'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/
const RESERVED = new Set([
  'admin', 'api', 'marketplace', 'vendors', 'vendor', 'safety', 'housing',
  'services', 'login', 'profile', 'settings', 'help', 'support', 'about',
  'contact', 'health', 'migrate', 'push',
])
const COOLDOWN_DAYS = 14

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

    const hasCoordinates =
      typeof body.latitude === 'number' &&
      !Number.isNaN(body.latitude) &&
      typeof body.longitude === 'number' &&
      !Number.isNaN(body.longitude)

    const pinnedLat = hasCoordinates ? Number(body.latitude) : null
    const pinnedLng = hasCoordinates ? Number(body.longitude) : null

    // --- Image / Logo Handling ---
    const chosenLogo =
      body.logo_url !== undefined
        ? typeof body.logo_url === 'string' && body.logo_url.trim().length > 0
          ? body.logo_url.trim()
          : null
        : undefined

    // --- Username handling ---
    const rawUsername =
      typeof body.username === 'string'
        ? body.username.trim().replace(/^@/, '').toLowerCase()
        : null

    if (rawUsername) {
      if (!USERNAME_RE.test(rawUsername)) {
        return NextResponse.json(
          { error: 'Username must be 3–20 characters using only a–z, 0–9, or _' },
          { status: 400 }
        )
      }
      if (RESERVED.has(rawUsername)) {
        return NextResponse.json({ error: 'That username is reserved.' }, { status: 400 })
      }
    }

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
        avatar_url: chosenLogo !== undefined ? chosenLogo : googleAvatar,
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

    // 3. For new vendors: check username uniqueness up-front
    if (!existingVendor && rawUsername) {
      const { data: usernameTaken } = await adminDb
        .from('vendors')
        .select('id')
        .ilike('username', rawUsername)
        .maybeSingle()
      if (usernameTaken) {
        return NextResponse.json(
          { error: `@${rawUsername} is already taken.` },
          { status: 409 }
        )
      }
    }

    const pickupDefault =
      campus === 'Both'
        ? 'Okerenkoko & Kurutie pickup'
        : `${campus} campus pickup`

    if (existingVendor) {
      // --- Username cooldown check for existing vendor ---
      if (rawUsername && rawUsername !== existingVendor.username) {
        // Check uniqueness
        const { data: taken } = await adminDb
          .from('vendors')
          .select('id')
          .ilike('username', rawUsername)
          .neq('id', existingVendor.id)
          .maybeSingle()
        if (taken) {
          return NextResponse.json(
            { error: `@${rawUsername} is already taken.` },
            { status: 409 }
          )
        }
        // Check cooldown
        if (existingVendor.username_changed_at) {
          const lastChanged = new Date(existingVendor.username_changed_at).getTime()
          const diffDays = (Date.now() - lastChanged) / (1000 * 60 * 60 * 24)
          if (diffDays < COOLDOWN_DAYS) {
            const remaining = Math.ceil(COOLDOWN_DAYS - diffDays)
            return NextResponse.json(
              {
                error: `You can change your username again in ${remaining} day${remaining === 1 ? '' : 's'}.`,
              },
              { status: 429 }
            )
          }
        }
      }

      const { data: updated, error: updateErr } = await adminDb
        .from('vendors')
        .update({
          shop_name: shopName,
          whatsapp_number: normalizedPhone,
          campus,
          location_label: trimmedLocation,
          ...(chosenLogo !== undefined
            ? { logo_url: chosenLogo }
            : !existingVendor.logo_url && googleAvatar
            ? { logo_url: googleAvatar }
            : {}),
          ...(rawUsername && rawUsername !== existingVendor.username
            ? { username: rawUsername, username_changed_at: new Date().toISOString() }
            : {}),
          ...(body.latitude !== undefined
            ? {
                latitude: pinnedLat,
                longitude: pinnedLng,
                location_visibility: hasCoordinates
                  ? 'exact'
                  : trimmedLocation
                  ? 'approximate'
                  : 'hidden',
              }
            : {
                location_visibility:
                  existingVendor.latitude != null && existingVendor.longitude != null
                    ? 'exact'
                    : trimmedLocation
                    ? 'approximate'
                    : 'hidden',
              }),
          pickup_options: trimmedLocation || pickupDefault,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingVendor.id)
        .select('*')
        .single()

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 400 })
      }
      revalidatePath('/', 'layout')
      return NextResponse.json({ vendor: updated })
    }

    const { data: created, error: insertErr } = await adminDb
      .from('vendors')
      .insert({
        user_id: user.id,
        shop_name: shopName,
        slug: slugifyShopName(shopName),
        description: `Student seller at ${campus === 'Both' ? 'Okerenkoko & Kurutie' : campus}.`,
        logo_url: chosenLogo !== undefined ? chosenLogo : (googleAvatar || null),
        whatsapp_number: normalizedPhone,
        categories_offered: [],
        pickup_options: trimmedLocation || pickupDefault,
        delivery_available: true,
        delivery_coverage: campus === 'Both' ? 'Okerenkoko & Kurutie' : campus,
        campus,
        seller_type: 'student',
        is_student: true,
        location_type: 'pickup_point',
        location_visibility: hasCoordinates
          ? 'exact'
          : trimmedLocation
          ? 'approximate'
          : 'hidden',
        location_label: trimmedLocation,
        latitude: pinnedLat,
        longitude: pinnedLng,
        location_confirmed_at: new Date().toISOString(),
        verification_status: 'pending',
        is_demo: false,
        ...(rawUsername ? { username: rawUsername, username_changed_at: new Date().toISOString() } : {}),
      })
      .select('*')
      .single()

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 })
    }

    // Notify admin: new vendor application
    await sendAdminPush({
      title: '🏪 New Vendor Applied',
      body: `${shopName} applied to sell on Jetty (${campus} campus)`,
      url: '/admin',
      tag: 'new-vendor',
    })

    revalidatePath('/', 'layout')
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
      const hasPinned =
        existingVendor.latitude != null && existingVendor.longitude != null
      updates.location_visibility = hasPinned
        ? 'exact'
        : loc
        ? 'approximate'
        : 'hidden'
      updates.pickup_options =
        loc ||
        `${existingVendor.campus === 'Both' ? 'Okerenkoko & Kurutie' : existingVendor.campus || 'Okerenkoko'} pickup`
    }

    if ('latitude' in body && 'longitude' in body) {
      const hasCoords =
        typeof body.latitude === 'number' &&
        !Number.isNaN(body.latitude) &&
        typeof body.longitude === 'number' &&
        !Number.isNaN(body.longitude)
      updates.latitude = hasCoords ? Number(body.latitude) : null
      updates.longitude = hasCoords ? Number(body.longitude) : null
      updates.location_visibility = hasCoords
        ? 'exact'
        : existingVendor.location_label
        ? 'approximate'
        : 'hidden'
      updates.location_confirmed_at = new Date().toISOString()
    }

    if (typeof body.description === 'string') {
      updates.description = body.description.trim()
    }

    if (typeof body.logo_url === 'string') {
      updates.logo_url = body.logo_url
      // Also synchronize to the vendor user's profile avatar
      if (existingVendor.user_id) {
        await adminDb
          .from('profiles')
          .update({ avatar_url: body.logo_url })
          .eq('id', existingVendor.user_id)
      }
    }

    // Username update via PATCH
    if (typeof body.username === 'string') {
      const newUsername = body.username.trim().replace(/^@/, '').toLowerCase()
      if (!USERNAME_RE.test(newUsername)) {
        return NextResponse.json(
          { error: 'Username must be 3–20 characters using only a–z, 0–9, or _' },
          { status: 400 }
        )
      }
      if (RESERVED.has(newUsername)) {
        return NextResponse.json({ error: 'That username is reserved.' }, { status: 400 })
      }
      if (newUsername !== existingVendor.username) {
        const { data: taken } = await adminDb
          .from('vendors')
          .select('id')
          .ilike('username', newUsername)
          .neq('id', vendorId)
          .maybeSingle()
        if (taken) {
          return NextResponse.json(
            { error: `@${newUsername} is already taken.` },
            { status: 409 }
          )
        }
        if (existingVendor.username_changed_at) {
          const diffDays =
            (Date.now() - new Date(existingVendor.username_changed_at).getTime()) /
            (1000 * 60 * 60 * 24)
          if (diffDays < COOLDOWN_DAYS) {
            const remaining = Math.ceil(COOLDOWN_DAYS - diffDays)
            return NextResponse.json(
              {
                error: `You can change your username again in ${remaining} day${remaining === 1 ? '' : 's'}.`,
              },
              { status: 429 }
            )
          }
        }
        updates.username = newUsername
        updates.username_changed_at = new Date().toISOString()
      }
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

    if (updates.username || updates.shop_name) {
      await sendAdminPush({
        title: '✏️ Store Updated',
        body: `"${updated.shop_name}" updated store profile${updates.username ? ` (@${updates.username})` : ''}`,
        url: '/admin',
        tag: `vendor-update-${vendorId}`,
      })
    }

    revalidatePath('/', 'layout')
    return NextResponse.json({ vendor: updated })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Could not update store.' },
      { status: 500 }
    )
  }
}
