import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const LAUNCH_CATEGORIES = [
  {
    name: 'Maritime & Cadet Gear',
    short_name: 'Cadet gear',
    slug: 'maritime-cadet-gear',
    description:
      'Action rigs, safety boots, socks, uniform sets, headgear, belts, badges and other relevant student gear.',
    icon: 'Anchor',
    display_order: 1,
    is_priority: true,
    is_active: true,
  },
  {
    name: 'Fashion & Accessories',
    short_name: 'Footwear & Fashion',
    slug: 'fashion-accessories',
    description: 'Everyday clothing, footwear, bags, watches and accessories.',
    icon: 'Shirt',
    display_order: 2,
    is_priority: false,
    is_active: true,
  },
  {
    name: 'Electronics & Gadgets',
    short_name: 'Electronics',
    slug: 'electronics-gadgets',
    description: 'Chargers, earphones, phones, power banks, laptops and accessories.',
    icon: 'Laptop',
    display_order: 3,
    is_priority: false,
    is_active: true,
  },
  {
    name: 'Books & Stationery',
    short_name: 'Books',
    slug: 'books-stationery',
    description:
      'Textbooks, calculators, notebooks, drawing tools and other physical study supplies.',
    icon: 'BookOpen',
    display_order: 4,
    is_priority: false,
    is_active: true,
  },
  {
    name: 'Hostel & Daily Essentials',
    short_name: 'Hostel essentials',
    slug: 'hostel-daily-essentials',
    description:
      'Toiletries, bedding, storage items, buckets, cleaning supplies and basic household goods.',
    icon: 'Home',
    display_order: 5,
    is_priority: false,
    is_active: true,
  },
  {
    name: 'Food, Beauty & Other',
    short_name: 'More items',
    slug: 'food-beauty-other',
    description:
      'Snacks, drinks, grooming and personal-care products, plus an Other category for products that do not fit elsewhere.',
    icon: 'Package',
    display_order: 6,
    is_priority: false,
    is_active: true,
  },
]

async function runSetup() {
  console.log('1. Ensuring product-images storage bucket exists...')
  const { data: buckets } = await supabase.storage.listBuckets()
  if (!buckets?.some((b) => b.name === 'product-images')) {
    const { error: bucketErr } = await supabase.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    })
    if (bucketErr) {
      console.warn('Could not create bucket (run schema.sql first if needed):', bucketErr.message)
    } else {
      console.log('✓ Created public bucket: product-images')
    }
  } else {
    console.log('✓ Bucket product-images already exists')
  }

  console.log('2. Seeding launch categories...')
  const { error: catErr } = await supabase
    .from('categories')
    .upsert(LAUNCH_CATEGORIES, { onConflict: 'slug' })

  if (catErr) {
    console.warn(
      'Note: Please run supabase/schema.sql in your Supabase SQL Editor first. Error:',
      catErr.message
    )
    return
  }
  console.log('✓ 6 NMU Launch Categories synced successfully!')
}

runSetup().catch(console.error)
