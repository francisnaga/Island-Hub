import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  INITIAL_CATEGORIES,
  SYSTEM_HOUSING_CATEGORY_ID,
  SYSTEM_SERVICE_CATEGORY_ID,
} from '@/lib/marketplace-data'
import { isAdminEmail, ProductCondition, StockStatus } from '@/lib/types'

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const suffix = Math.random().toString(36).substring(2, 7)
  return `${base || 'item'}-${suffix}`
}

async function resolveValidCategoryId(
  adminDb: any,
  listingType: string,
  requestedCategoryId?: string | null
): Promise<{ id: string; slug?: string }> {
  // 1. Check all existing categories in DB
  const { data: dbCats } = await adminDb
    .from('categories')
    .select('id, slug, name')
    .order('display_order', { ascending: true })

  const list: Array<{ id: string; slug: string; name: string }> = dbCats || []

  if (listingType === 'housing') {
    const housingCat =
      list.find((c) => c.slug === 'student-housing' || c.id === SYSTEM_HOUSING_CATEGORY_ID) ||
      list[0]
    if (housingCat) return { id: housingCat.id, slug: housingCat.slug }
  }

  if (listingType === 'service') {
    const svcCat =
      list.find((c) => c.slug === 'campus-services' || c.id === SYSTEM_SERVICE_CATEGORY_ID) ||
      list[0]
    if (svcCat) return { id: svcCat.id, slug: svcCat.slug }
  }

  if (requestedCategoryId) {
    const match = list.find(
      (c) => c.id === requestedCategoryId || c.slug === requestedCategoryId
    )
    if (match) {
      return { id: match.id, slug: match.slug }
    }

    // If requestedCategoryId matches one of INITIAL_CATEGORIES that isn't in DB yet, upsert it!
    const seedMatch = INITIAL_CATEGORIES.find(
      (c) => c.id === requestedCategoryId || c.slug === requestedCategoryId
    )
    if (seedMatch) {
      const { data: inserted } = await adminDb
        .from('categories')
        .upsert(seedMatch, { onConflict: 'slug' })
        .select('id, slug')
        .single()
      if (inserted) {
        return { id: inserted.id, slug: inserted.slug }
      }
    }
  }

  if (list.length > 0) {
    return { id: list[0].id, slug: list[0].slug }
  }

  // Last resort: seed default category
  const firstSeed = INITIAL_CATEGORIES[0]
  const { data: seeded } = await adminDb
    .from('categories')
    .upsert(firstSeed, { onConflict: 'slug' })
    .select('id, slug')
    .single()

  return {
    id: seeded?.id || firstSeed.id,
    slug: seeded?.slug || firstSeed.slug,
  }
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
    const adminDb = await createAdminClient()

    // 1. Handle Category Request Submission
    if (body.action === 'request_category') {
      const vendorId = String(body.vendor_id || '').trim()
      const name = String(body.name || '').trim()
      const description = body.description ? String(body.description).trim() : null

      if (!name) {
        return NextResponse.json(
          { error: 'Please enter a category name.' },
          { status: 400 }
        )
      }

      const { error: crErr } = await adminDb.from('category_requests').insert({
        vendor_id: vendorId || null,
        vendor_name: body.vendor_name || null,
        vendor_whatsapp: body.vendor_whatsapp || null,
        name,
        description,
        status: 'pending',
      })

      if (crErr) {
        // Fallback to reports table if category_requests has any issue
        await adminDb.from('reports').insert({
          reporter_id: user.id,
          reporter_contact: `${body.vendor_name || 'Vendor'} (${body.vendor_whatsapp || ''})`,
          target_type: 'vendor',
          vendor_id: vendorId || null,
          reason: `CATEGORY_REQUEST:${name}`,
          details: description || `Vendor requested category: ${name}`,
          status: 'open',
        })
      }

      return NextResponse.json({ success: true })
    }

    // 2. Handle Product / Room / Service Listing Create or Update
    const vendorId = String(body.vendor_id || '').trim()
    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendor ID.' }, { status: 400 })
    }

    const { data: vendor } = await adminDb
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .maybeSingle()

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor store not found.' }, { status: 404 })
    }

    if (vendor.user_id !== user.id && !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    if (vendor.verification_status === 'suspended') {
      return NextResponse.json(
        { error: 'Your storefront is currently suspended.' },
        { status: 403 }
      )
    }

    const listingType =
      body.listing_type === 'housing' ||
      body.listing_type === 'service' ||
      body.listing_type === 'food'
        ? body.listing_type
        : 'product'

    const resolvedCat = await resolveValidCategoryId(
      adminDb,
      listingType,
      body.category_id
    )

    const isDraft = Boolean(body.is_draft || body.status === 'draft')
    const title = String(body.title || (isDraft ? 'Untitled Draft' : '')).trim()
    const price = Number(body.price || 0)
    if (!isDraft && (!title || Number.isNaN(price) || price <= 0)) {
      return NextResponse.json(
        { error: 'Please provide a valid title and price.' },
        { status: 400 }
      )
    }

    const campus =
      body.campus === 'Kurutie' || body.campus === 'Both'
        ? body.campus
        : 'Okerenkoko'

    const incomingVariants =
      body.variants && typeof body.variants === 'object' ? body.variants : {}

    const variants = {
      ...incomingVariants,
      campus,
      listing_type: listingType,
    }

    const targetStatus = isDraft ? 'draft' : 'pending_review'

    // Strictly use only columns that exist on public.products in Supabase
    const dbPayload = {
      vendor_id: vendor.id,
      category_id: resolvedCat.id,
      listing_type: listingType,
      title,
      description: String(body.description || title).trim(),
      price: Number.isNaN(price) ? 0 : price,
      condition: (body.condition === 'good' ||
      body.condition === 'like_new' ||
      body.condition === 'fair'
        ? body.condition
        : 'new') as ProductCondition,
      stock_status: (body.stock_status || 'available') as StockStatus,
      stock_quantity: 1,
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : ['/products/cadet-uniform-tailoring.jpg'],
      service_turnaround: body.service_turnaround || null,
      service_area: body.service_area || null,
      variants,
      status: targetStatus,
      is_demo: false,
      last_confirmed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Update vendor categories_offered if new category
    if (resolvedCat.slug) {
      const existingCats: string[] = Array.isArray(vendor.categories_offered)
        ? vendor.categories_offered
        : []
      if (!existingCats.includes(resolvedCat.slug)) {
        await adminDb
          .from('vendors')
          .update({
            categories_offered: [...existingCats, resolvedCat.slug],
          })
          .eq('id', vendor.id)
      }
    }

    const editId = body.id ? String(body.id).trim() : ''

    if (editId) {
      const { data: updated, error: updateErr } = await adminDb
        .from('products')
        .update(dbPayload)
        .eq('id', editId)
        .eq('vendor_id', vendor.id)
        .select('*, category:categories(*)')
        .single()

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 400 })
      }

      return NextResponse.json({
        product: {
          ...updated,
          campus,
          room_meta: updated.variants?.room_meta,
          service_meta: updated.variants?.service_meta,
        },
      })
    }

    const { data: created, error: insertErr } = await adminDb
      .from('products')
      .insert({
        ...dbPayload,
        slug: slugifyTitle(title),
      })
      .select('*, category:categories(*)')
      .single()

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 400 })
    }

    return NextResponse.json({
      product: {
        ...created,
        campus,
        room_meta: created.variants?.room_meta,
        service_meta: created.variants?.service_meta,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Could not publish listing.' },
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
    const productId = String(body.id || '').trim()
    if (!productId) {
      return NextResponse.json({ error: 'Missing listing ID.' }, { status: 400 })
    }

    const adminDb = await createAdminClient()
    const { data: existing } = await adminDb
      .from('products')
      .select('*, vendor:vendors(id, user_id)')
      .eq('id', productId)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    if (existing.vendor?.user_id !== user.id && !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof body.stock_status === 'string') {
      updates.stock_status = body.stock_status
      updates.last_confirmed_at = new Date().toISOString()
    }

    if (typeof body.status === 'string') {
      updates.status = body.status
    }

    const { data: updated, error } = await adminDb
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select('*, category:categories(*)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ product: updated })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Could not update listing.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in to continue.' }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get('id')?.trim()
    if (!id) {
      return NextResponse.json({ error: 'Missing listing ID.' }, { status: 400 })
    }

    const adminDb = await createAdminClient()
    const { data: existing } = await adminDb
      .from('products')
      .select('id, vendor:vendors(id, user_id)')
      .eq('id', id)
      .maybeSingle()

    if (!existing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 })
    }

    if ((existing as any).vendor?.user_id !== user.id && !isAdminEmail(user.email)) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    const { error } = await adminDb.from('products').delete().eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Could not delete listing.' },
      { status: 500 }
    )
  }
}
