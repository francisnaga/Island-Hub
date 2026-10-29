'use server'

import { redirect } from 'next/navigation'

// Email/password sign-in has been removed.
// Vendors sign in exclusively via Google OAuth.
// This file is kept to avoid breaking any cached imports.
export async function login() {
  redirect('/login')
}
