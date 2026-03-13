import { createClient } from '@supabase/supabase-js';
import { faker } from '@faker-js/faker';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seed() {
  console.log('Starting seed process for 200 users...');
  console.log('Target: 6 Official (Gold), 8 Normal Vendors (Blue), 186 Standard Students.');

  const users = [];

  for (let i = 0; i < 200; i++) {
    const email = faker.internet.email();
    const password = 'Password123!';
    const fullName = faker.person.fullName();
    
    // Determine tier
    let role = 'student';
    let badge = 'none';
    
    if (i < 6) {
      role = 'vendor';
      badge = 'gold';
    } else if (i < 14) {
      role = 'vendor';
      badge = 'blue';
    }

    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    });

    if (authError) {
      console.error(`Error creating user ${email}:`, authError.message);
      continue;
    }

    const userId = authData.user.id;
    console.log(`Created user ${i + 1}/200: ${email} (Role: ${role}, Badge: ${badge})`);

    // The trigger in schema.sql handles basic profile creation.
    // We need to update the role and badge specifically for our vendors.
    if (role !== 'student' || badge !== 'none') {
      await supabase.from('profiles').update({ role, badge }).eq('id', userId);
    }

    // Seed content based on role
    if (role === 'vendor') {
      // Vendors always have services
      await supabase.from('services').insert({
        vendor_id: userId,
        name: faker.commerce.department() + " Services",
        price: faker.number.int({ min: 10, max: 100 }),
        category: 'Services',
        description: faker.company.catchPhrase(),
        is_featured: badge === 'gold'
      });
    }

    // Random content for everyone
    const rand = Math.random();
    if (rand < 0.2) {
      await supabase.from('listings').insert({
        user_id: userId,
        title: faker.location.streetAddress() + ' Apartment',
        price: faker.number.int({ min: 50, max: 2000 }),
        location: faker.location.city(),
        description: faker.lorem.paragraph()
      });
    }

    if (rand > 0.8) {
      await supabase.from('marketplace_items').insert({
        seller_id: userId,
        name: faker.commerce.productName(),
        price: faker.number.int({ min: 5, max: 500 }),
        description: faker.lorem.sentence()
      });
    }
  }

  console.log('Seeding complete!');
}

seed().catch(console.error);
