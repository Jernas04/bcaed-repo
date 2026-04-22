import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function migrate() {
  console.log("Fetching old categories...")

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')

  if (error) {
    console.error(error)
    return
  }

  console.log("Found:", categories.length)

  // STEP 1: unique programs
  const programsMap = {}

  for (const item of categories) {
    programsMap[item.program] = true
  }

  const programs = Object.keys(programsMap)

  console.log("Inserting programs...")

  const { data: insertedPrograms, error: pError } = await supabase
    .from('programs')
    .insert(
      programs.map(name => ({ name }))
    )
    .select()

  if (pError) {
    console.error(pError)
    return
  }

  console.log("Programs inserted")

  // STEP 2: insert years
  console.log("Inserting years...")

  const yearsData = []

  for (const cat of categories) {
    const program = insertedPrograms.find(p => p.name === cat.program)

    yearsData.push({
      program_id: program.id,
      year_level: cat.year_level
    })
  }

  const { data: years, error: yError } = await supabase
    .from('years')
    .insert(yearsData)
    .select()

  if (yError) {
    console.error(yError)
    return
  }

  console.log("Migration done ✅")
}

migrate()
