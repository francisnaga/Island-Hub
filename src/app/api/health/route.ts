import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  let dbOk = false
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
    dbOk = !error
  } catch {
    dbOk = false
  }

  return NextResponse.json(
    { status: 'ok', db: dbOk ? 'reachable' : 'unreachable', ts: new Date().toISOString() },
    { status: 200 }
  )
}
