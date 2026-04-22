'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleForgotPassword = async () => {
  if (!formData.email) {
    setError('Please enter your email first.')
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    setError('Please enter a valid email address.')
    return
  }

  setLoading(true)
  setError('')
  setSuccess('')

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.email,
      {
        redirectTo: 'http://localhost:3000/reset-password',
      }
    )

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Password reset link sent to your email.')
    }
  } catch (err) {
    setError('Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  setSuccess('')

  // ── VALIDATIONS ─────────────────────────────
  if (isSignUp) {
    if (!formData.name.trim()) {
      setError('Please enter your full name.')
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }

    if (!formData.password) {
      setError('Please enter your password.')
      setLoading(false)
      return
    }
  } else {
    if (!formData.email.trim()) {
      setError('Please enter your email address.')
      setLoading(false)
      return
    }

    if (!formData.password) {
      setError('Please enter your password.')
      setLoading(false)
      return
    }
  }

  try {
    let result

    if (isSignUp) {
      result = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      )

      if (result.success) {
        setSuccess(`✓ Account created! Welcome, ${formData.name}!`)
        setFormData({
          email: '',
          password: '',
          name: '',
          role: 'student'
        })

        setTimeout(() => {
          setIsSignUp(false)
          setSuccess('')
        }, 3000)
      } else {
        setError(result.error || 'Sign up failed.')
      }
    } else {
      result = await signIn(formData.email, formData.password)

      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Invalid login credentials.')
      }
    }
  } catch (err) {
    setError('An unexpected error occurred.')
  } finally {
    setLoading(false)
  }

  // ── Validations ──────────────────────────────────────────
  if (isSignUp) {
    if (!formData.name.trim()) {
      setError('Please enter your full name.')
      setLoading(false); return
    }
    if (formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters.')
      setLoading(false); return
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address.')
      setLoading(false); return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.')
      setLoading(false); return
    }
    if (!formData.password) {
      setError('Please enter a password.')
      setLoading(false); return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false); return
    }
  } else {
    if (!formData.email.trim()) {
      setError('Please enter your email address.')
      setLoading(false); return
    }
    if (!formData.password) {
      setError('Please enter your password.')
      setLoading(false); return
    }
  }

  try {
    let result
    if (isSignUp) {
      result = await signUp(formData.email, formData.password, formData.name, formData.role)
      if (result.success) {
        setSuccess(`✓ Account created! Welcome, ${formData.name}!`)
        setFormData({ email: '', password: '', name: '', role: 'student' })
        setTimeout(() => { setIsSignUp(false); setSuccess('') }, 3000)
      } else {
        // Friendly error messages
        if (result.error?.includes('already registered') || result.error?.includes('already exists')) {
          setError('This email is already registered. Please sign in instead.')
        } else if (result.error?.includes('rate limit')) {
          setError('Too many attempts. Please wait a moment and try again.')
        } else if (result.error?.includes('foreign key') || result.error?.includes('fkey')) {
          setError('Account setup failed. Please try again or contact admin.')
        } else {
          setError(result.error || 'Something went wrong. Please try again.')
        }
      }
    } else {
      result = await signIn(formData.email, formData.password)
      if (result.success) {
        router.push('/dashboard')
      } else {
        if (result.error?.includes('Invalid login') || result.error?.includes('invalid_credentials')) {
          setError('Incorrect email or password. Please try again.')
        } else if (result.error?.includes('Email not confirmed')) {
          setError('Please confirm your email first before signing in.')
        } else if (result.error?.includes('rate limit')) {
          setError('Too many login attempts. Please wait a moment.')
        } else {
          setError(result.error || 'Sign in failed. Please try again.')
        }
      }
    }
  } catch (err) {
    setError('An unexpected error occurred. Please try again.')
  } finally {
    setLoading(false)
  }
}

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 antialiased'

  return (
    <div className="min-h-screen flex font-sans antialiased">

      {/* LEFT SIDE */}
      <div className="w-1/2 relative flex flex-col items-center justify-center text-white p-10 overflow-hidden">

        {/* Background image (50% opacity FIXED) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/school_building.jfif')",
            opacity: 0.5
          }}
        />

        {/* linear overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 40%, #1e40af 100%)",
            opacity: 0.6,
          }}
        />


        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center">

          {/* TOP LOGO */}
          <img
            src="/images/logo.png"
            alt="logo"
            className="w-28 mb-6 drop-shadow-lg"
          />

          {/* TITLE */}
          <h1 className="text-2xl font-bold tracking-wide">
            BCAEd Repository
          </h1>

          <p className="text-sm mt-1 text-white/90">
            Colegio de la Ciudad de Tayabas
          </p>

          <p className="text-xs mt-2 text-white/80 tracking-widest">
            Music • Dance • Drama • Visual Arts
          </p>

          {/* BOTTOM LOGOS */}
          <div className="flex gap-6 mt-10 items-center">

            <img
              src="/images/school_logo.jfif"
              alt="school"
              className="w-16 h-16 rounded-full bg-white p-1 shadow-lg"
            />

            <img
              src="/images/tayabas_logo.jfif"
              alt="tayabas"
              className="w-16 h-16 rounded-full bg-white p-1 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50 p-10">

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

          {/* HEADER */}
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            {isSignUp ? 'Create Account' : 'Login'}
          </h2>

          {/* ERROR */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="bg-green-100 text-green-600 p-3 rounded mb-4 text-sm">
              {success}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ROLE */}
            {isSignUp && (
              <div>
                <p className="text-sm font-medium mb-2 text-gray-700">
                  I am a:
                </p>

                <div className="flex gap-3">
                  {['student', 'teacher'].map((role) => (
                    <label
                      key={role}
                      className={`flex-1 text-center p-3 rounded-lg border cursor-pointer transition select-none ${
                        formData.role === role
                          ? 'bg-indigo-100 border-indigo-500 text-gray-900'
                          : 'border-gray-300 text-gray-700 hover:border-indigo-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={formData.role === role}
                        onChange={handleChange}
                        className="hidden"
                      />

                      <span className="capitalize text-sm font-medium">
                        {role}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}


            {/* NAME */}
            {isSignUp && (
              <input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
              />
            )}

            {/* EMAIL */}
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />

            {/* PASSWORD */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={inputClass}
            />

            {/* FORGOT PASSWORD */}
            {!isSignUp && (
              <div className="text-right -mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}


            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {loading
                ? 'Processing...'
                : isSignUp
                ? 'Create Account'
                : 'Login'}
            </button>
          </form>

          {/* SWITCH */}
          <p className="text-center text-sm mt-5 text-gray-600">
            {isSignUp
              ? 'Already have an account?'
              : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
                setSuccess('')
              }}
              className="text-indigo-600 font-semibold"
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </button>
          </p>

          {/* FOOTER */}
          <p className="text-center text-xs text-gray-400 mt-6">
            © 2026 Bachelor of Culture and Arts Education
          </p>

        </div>
      </div>
    </div>
  )
}
