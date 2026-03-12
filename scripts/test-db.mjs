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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
  const email = 'superadmin@islandhub.app'
  const { data: { users } } = await supabase.auth.admin.listUsers()
  const user = users.find(u => u.email === email)
  
  if (!user) {
    console.log('User not found in auth.users!')
    return
  }

  console.log('User ID:', user.id)
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (error) {
    console.log('Profile error:', error)
  } else {
    console.log('Profile:', profile)
  }
}

test()
