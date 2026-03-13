import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchema() {
  console.log('Reading schema.sql...');
  const sql = fs.readFileSync('supabase/schema.sql', 'utf8');

  console.log('Applying schema to Supabase...');
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

  if (error) {
    if (error.message.includes('exec_sql')) {
      console.warn('RPC exec_sql not found. You may need to manually run the SQL in the Supabase Dashboard SQL Editor.');
      console.info('Tip: Copy the contents of supabase/schema.sql to your Supabase Dashboard.');
    } else {
      console.error('Error applying schema:', error.message);
    }
  } else {
    console.log('Schema applied successfully!');
  }
}

applySchema().catch(console.error);
