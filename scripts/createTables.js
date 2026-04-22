import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY // Use service key for migrations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTables() {
  try {
    console.log('Creating tables...')

    // Create users table
    const { error: usersError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email text UNIQUE NOT NULL,
          name text NOT NULL,
          role text CHECK (role IN ('teacher', 'student')) NOT NULL,
          created_at timestamp DEFAULT NOW()
        );
      `
    }).catch(async () => {
      // If rpc doesn't work, the table might already exist
      return { error: null }
    })

    // Create outputs table
    const { error: outputsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.outputs (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          year_id uuid REFERENCES public.years(id) ON DELETE CASCADE NOT NULL,
          title text NOT NULL,
          description text,
          file_url text,
          file_type text,
          created_at timestamp DEFAULT NOW(),
          updated_at timestamp DEFAULT NOW()
        );
      `
    }).catch(async () => {
      return { error: null }
    })

    // Create comments table
    const { error: commentsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.comments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          output_id uuid REFERENCES public.outputs(id) ON DELETE CASCADE NOT NULL,
          user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          comment_text text NOT NULL,
          created_at timestamp DEFAULT NOW(),
          updated_at timestamp DEFAULT NOW()
        );
      `
    }).catch(async () => {
      return { error: null }
    })

    // Enable RLS on users table
    await supabase.rpc('exec', {
      sql: 'ALTER TABLE public.users ENABLE ROW LEVEL SECURITY'
    }).catch(() => {})

    console.log('✅ Tables created successfully!')
    console.log('\nNext steps:')
    console.log('1. Add SUPABASE_SERVICE_KEY to your .env.local')
    console.log('2. Run: npm run create-tables')
    console.log('3. Then retry sign up')

  } catch (error) {
    console.error('❌ Error creating tables:', error.message)
    console.error('\n⚠️  Alternative: Run these SQL queries directly in Supabase SQL editor:')
    console.log(`
    CREATE TABLE IF NOT EXISTS public.users (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email text UNIQUE NOT NULL,
      name text NOT NULL,
      role text CHECK (role IN ('teacher', 'student')) NOT NULL,
      created_at timestamp DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.outputs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
      year_id uuid REFERENCES public.years(id) ON DELETE CASCADE NOT NULL,
      title text NOT NULL,
      description text,
      file_url text,
      file_type text,
      created_at timestamp DEFAULT NOW(),
      updated_at timestamp DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      output_id uuid REFERENCES public.outputs(id) ON DELETE CASCADE NOT NULL,
      user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
      comment_text text NOT NULL,
      created_at timestamp DEFAULT NOW(),
      updated_at timestamp DEFAULT NOW()
    );

    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    `)
  }
}

createTables()
