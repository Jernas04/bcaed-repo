'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Service role client bypasses RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function createUserProfile(userId, email, name, role) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert([{
        id: userId,
        email,
        name,
        role,
        created_at: new Date()
      }], { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error

    return { success: true, profile: data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

