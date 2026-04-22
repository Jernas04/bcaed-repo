import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function addDescriptionColumn() {
  try {
    console.log("Adding description column to contents table...")
    
    // To add a column via SQL, we use the admin client or raw SQL
    // Since we only have the anon client, we'll log instructions
    console.log(`
Please run this SQL in your Supabase SQL Editor:

ALTER TABLE contents 
ADD COLUMN description TEXT DEFAULT NULL;

Steps:
1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Paste the SQL above
5. Click "Run"
    `)
    
  } catch (error) {
    console.error("Error:", error.message)
  }
}

addDescriptionColumn()
