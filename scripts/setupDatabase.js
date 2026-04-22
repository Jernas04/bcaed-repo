import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createTables() {
  try {
    // These queries should be run in Supabase SQL editor directly
    // This script documents the schema needed

    console.log(`
    ============================================
    CREATE TABLE users (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email text UNIQUE NOT NULL,
      name text NOT NULL,
      role text CHECK (role IN ('teacher', 'student')) NOT NULL,
      created_at timestamp DEFAULT NOW()
    );

    CREATE TABLE outputs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      year_id uuid REFERENCES years(id) ON DELETE CASCADE NOT NULL,
      title text NOT NULL,
      description text,
      file_url text,
      file_type text,
      created_at timestamp DEFAULT NOW(),
      updated_at timestamp DEFAULT NOW()
    );

    CREATE TABLE comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      output_id uuid REFERENCES outputs(id) ON DELETE CASCADE NOT NULL,
      user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
      comment_text text NOT NULL,
      created_at timestamp DEFAULT NOW(),
      updated_at timestamp DEFAULT NOW()
    );

    CREATE TABLE year_academic (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text UNIQUE NOT NULL,
      program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
      created_at timestamp DEFAULT NOW()
    );

    -- Add column to years table if not exists
    ALTER TABLE years ADD COLUMN academic_year_id uuid REFERENCES year_academic(id) ON DELETE CASCADE;
    ============================================
    `)

    // Add RLS policies
    console.log('\nApplying RLS Policies...')

    // Enable RLS
    await supabase.rpc('exec', {
      sql: 'ALTER TABLE users ENABLE ROW LEVEL SECURITY'
    }).catch(() => {})

    console.log('✅ Schema documented. Please run the SQL queries in Supabase SQL editor.')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createTables()
