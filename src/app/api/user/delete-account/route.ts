import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
    }

    const admin = await createAdminClient()

    // 1. Find all vendors belonging to this user
    const { data: vendors } = await admin
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)

    const vendorIds = vendors?.map((v) => v.id) || []

    if (vendorIds.length > 0) {
      // 2. Delete all products belonging to these vendors
      await admin.from('products').delete().in('vendor_id', vendorIds)

      // 3. Delete category requests from these vendors
      await admin.from('category_requests').delete().in('vendor_id', vendorIds)

      // 4. Delete vendor rows
      await admin.from('vendors').delete().in('id', vendorIds)
    }

    // 5. Delete user profile
    await admin.from('profiles').delete().eq('id', user.id)

    // 6. Delete user from Supabase Auth
    try {
      await admin.auth.admin.deleteUser(user.id)
    } catch (authDeleteErr) {
      console.warn('Could not delete auth user from Supabase admin:', authDeleteErr)
    }

    // 7. Sign out local session
    await supabase.auth.signOut()

    // 8. Revalidate all public cache
    revalidatePath('/', 'layout')

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to delete account.' },
      { status: 500 }
    )
  }
}
