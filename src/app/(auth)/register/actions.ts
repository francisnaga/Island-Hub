'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const fullName = (formData.get('fullName') as string)?.trim()
  const initialMode = (formData.get('initialMode') as string) === 'vendor' ? 'vendor' : 'buyer'
  const next = (formData.get('next') as string) || (initialMode === 'vendor' ? '/vendor/apply' : '/')

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (authError) {
    redirect(`/register?error=${encodeURIComponent(authError.message)}`)
  }

  if (authData.user) {
    await supabase.from('profiles').upsert(
      {
        id: authData.user.id,
        full_name: fullName,
        email,
        role: 'buyer',
        active_mode: initialMode,
      },
      { onConflict: 'id' }
    )
  }

  revalidatePath('/', 'layout')
  redirect(next)
}
