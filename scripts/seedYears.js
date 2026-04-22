import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function seedYears() {
  // 1. get programs
  const { data: programs, error: pError } = await supabase
    .from('programs')
    .select('*')

  if (pError) {
    console.error('❌ Error fetching programs:', pError)
    return
  }

  const years = []

  for (const program of programs) {
    years.push(
      { program_id: program.id, year_level: '1st Year' },
      { program_id: program.id, year_level: '2nd Year' },
      { program_id: program.id, year_level: '3rd Year' },
      { program_id: program.id, year_level: '4th Year' }
    )
  }

  const { data, error } = await supabase
    .from('years')
    .insert(years)
    .select()

  if (error) {
    console.error('❌ Error inserting years:', error)
    return
  }

  console.log('✅ Years inserted:', data)
}

seedYears()
