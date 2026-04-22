import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' }) // IMPORTANT

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function seed() {
  const { data, error } = await supabase
    .from('categories')
    .insert([
      { year_level: '1st Year', program: 'Music' },
      { year_level: '2nd Year', program: 'Dance' },
      { year_level: '3rd Year', program: 'Drama' },
      { year_level: '4th Year', program: 'Visual Arts' }
    ])
    .select()

  if (error) {
    console.error('❌ Error:', error)
    return
  }

  console.log('✅ Inserted:', data)
}

seed()
