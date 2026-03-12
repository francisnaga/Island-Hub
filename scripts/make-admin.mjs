import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually parse .env.local
try {
  const envFile = fs.readFileSync(path.resolve('.env.local'), 'utf8')
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match) {
      process.env[match[1].trim()] = match[2].trim()
    }
  })
} catch (e) {
  console.log('Could not load .env.local')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser(email, password, fullName, matricNumber) {
  console.log(`Checking if user exists: ${email}`)
  
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  if (listError) {
    console.error('Error listing users:', listError)
    process.exit(1)
  }

  let user = users.find(u => u.email === email)
  
  if (!user) {
    console.log('User not found. Creating user...')
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        matric_number: matricNumber
      }
    })
    
    if (createError) {
       console.error('Error creating user:', createError)
       process.exit(1)
    }
    user = createData.user
    console.log(`Created user: ${user.id}`)
  } else {
    console.log(`User already exists: ${user.id}`)
  }

  // Wait a second for the DB trigger to finish creating the profile
  await new Promise(resolve => setTimeout(resolve, 2000))

  console.log('Upserting profile role to admin...')
  const { error: updateError } = await supabase
    .from('profiles')
    .upsert({ 
       id: user.id,
       role: 'admin',
       full_name: fullName,
       matric_number: matricNumber,
       is_verified: true,
       badge: 'gold'
    })

  if (updateError) {
    console.error('Error updating profile:', updateError)
    process.exit(1)
  }

  console.log(`Successfully provisioned admin account: ${email}`)
}

const email = process.argv[2] || 'superadmin@islandhub.app'
const password = process.argv[3] || 'islandhubadmin123'
const fullName = process.argv[4] || 'IslandHub Admin'
const matricNumber = process.argv[5] || 'ADMIN/001'

createAdminUser(email, password, fullName, matricNumber)
