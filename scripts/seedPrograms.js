import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function seedPrograms() {
  const { data, error } = await supabase
  .from('programs')
  .upsert([
    { name: 'Music' },
    { name: 'Dance' },
    { name: 'Art' },
    { name: 'Drama' }
  ], { onConflict: 'name' })
  .select()

  if (error) {
    console.error('❌ Error inserting programs:', error)
    return
  }

  console.log('✅ Programs inserted:', data)
}

seedPrograms()
