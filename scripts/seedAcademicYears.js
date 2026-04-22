import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function seedAcademicYears() {
  try {
    // 1. Get all programs
    const { data: programs, error: pError } = await supabase
      .from('programs')
      .select('id, name')

    if (pError) {
      console.error('❌ Error fetching programs:', pError)
      return
    }

    console.log('✅ Found programs:', programs)

    const academicYears = [
      { name: '2022-2023' },
      { name: '2023-2024' },
      { name: '2024-2025' }
    ]

    const allYearRecords = []

    // 2. For each program, insert academic years
    for (const program of programs) {
      for (const year of academicYears) {
        allYearRecords.push({
          name: year.name,
          program_id: program.id
        })
      }
    }

    // 3. Insert all year_academic records
    const { data: insertedYears, error: insertError } = await supabase
      .from('year_academic')
      .upsert(allYearRecords, { onConflict: 'name' })
      .select()

    if (insertError) {
      console.error('❌ Error inserting academic years:', insertError)
      return
    }

    console.log('✅ Academic years seeded:', insertedYears.length, 'records')

    // 4. Now seed year levels for each academic year
    const { data: yearAcademics, error: fetchError } = await supabase
      .from('year_academic')
      .select('id')

    if (fetchError) {
      console.error('❌ Error fetching academic years:', fetchError)
      return
    }

    const yearLevels = [
      'FIRST YEAR',
      'SECOND YEAR',
      'THIRD YEAR',
      'FOURTH YEAR'
    ]

    const allYearLevelRecords = []

    for (const academicYear of yearAcademics) {
      for (const level of yearLevels) {
        allYearLevelRecords.push({
          academic_year_id: academicYear.id,
          year_level: level
        })
      }
    }

    // Update existing years table with academic year mapping
    // (This depends on your current schema)
    
    console.log('✅ Seeding complete!')
    console.log(`   - ${Object.keys(programs).length} Programs`)
    console.log(`   - ${insertedYears.length} Academic Years`)
    console.log(`   - Ready to add ${allYearLevelRecords.length} Year Levels`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

seedAcademicYears()
