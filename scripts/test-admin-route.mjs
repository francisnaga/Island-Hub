import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

try {
  const envFile = fs.readFileSync(path.resolve('.env.local'), 'utf8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      process.env[match[1].trim()] = match[2].trim()
    }
  })
} catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'superadmin@islandhub.app',
    password: 'islandhubadmin123'
  })

  if (error || !data.session) {
    console.error('Login failed:', error)
    return
  }

  console.log('Logged in successfully. Token:', data.session.access_token.slice(0, 20) + '...')
  
  // Create cookie string manually to pass Next.js middleware
  // Supabase Next.js implementation usually uses sb-<ref>-auth-token
  const ref = supabaseUrl.split('//')[1].split('.')[0]
  const cookieName = `sb-${ref}-auth-token`
  const cookieValue = JSON.stringify([data.session.access_token, data.session.refresh_token])
  const cookies = `${cookieName}=${encodeURIComponent(cookieValue)}`

  console.log('Fetching http://127.0.0.1:3000/admin ...')
  
  const res = await fetch('http://127.0.0.1:3000/admin', {
    headers: {
      Cookie: cookies
    }
  })

  console.log('Admin route status:', res.status)
  if (res.status === 307 || res.status === 302) {
      console.log('Redirect location:', res.headers.get('location'))
  }
}

test()
