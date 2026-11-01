import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please sign in as admin.' }, { status: 401 })
    }

    const adminDb = await createAdminClient()

    if (!isAdminEmail(user.email)) {
      const { data: profile } = await adminDb
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()
      if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
      }
    }

    const body = await request.json()
    const action = String(body.action || '')

    if (action === 'vendor_status') {
      const { vendor_id, status, reason } = body
      const { data, error } = await adminDb
        .from('vendors')
        .update({
          verification_status: status,
          rejection_reason: reason || null,
          ...(status === 'suspended' ? { is_featured: false } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendor_id)
        .select('*')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      if (status === 'suspended') {
        await adminDb
          .from('products')
          .update({ status: 'archived', is_featured: false })
          .eq('vendor_id', vendor_id)
      } else if (status === 'verified') {
        await adminDb
          .from('products')
          .update({ status: 'approved' })
          .eq('vendor_id', vendor_id)
          .eq('status', 'archived')
      }

      return NextResponse.json({ vendor: data })
    }

    if (action === 'vendor_featured') {
      const { vendor_id, is_featured } = body
      const { data, error } = await adminDb
        .from('vendors')
        .update({ is_featured: Boolean(is_featured), updated_at: new Date().toISOString() })
        .eq('id', vendor_id)
        .select('*')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ vendor: data })
    }

    if (action === 'vendor_business') {
      const { vendor_id, business_verified } = body
      const { data, error } = await adminDb
        .from('vendors')
        .update({
          business_verified: Boolean(business_verified),
          seller_type: 'business',
          updated_at: new Date().toISOString(),
        })
        .eq('id', vendor_id)
        .select('*')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ vendor: data })
    }

    if (action === 'product_status') {
      const { product_id, status, reason } = body
      const { data, error } = await adminDb
        .from('products')
        .update({
          status,
          rejection_reason: reason || null,
          ...(status !== 'approved' ? { is_featured: false } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', product_id)
        .select('*, category:categories(*), vendor:vendors(*)')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ product: data })
    }

    if (action === 'product_featured') {
      const { product_id, is_featured } = body
      const { data, error } = await adminDb
        .from('products')
        .update({ is_featured: Boolean(is_featured), updated_at: new Date().toISOString() })
        .eq('id', product_id)
        .select('*, category:categories(*), vendor:vendors(*)')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ product: data })
    }

    if (action === 'create_category') {
      const { name, slug, description, display_order, is_priority } = body
      const { data, error } = await adminDb
        .from('categories')
        .upsert(
          {
            name: String(name || '').trim(),
            short_name: String(name || '').trim(),
            slug: String(slug || '').trim(),
            description: String(description || `Browse ${name} on Jetty`).trim(),
            display_order: Number(display_order || 20),
            is_priority: Boolean(is_priority),
            is_active: true,
          },
          { onConflict: 'slug' }
        )
        .select('*')
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ category: data })
    }

    if (action === 'approve_category_request') {
      const { request_id, name, description, display_order } = body
      const slug = String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      const { data: newCat, error: catErr } = await adminDb
        .from('categories')
        .upsert(
          {
            name: String(name || '').trim(),
            short_name: String(name || '').trim(),
            slug,
            description: String(description || `Browse ${name} on Jetty`).trim(),
            display_order: Number(display_order || 20),
            is_priority: false,
            is_active: true,
          },
          { onConflict: 'slug' }
        )
        .select('*')
        .single()

      if (catErr) return NextResponse.json({ error: catErr.message }, { status: 400 })

      await adminDb
        .from('category_requests')
        .update({ status: 'approved' })
        .eq('id', request_id)

      return NextResponse.json({ category: newCat })
    }

    if (action === 'reject_category_request') {
      const { request_id } = body
      await adminDb
        .from('category_requests')
        .update({ status: 'rejected' })
        .eq('id', request_id)

      return NextResponse.json({ success: true })
    }

    if (action === 'delete_category') {
      const { category_id } = body
      const { error } = await adminDb
        .from('categories')
        .delete()
        .eq('id', category_id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    if (action === 'delete_product') {
      const { product_id } = body
      const { error } = await adminDb
        .from('products')
        .delete()
        .eq('id', product_id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    if (action === 'resolve_report') {
      const { report_id, status } = body
      const { error } = await adminDb
        .from('reports')
        .update({
          status,
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
        })
        .eq('id', report_id)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Admin action failed.' },
      { status: 500 }
    )
  }
}
