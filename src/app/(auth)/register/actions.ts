'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
    matricNumber: formData.get('matricNumber') as string,
  }

  // 1. Sign up the user (stores email/password in auth.users)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (authError) {
    redirect('/register?error=Could not create user')
  }

  // 2. Insert into the public.profiles table to hold the name / matric
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: data.fullName,
        matric_number: data.matricNumber,
        role: 'student',
        badge: 'none',
        is_verified: false,
      })
      
    if (profileError) {
      // In a real app we'd handle cleanup here if profile insert fails
      console.error('Profile creation error:', profileError)
      redirect('/register?error=Could not setup profile')
    }
  }

  revalidatePath('/', 'layout')
  redirect('/home') // Logged in automatically by supabase after signUp
}
