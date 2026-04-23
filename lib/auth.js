import { supabase } from './supabase'
import { createUserProfile } from '@/app/actions/auth'

export async function signUp(email, password, name, role) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`, // ✅ Dagdag ito
        data: {
          name,
          role
        }
      }
    })

    if (authError) {
      if (authError.message?.includes('rate limit')) {
        throw new Error('Too many sign-up requests. Please wait a moment and try again.')
      }
      throw authError
    }

    // ✅ Check muna kung kailangan ng email confirmation
    // Kung may session agad = email confirmation disabled (okay to create profile)
    // Kung walang session = kailangan pang mag-confirm ng email
    if (!authData.session) {
      // Email confirmation required — huwag muna mag-create ng profile
      // Gagawin yan sa callback/webhook after confirmation
      return { 
        success: true, 
        user: authData.user, 
        requiresConfirmation: true 
      }
    }

    // Only runs if email confirmation is DISABLED in Supabase
    const profileResult = await createUserProfile(
      authData.user.id,
      email,
      name,
      role
    )

    if (!profileResult.success) {
      throw new Error(profileResult.error)
    }

    return { success: true, user: authData.user, profile: profileResult.profile }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      if (error.message?.includes('rate limit')) {
        throw new Error('Too many login attempts. Please wait a moment and try again.')
      }
      throw error
    }

    // Get or create user profile
    let profile = null
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError && !profileError.message?.includes('No rows found')) {
      if (profileError.message?.includes('public.users')) {
        throw new Error('Database not configured. Please contact admin.')
      }
      throw profileError
    }

    // If profile doesn't exist, create one using server action
    if (!existingProfile) {
      const profileResult = await createUserProfile(
        data.user.id,
        email,
        data.user.user_metadata?.name || email.split('@')[0],
        data.user.user_metadata?.role || 'student'
      )

      if (!profileResult.success) {
        console.error('Error creating user profile:', profileResult.error)
        throw new Error(profileResult.error)
      }
      profile = profileResult.profile
    } else {
      profile = existingProfile
    }

    return { success: true, user: data.user, profile }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    if (!user) return null

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    return { ...user, profile }
  } catch (error) {
    return null
  }
}
